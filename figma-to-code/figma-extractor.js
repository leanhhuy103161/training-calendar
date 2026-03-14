/**
 * Figma Extractor - Pure Data Extraction Layer
 *
 * Extracts EVERYTHING useful from Figma REST API:
 *   - Full node tree with all visual properties
 *   - Design tokens (colors, fonts, spacing, radii, borders, shadows, opacity, gradients)
 *   - Component map (instances, variant props)
 *   - Asset catalog (images, icons, vectors)
 *   - Layout intelligence (constraints, sizing, auto-layout)
 *   - Typography catalog (all unique style combos)
 *   - Text content catalog
 *   - Screenshot(s)
 *   - Optional SVG export for vector nodes
 *
 * NO prompt logic. NO opinions. Just data.
 */

require('dotenv').config();
var fs = require('fs');
var path = require('path');

var fetch = function() {
  var args = Array.prototype.slice.call(arguments);
  return import('node-fetch').then(function(mod) { return mod.default.apply(null, args); });
};

var TOKEN = process.env.FIGMA_TOKEN;
var FILE_KEY = process.env.FIGMA_FILE_KEY;

function assertEnv() {
  if (!TOKEN) throw new Error('Missing FIGMA_TOKEN in .env');
  if (!FILE_KEY) throw new Error('Missing FIGMA_FILE_KEY in .env');
}

async function figmaGet(endpoint) {
  var res = await fetch('https://api.figma.com/v1' + endpoint, {
    headers: { 'X-Figma-Token': TOKEN },
  });
  if (!res.ok) {
    var body = await res.text();
    throw new Error('Figma API error ' + res.status + ': ' + body);
  }
  return res.json();
}

// --- Color Utilities ---

function rgbaToHex(r, g, b, a) {
  function toHex(v) { return Math.round(v * 255).toString(16).padStart(2, '0'); }
  var hex = '#' + toHex(r) + toHex(g) + toHex(b);
  var opacity = +(a != null ? a : 1).toFixed(2);
  return { hex: hex, opacity: opacity };
}

function rgbaToCSS(r, g, b, a) {
  var ri = Math.round(r * 255);
  var gi = Math.round(g * 255);
  var bi = Math.round(b * 255);
  var ai = +(a != null ? a : 1).toFixed(2);
  if (ai === 1) return 'rgb(' + ri + ', ' + gi + ', ' + bi + ')';
  return 'rgba(' + ri + ', ' + gi + ', ' + bi + ', ' + ai + ')';
}

// --- Paint Parsers ---

function parsePaint(paint) {
  if (!paint || paint.visible === false) return null;

  if (paint.type === 'SOLID' && paint.color) {
    var r = paint.color.r, g = paint.color.g, b = paint.color.b, a = paint.color.a;
    var result = rgbaToHex(r, g, b, a);
    var paintOpacity = +(paint.opacity != null ? paint.opacity : 1).toFixed(2);
    return {
      type: 'SOLID',
      hex: result.hex,
      opacity: paintOpacity,
      colorOpacity: result.opacity,
      css: rgbaToCSS(r, g, b, (paint.opacity != null ? paint.opacity : 1) * (a != null ? a : 1)),
    };
  }

  if (paint.type === 'GRADIENT_LINEAR' || paint.type === 'GRADIENT_RADIAL' ||
      paint.type === 'GRADIENT_ANGULAR' || paint.type === 'GRADIENT_DIAMOND') {
    return {
      type: paint.type,
      opacity: +(paint.opacity != null ? paint.opacity : 1).toFixed(2),
      stops: (paint.gradientStops || []).map(function(s) {
        return {
          position: +s.position.toFixed(3),
          color: s.color ? rgbaToHex(s.color.r, s.color.g, s.color.b, s.color.a) : null,
          css: s.color ? rgbaToCSS(s.color.r, s.color.g, s.color.b, s.color.a) : null,
        };
      }),
      handlePositions: paint.gradientHandlePositions || null,
    };
  }

  if (paint.type === 'IMAGE') {
    return {
      type: 'IMAGE',
      scaleMode: paint.scaleMode || 'FILL',
      imageRef: paint.imageRef || null,
      opacity: +(paint.opacity != null ? paint.opacity : 1).toFixed(2),
    };
  }

  return { type: paint.type };
}

function parseAllPaints(fills) {
  if (!Array.isArray(fills) || fills.length === 0) return null;
  var parsed = fills.filter(function(f) { return f.visible !== false; }).map(parsePaint).filter(Boolean);
  return parsed.length > 0 ? parsed : null;
}

// --- Typography Parser ---

function parseTypography(style) {
  if (!style) return null;
  return {
    fontFamily: style.fontFamily || null,
    fontSize: style.fontSize || null,
    fontWeight: style.fontWeight || null,
    fontStyle: style.italic ? 'italic' : 'normal',
    lineHeightPx: style.lineHeightPx || null,
    lineHeightPercent: style.lineHeightPercent || null,
    lineHeightUnit: style.lineHeightUnit || null,
    letterSpacing: style.letterSpacing || 0,
    textAlignHorizontal: style.textAlignHorizontal || null,
    textAlignVertical: style.textAlignVertical || null,
    textDecoration: style.textDecoration || 'NONE',
    textCase: style.textCase || 'ORIGINAL',
    textAutoResize: style.textAutoResize || null,
    paragraphSpacing: style.paragraphSpacing || 0,
  };
}

// --- Stroke Parser ---

function parseStrokes(node) {
  if (!node.strokes || node.strokes.length === 0) return null;
  var visibleStrokes = node.strokes.filter(function(s) { return s.visible !== false; });
  if (visibleStrokes.length === 0) return null;

  return visibleStrokes.map(function(s) {
    var paint = parsePaint(s);
    var out = {};
    if (paint) { for (var k in paint) out[k] = paint[k]; }
    out.weight = node.strokeWeight != null ? node.strokeWeight : 1;
    out.strokeAlign = node.strokeAlign || 'INSIDE';
    out.individualWeights = node.individualStrokeWeights || null;
    out.dashPattern = node.strokeDashes || null;
    out.strokeCap = node.strokeCap || null;
    out.strokeJoin = node.strokeJoin || null;
    return out;
  });
}

// --- Effects Parser ---

function parseEffects(node) {
  if (!node.effects || node.effects.length === 0) return null;
  var visibleEffects = node.effects.filter(function(e) { return e.visible !== false; });
  if (visibleEffects.length === 0) return null;

  return visibleEffects.map(function(effect) {
    var base = { type: effect.type };

    if (effect.type === 'DROP_SHADOW' || effect.type === 'INNER_SHADOW') {
      var color = effect.color
        ? rgbaToHex(effect.color.r, effect.color.g, effect.color.b, effect.color.a)
        : null;
      var cssColor = effect.color
        ? rgbaToCSS(effect.color.r, effect.color.g, effect.color.b, effect.color.a)
        : null;
      var x = (effect.offset && effect.offset.x) || 0;
      var y = (effect.offset && effect.offset.y) || 0;
      var blur = effect.radius || 0;
      var spread = effect.spread || 0;
      var inset = effect.type === 'INNER_SHADOW' ? 'inset ' : '';

      return {
        type: base.type,
        color: color,
        cssColor: cssColor,
        offset: { x: x, y: y },
        radius: blur,
        spread: spread,
        css: inset + x + 'px ' + y + 'px ' + blur + 'px ' + spread + 'px ' + cssColor,
      };
    }

    if (effect.type === 'LAYER_BLUR' || effect.type === 'BACKGROUND_BLUR') {
      var r = effect.radius || 0;
      return {
        type: base.type,
        radius: r,
        css: effect.type === 'BACKGROUND_BLUR'
          ? 'backdrop-filter: blur(' + r + 'px)'
          : 'filter: blur(' + r + 'px)',
      };
    }

    return base;
  });
}

// --- Constraints & Sizing Parser ---

function parseConstraints(node) {
  var out = {};

  if (node.constraints) {
    out.horizontal = node.constraints.horizontal || null;
    out.vertical = node.constraints.vertical || null;
  }

  if (node.layoutSizingHorizontal) out.sizingHorizontal = node.layoutSizingHorizontal;
  if (node.layoutSizingVertical) out.sizingVertical = node.layoutSizingVertical;
  if (node.layoutPositioning === 'ABSOLUTE') out.positioning = 'ABSOLUTE';

  if (node.minWidth) out.minWidth = node.minWidth;
  if (node.maxWidth) out.maxWidth = node.maxWidth;
  if (node.minHeight) out.minHeight = node.minHeight;
  if (node.maxHeight) out.maxHeight = node.maxHeight;

  if (node.layoutGrow !== undefined && node.layoutGrow !== 0) out.layoutGrow = node.layoutGrow;
  if (node.layoutAlign && node.layoutAlign !== 'INHERIT') out.layoutAlign = node.layoutAlign;

  return Object.keys(out).length > 0 ? out : null;
}

// --- Auto-Layout Parser ---

function parseAutoLayout(node) {
  if (!node.layoutMode || node.layoutMode === 'NONE') return null;

  return {
    direction: node.layoutMode === 'HORIZONTAL' ? 'row' : 'column',
    gap: node.itemSpacing != null ? node.itemSpacing : 0,
    padding: {
      top: node.paddingTop || 0,
      right: node.paddingRight || 0,
      bottom: node.paddingBottom || 0,
      left: node.paddingLeft || 0,
    },
    counterAxisAlignItems: node.counterAxisAlignItems || null,
    primaryAxisAlignItems: node.primaryAxisAlignItems || null,
    counterAxisAlignContent: node.counterAxisAlignContent || null,
    wrap: node.layoutWrap || 'NO_WRAP',
    counterAxisSpacing: node.counterAxisSpacing != null ? node.counterAxisSpacing : null,
    primaryAxisSizingMode: node.primaryAxisSizingMode || null,
    counterAxisSizingMode: node.counterAxisSizingMode || null,
  };
}

// --- Token Collector ---

function TokenCollector() {
  this.colors = new Map();
  this.gradients = [];
  this.fonts = new Map();
  this.typographyStyles = [];
  this.spacing = new Set();
  this.radii = new Set();
  this.borderWidths = new Set();
  this.effects = [];
  this.opacities = new Set();
  this.sizes = { widths: new Set(), heights: new Set() };
  this.images = [];
  this.textContent = [];
}

TokenCollector.prototype.addColor = function(hex, opacity, context) {
  if (!hex) return;
  var key = opacity < 1 ? hex + '/' + opacity : hex;
  var existing = this.colors.get(key) || { hex: hex, opacity: opacity, count: 0, contexts: [] };
  existing.count++;
  if (context && existing.contexts.length < 5 && existing.contexts.indexOf(context) === -1) {
    existing.contexts.push(context);
  }
  this.colors.set(key, existing);
};

TokenCollector.prototype.addGradient = function(gradient) {
  if (!gradient) return;
  var key = JSON.stringify(gradient.stops);
  var found = this.gradients.find(function(g) { return JSON.stringify(g.stops) === key; });
  if (!found) this.gradients.push(gradient);
};

TokenCollector.prototype.addFont = function(fontFamily, fontSize, fontWeight, fontStyle) {
  if (!fontFamily) return;
  if (!fontStyle) fontStyle = 'normal';
  var existing = this.fonts.get(fontFamily) || { weights: new Set(), sizes: new Set(), styles: new Set() };
  if (fontWeight) existing.weights.add(fontWeight);
  if (fontSize) existing.sizes.add(fontSize);
  if (fontStyle) existing.styles.add(fontStyle);
  this.fonts.set(fontFamily, existing);
};

TokenCollector.prototype.addTypographyStyle = function(typo) {
  if (!typo || !typo.fontFamily) return;
  var key = typo.fontFamily + '|' + typo.fontSize + '|' + typo.fontWeight + '|' + typo.lineHeightPx;
  var found = this.typographyStyles.find(function(t) {
    return t.fontFamily + '|' + t.fontSize + '|' + t.fontWeight + '|' + t.lineHeightPx === key;
  });
  if (!found) this.typographyStyles.push(typo);
};

TokenCollector.prototype.addSpacing = function(v) { if (typeof v === 'number' && v > 0) this.spacing.add(v); };
TokenCollector.prototype.addRadius = function(v) { if (typeof v === 'number' && v > 0) this.radii.add(v); };
TokenCollector.prototype.addBorderWidth = function(v) { if (typeof v === 'number' && v > 0) this.borderWidths.add(v); };
TokenCollector.prototype.addOpacity = function(v) { if (typeof v === 'number' && v < 1 && v > 0) this.opacities.add(+(v).toFixed(2)); };
TokenCollector.prototype.addSize = function(w, h) {
  if (typeof w === 'number' && w > 0) this.sizes.widths.add(w);
  if (typeof h === 'number' && h > 0) this.sizes.heights.add(h);
};
TokenCollector.prototype.addEffect = function(effect) {
  if (!effect) return;
  var key = effect.css || JSON.stringify(effect);
  var found = this.effects.find(function(e) { return (e.css || JSON.stringify(e)) === key; });
  if (!found) this.effects.push(effect);
};
TokenCollector.prototype.addImage = function(imageRef, nodeName) {
  if (!imageRef) return;
  if (!this.images.find(function(i) { return i.imageRef === imageRef; })) {
    this.images.push({ imageRef: imageRef, nodeName: nodeName });
  }
};
TokenCollector.prototype.addText = function(text, nodeName) {
  if (!text) return;
  this.textContent.push({ text: text, nodeName: nodeName });
};

TokenCollector.prototype.toJSON = function() {
  var colors = Array.from(this.colors.values())
    .sort(function(a, b) { return b.count - a.count; })
    .map(function(c) { return { hex: c.hex, opacity: c.opacity, usageCount: c.count, contexts: c.contexts }; });

  var fonts = {};
  var googleFontsLinks = [];
  for (var entry of this.fonts.entries()) {
    var family = entry[0], data = entry[1];
    var weights = Array.from(data.weights).sort(function(a, b) { return a - b; });
    var sizes = Array.from(data.sizes).sort(function(a, b) { return a - b; });
    var styles = Array.from(data.styles);
    fonts[family] = { weights: weights, sizes: sizes, styles: styles };

    var hasItalic = styles.indexOf('italic') !== -1;
    var weightsParam = weights.length > 0 ? weights.join(';') : '400';
    var encodedFamily = family.replace(/\s+/g, '+');
    if (hasItalic) {
      var italicWeights = weights.map(function(w) { return '0,' + w; })
        .concat(weights.map(function(w) { return '1,' + w; })).join(';');
      googleFontsLinks.push('https://fonts.googleapis.com/css2?family=' + encodedFamily + ':ital,wght@' + italicWeights + '&display=swap');
    } else {
      googleFontsLinks.push('https://fonts.googleapis.com/css2?family=' + encodedFamily + ':wght@' + weightsParam + '&display=swap');
    }
  }

  var typographyStyles = this.typographyStyles.slice().sort(function(a, b) { return (a.fontSize || 0) - (b.fontSize || 0); });

  return {
    colors: colors,
    gradients: this.gradients,
    fonts: fonts,
    googleFontsLinks: googleFontsLinks,
    typographyStyles: typographyStyles,
    spacing: Array.from(this.spacing).sort(function(a, b) { return a - b; }),
    borderRadii: Array.from(this.radii).sort(function(a, b) { return a - b; }),
    borderWidths: Array.from(this.borderWidths).sort(function(a, b) { return a - b; }),
    effects: this.effects,
    opacities: Array.from(this.opacities).sort(function(a, b) { return a - b; }),
    sizes: {
      widths: Array.from(this.sizes.widths).sort(function(a, b) { return a - b; }),
      heights: Array.from(this.sizes.heights).sort(function(a, b) { return a - b; }),
    },
    images: this.images,
    textContent: this.textContent,
  };
};

// --- Component Map Collector ---

function ComponentMapCollector() {
  this.instances = [];
}

ComponentMapCollector.prototype.addInstance = function(node) {
  this.instances.push({
    instanceId: node.id,
    instanceName: node.name,
    componentId: node.componentId || null,
  });
};

ComponentMapCollector.prototype.toJSON = function() {
  var byComponent = {};
  for (var i = 0; i < this.instances.length; i++) {
    var inst = this.instances[i];
    var key = inst.componentId || inst.instanceName;
    if (!byComponent[key]) {
      byComponent[key] = { componentId: inst.componentId, instanceName: inst.instanceName, count: 0, instances: [] };
    }
    byComponent[key].count++;
    byComponent[key].instances.push(inst.instanceId);
  }
  return {
    totalInstances: this.instances.length,
    uniqueComponents: Object.keys(byComponent).length,
    components: Object.values(byComponent).sort(function(a, b) { return b.count - a.count; }),
  };
};

// --- Node Parser (Maximum Data Extraction) ---

function parseNode(node, depth, maxDepth, collectors) {
  var tokens = collectors.tokens;
  var components = collectors.components;

  var out = { id: node.id, name: node.name, type: node.type };

  if (node.visible === false) out.visible = false;

  // Bounding box
  if (node.absoluteBoundingBox) {
    var bb = node.absoluteBoundingBox;
    out.box = { x: Math.round(bb.x), y: Math.round(bb.y), width: Math.round(bb.width), height: Math.round(bb.height) };
    if (tokens) tokens.addSize(Math.round(bb.width), Math.round(bb.height));
  }

  // Render bounds (actual rendered area including effects like shadows)
  if (node.absoluteRenderBounds) {
    var rb = node.absoluteRenderBounds;
    out.renderBox = { x: Math.round(rb.x), y: Math.round(rb.y), width: Math.round(rb.width), height: Math.round(rb.height) };
  }

  // Opacity
  if (node.opacity !== undefined && node.opacity !== 1) {
    out.opacity = +(node.opacity).toFixed(2);
    if (tokens) tokens.addOpacity(node.opacity);
  }

  // Blend mode
  if (node.blendMode && node.blendMode !== 'NORMAL' && node.blendMode !== 'PASS_THROUGH') {
    out.blendMode = node.blendMode;
  }

  // Clip content (overflow: hidden)
  if (node.clipsContent === true) out.clipsContent = true;

  // Rotation
  if (node.rotation && node.rotation !== 0) out.rotation = +(node.rotation).toFixed(2);

  // Auto-Layout
  var autoLayout = parseAutoLayout(node);
  if (autoLayout) {
    out.autoLayout = autoLayout;
    if (tokens) {
      tokens.addSpacing(autoLayout.gap);
      tokens.addSpacing(autoLayout.padding.top);
      tokens.addSpacing(autoLayout.padding.right);
      tokens.addSpacing(autoLayout.padding.bottom);
      tokens.addSpacing(autoLayout.padding.left);
      if (autoLayout.counterAxisSpacing) tokens.addSpacing(autoLayout.counterAxisSpacing);
    }
  }

  // Constraints & Sizing
  var constraints = parseConstraints(node);
  if (constraints) out.constraints = constraints;

  // Fills (all layers, not just first)
  var fills = parseAllPaints(node.fills);
  if (fills) {
    out.fills = fills;
    for (var fi = 0; fi < fills.length; fi++) {
      var f = fills[fi];
      if (f.type === 'SOLID' && tokens) {
        tokens.addColor(f.hex, f.colorOpacity * f.opacity, node.name + ' fill');
      }
      if (f.type && f.type.indexOf('GRADIENT') === 0 && tokens) {
        tokens.addGradient(f);
        for (var si = 0; si < (f.stops || []).length; si++) {
          if (f.stops[si].color) tokens.addColor(f.stops[si].color.hex, f.stops[si].color.opacity, node.name + ' gradient');
        }
      }
      if (f.type === 'IMAGE' && tokens) {
        tokens.addImage(f.imageRef, node.name);
      }
    }
  }

  // Strokes
  var strokes = parseStrokes(node);
  if (strokes) {
    out.strokes = strokes;
    for (var sti = 0; sti < strokes.length; sti++) {
      if (tokens) {
        if (strokes[sti].hex) tokens.addColor(strokes[sti].hex, strokes[sti].colorOpacity || 1, node.name + ' border');
        tokens.addBorderWidth(strokes[sti].weight);
      }
    }
  }

  // Corner Radius
  if (node.cornerRadius !== undefined && node.cornerRadius !== 0) {
    out.cornerRadius = node.cornerRadius;
    if (tokens) tokens.addRadius(node.cornerRadius);
  }
  if (node.rectangleCornerRadii) {
    var cr = node.rectangleCornerRadii;
    out.cornerRadii = { topLeft: cr[0], topRight: cr[1], bottomRight: cr[2], bottomLeft: cr[3] };
    if (tokens) { cr.forEach(function(r) { tokens.addRadius(r); }); }
  }

  // Effects (shadows, blur)
  var effects = parseEffects(node);
  if (effects) {
    out.effects = effects;
    if (tokens) effects.forEach(function(e) { tokens.addEffect(e); });
  }

  // Text Nodes
  if (node.type === 'TEXT') {
    out.characters = node.characters || '';
    out.typography = parseTypography(node.style);

    var textFills = parseAllPaints(node.fills);
    if (textFills) {
      out.textFills = textFills;
      for (var tfi = 0; tfi < textFills.length; tfi++) {
        if (textFills[tfi].type === 'SOLID' && tokens) {
          tokens.addColor(textFills[tfi].hex, textFills[tfi].colorOpacity * textFills[tfi].opacity, node.name + ' text');
        }
      }
    }

    if (node.style && node.style.textTruncation) out.textTruncation = node.style.textTruncation;
    if (node.style && node.style.maxLines) out.maxLines = node.style.maxLines;

    if (tokens) {
      tokens.addFont(
        node.style ? node.style.fontFamily : null,
        node.style ? node.style.fontSize : null,
        node.style ? node.style.fontWeight : null,
        node.style && node.style.italic ? 'italic' : 'normal'
      );
      tokens.addTypographyStyle(out.typography);
      tokens.addText(node.characters, node.name);
    }
  }

  // Component Instance
  if (node.type === 'INSTANCE') {
    out.componentId = node.componentId || null;
    if (node.componentProperties) out.componentProperties = node.componentProperties;
    if (components) components.addInstance(node);
  }

  // Boolean Operation
  if (node.type === 'BOOLEAN_OPERATION') {
    out.booleanOperation = node.booleanOperation || null;
  }

  // Vector hint
  if (node.type === 'VECTOR' || node.type === 'LINE' || node.type === 'ELLIPSE' ||
      node.type === 'REGULAR_POLYGON' || node.type === 'STAR') {
    out.isVector = true;
  }

  // Children
  if (!node.children || node.children.length === 0) return out;

  if (depth >= maxDepth) {
    out.children = node.children.map(function(c) {
      return {
        id: c.id, name: c.name, type: c.type,
        box: c.absoluteBoundingBox ? { width: Math.round(c.absoluteBoundingBox.width), height: Math.round(c.absoluteBoundingBox.height) } : undefined,
        _truncated: true,
      };
    });
    return out;
  }

  out.children = node.children
    .map(function(c) { return parseNode(c, depth + 1, maxDepth, collectors); })
    .filter(function(c) { return c.visible !== false; });

  return out;
}

// --- Screenshot Download ---

async function downloadScreenshot(nodeId, outputDir, scale) {
  var img = await figmaGet('/images/' + FILE_KEY + '?ids=' + encodeURIComponent(nodeId) + '&format=png&scale=' + scale);
  var imageUrl = (img.images && img.images[nodeId]) || (img.images && img.images[nodeId.replace(':', '-')]);
  if (!imageUrl) throw new Error('Could not get screenshot URL for nodeId=' + nodeId);

  var imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error('Failed to download screenshot: ' + imgRes.status);

  var buffer = Buffer.from(await imgRes.arrayBuffer());
  var screenshotPath = path.join(outputDir, 'screenshot.png');
  fs.writeFileSync(screenshotPath, buffer);
  return screenshotPath;
}

// --- SVG Export for Vectors/Icons ---

async function exportVectorNodes(vectorNodeIds, outputDir) {
  if (vectorNodeIds.length === 0) return [];

  var ids = vectorNodeIds.join(',');
  var svgData = await figmaGet('/images/' + FILE_KEY + '?ids=' + encodeURIComponent(ids) + '&format=svg');
  var exported = [];

  var imageKeys = Object.keys(svgData.images || {});
  for (var i = 0; i < imageKeys.length; i++) {
    var nid = imageKeys[i];
    var svgUrl = svgData.images[nid];
    if (!svgUrl) continue;
    try {
      var res = await fetch(svgUrl);
      if (!res.ok) continue;
      var svg = await res.text();
      var safeName = nid.replace(/[^a-zA-Z0-9]/g, '_');
      var svgPath = path.join(outputDir, 'assets', safeName + '.svg');
      fs.mkdirSync(path.dirname(svgPath), { recursive: true });
      fs.writeFileSync(svgPath, svg);
      exported.push({ nodeId: nid, path: svgPath });
    } catch (err) { /* skip */ }
  }

  return exported;
}

function collectVectorIds(node, result) {
  if (!result) result = [];
  if (node.isVector) result.push(node.id);
  if (node.children) node.children.forEach(function(c) { collectVectorIds(c, result); });
  return result;
}

// --- Build Summary (Markdown) ---

function buildSummary(meta, tokens, componentMap) {
  var t = tokens;
  var L = [];

  L.push('# Figma Extract: ' + meta.rootName);
  L.push('> Node: `' + meta.nodeId + '` | File: `' + meta.fileKey + '` | Extracted: ' + meta.extractedAt);
  if (meta.rootSize) L.push('> Size: ' + meta.rootSize.width + ' x ' + meta.rootSize.height + ' | Depth: ' + meta.maxDepth + ' | Scale: ' + meta.scale + 'x');
  L.push('');

  if (t.colors && t.colors.length > 0) {
    L.push('## Colors');
    L.push('| Hex | Opacity | Usage | Context |');
    L.push('|-----|---------|-------|---------|');
    t.colors.slice(0, 25).forEach(function(c) { L.push('| `' + c.hex + '` | ' + c.opacity + ' | ' + c.usageCount + 'x | ' + c.contexts.join(', ') + ' |'); });
    L.push('');
  }

  if (t.gradients && t.gradients.length > 0) {
    L.push('## Gradients');
    t.gradients.forEach(function(g) {
      var s = g.stops.map(function(s) { return (s.css || (s.color && s.color.hex) || '?') + ' @ ' + (s.position * 100).toFixed(0) + '%'; }).join(' -> ');
      L.push('- **' + g.type + '**: ' + s);
    });
    L.push('');
  }

  if (t.fonts && Object.keys(t.fonts).length > 0) {
    L.push('## Fonts');
    Object.keys(t.fonts).forEach(function(f) { L.push('- **' + f + '**: weights `' + t.fonts[f].weights.join(', ') + '` | sizes `' + t.fonts[f].sizes.join(', ') + '`px'); });
    L.push('');
  }

  if (t.googleFontsLinks && t.googleFontsLinks.length > 0) {
    L.push('## Google Fonts');
    L.push('```html');
    t.googleFontsLinks.forEach(function(u) { L.push('<link href="' + u + '" rel="stylesheet">'); });
    L.push('```');
    L.push('');
  }

  if (t.typographyStyles && t.typographyStyles.length > 0) {
    L.push('## Typography Styles');
    L.push('| Font | Size | Weight | Line Height | Letter Spacing | Align |');
    L.push('|------|------|--------|-------------|----------------|-------|');
    t.typographyStyles.forEach(function(ts) {
      var lh = ts.lineHeightPx ? ts.lineHeightPx.toFixed(1) + 'px' : '-';
      L.push('| ' + ts.fontFamily + ' | ' + ts.fontSize + 'px | ' + ts.fontWeight + ' | ' + lh + ' | ' + (ts.letterSpacing || 0) + ' | ' + (ts.textAlignHorizontal || '-') + ' |');
    });
    L.push('');
  }

  L.push('## Spacing & Dimensions');
  L.push('- **Spacing**: ' + (t.spacing.length ? t.spacing.join(', ') : 'none') + ' px');
  L.push('- **Border radii**: ' + (t.borderRadii.length ? t.borderRadii.join(', ') : 'none') + ' px');
  L.push('- **Border widths**: ' + (t.borderWidths.length ? t.borderWidths.join(', ') : 'none') + ' px');
  L.push('- **Opacities**: ' + (t.opacities.length ? t.opacities.join(', ') : 'none'));
  L.push('');

  if (t.effects && t.effects.length > 0) {
    L.push('## Effects');
    t.effects.forEach(function(e) { L.push('- **' + e.type + '**: `' + (e.css || JSON.stringify(e)) + '`'); });
    L.push('');
  }

  if (componentMap && componentMap.totalInstances > 0) {
    L.push('## Component Instances');
    L.push('Total: ' + componentMap.totalInstances + ' | Unique: ' + componentMap.uniqueComponents);
    L.push('');
    componentMap.components.forEach(function(c) { L.push('- **' + c.instanceName + '** (x' + c.count + ') -- id: `' + (c.componentId || 'N/A') + '`'); });
    L.push('');
  }

  if (t.textContent && t.textContent.length > 0) {
    L.push('## Text Content');
    L.push('| Node | Text |');
    L.push('|------|------|');
    t.textContent.forEach(function(tc) { L.push('| ' + tc.nodeName + ' | ' + tc.text.replace(/\|/g, '\\|').replace(/\n/g, ' // ') + ' |'); });
    L.push('');
  }

  if (t.images && t.images.length > 0) {
    L.push('## Images / Assets');
    t.images.forEach(function(im) { L.push('- **' + im.nodeName + '**: imageRef `' + im.imageRef + '`'); });
    L.push('');
  }

  L.push('## Output Files');
  L.push('| File | Description |');
  L.push('|------|-------------|');
  L.push('| `structure.json` | Full Figma node tree with all visual properties |');
  L.push('| `tokens.json` | Design tokens (colors, fonts, spacing, effects, text) |');
  L.push('| `component-map.json` | Component instances & reuse analysis |');
  L.push('| `screenshot.png` | Visual reference |');
  L.push('| `summary.md` | This file |');

  return L.join('\n');
}

// --- Main Extract Function ---

async function extractNode(nodeId, options) {
  assertEnv();
  if (!options) options = {};
  var maxDepth = options.maxDepth || 8;
  var scale = options.scale || 2;
  var exportSvg = options.exportSvg || false;
  var outputDir = options.outputDir || 'output';

  fs.mkdirSync(outputDir, { recursive: true });

  var tokens = new TokenCollector();
  var components = new ComponentMapCollector();

  console.log('   Fetching node data from Figma API...');
  var nodes = await figmaGet('/files/' + FILE_KEY + '/nodes?ids=' + encodeURIComponent(nodeId));
  var rawNode = nodes.nodes && nodes.nodes[nodeId] && nodes.nodes[nodeId].document;
  if (!rawNode) throw new Error('Node not found: ' + nodeId);

  console.log('   Parsing node tree...');
  var structure = parseNode(rawNode, 0, maxDepth, { tokens: tokens, components: components });

  console.log('   Downloading screenshot...');
  var screenshotPath = await downloadScreenshot(nodeId, outputDir, scale);

  var exportedAssets = [];
  if (exportSvg) {
    var vectorIds = collectVectorIds(structure);
    if (vectorIds.length > 0) {
      console.log('   Exporting ' + vectorIds.length + ' vectors as SVG...');
      exportedAssets = await exportVectorNodes(vectorIds, outputDir);
    }
  }

  var tokensData = tokens.toJSON();
  var componentMap = components.toJSON();

  var meta = {
    fileKey: FILE_KEY,
    nodeId: nodeId,
    extractedAt: new Date().toISOString(),
    rootName: structure.name,
    rootType: structure.type,
    rootSize: structure.box ? { width: structure.box.width, height: structure.box.height } : null,
    maxDepth: maxDepth,
    scale: scale,
  };

  console.log('   Writing output files...');

  fs.writeFileSync(path.join(outputDir, 'structure.json'), JSON.stringify({ meta: meta, structure: structure }, null, 2));
  fs.writeFileSync(path.join(outputDir, 'tokens.json'), JSON.stringify(tokensData, null, 2));
  fs.writeFileSync(path.join(outputDir, 'component-map.json'), JSON.stringify(componentMap, null, 2));

  var summary = buildSummary(meta, tokensData, componentMap);
  fs.writeFileSync(path.join(outputDir, 'summary.md'), summary);

  return {
    meta: meta, structure: structure, tokens: tokensData,
    componentMap: componentMap, screenshotPath: screenshotPath, exportedAssets: exportedAssets,
  };
}

// --- CLI Entry Point ---

async function main() {
  var args = process.argv.slice(2);
  var flags = {};
  var positional = [];

  for (var i = 0; i < args.length; i++) {
    if (args[i].indexOf('--') === 0) {
      var parts = args[i].slice(2).split('=');
      flags[parts[0]] = parts[1] || 'true';
    } else {
      positional.push(args[i]);
    }
  }

  var nodeId = positional[0];
  if (!nodeId) {
    console.error('Usage: node figma-extractor.js <nodeId> [--depth=8] [--scale=2] [--svg] [--out=output]');
    process.exit(1);
  }

  var options = {
    maxDepth: parseInt(flags.depth || '8', 10),
    scale: parseInt(flags.scale || '2', 10),
    exportSvg: flags.svg === 'true',
    outputDir: flags.out || 'output',
  };

  console.log('');
  console.log('========================================');
  console.log('  Figma Extractor - Pure Data Layer');
  console.log('========================================');
  console.log('  Node:  ' + nodeId);
  console.log('  Depth: ' + options.maxDepth + ' | Scale: ' + options.scale + 'x | SVG: ' + options.exportSvg);
  console.log('');

  var result = await extractNode(nodeId, options);

  console.log('');
  console.log('  Done! Root: ' + result.meta.rootName + ' (' + result.meta.rootType + ')');
  if (result.meta.rootSize) console.log('  Size: ' + result.meta.rootSize.width + ' x ' + result.meta.rootSize.height);
  console.log('  Colors:     ' + result.tokens.colors.length);
  console.log('  Fonts:      ' + Object.keys(result.tokens.fonts).length);
  console.log('  Typography: ' + result.tokens.typographyStyles.length + ' unique styles');
  console.log('  Spacing:    ' + result.tokens.spacing.length + ' values');
  console.log('  Components: ' + result.componentMap.totalInstances + ' instances, ' + result.componentMap.uniqueComponents + ' unique');
  console.log('  Text nodes: ' + result.tokens.textContent.length);
  if (result.tokens.effects.length > 0) console.log('  Effects:    ' + result.tokens.effects.length);
  if (result.tokens.gradients.length > 0) console.log('  Gradients:  ' + result.tokens.gradients.length);
  if (result.tokens.images.length > 0) console.log('  Images:     ' + result.tokens.images.length);
  console.log('');
  console.log('  Output:');
  console.log('    ' + options.outputDir + '/structure.json     - Full node tree');
  console.log('    ' + options.outputDir + '/tokens.json        - Design tokens');
  console.log('    ' + options.outputDir + '/component-map.json - Component analysis');
  console.log('    ' + options.outputDir + '/screenshot.png     - Visual reference');
  console.log('    ' + options.outputDir + '/summary.md         - Human-readable summary');
  if (result.exportedAssets.length > 0) console.log('    ' + options.outputDir + '/assets/            - ' + result.exportedAssets.length + ' SVG exports');
  console.log('');
}

main().catch(function(e) {
  console.error('Error: ' + e.message);
  process.exit(1);
});

module.exports = { extractNode: extractNode };
