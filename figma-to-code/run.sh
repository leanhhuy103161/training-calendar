#!/bin/bash
set -e

# Figma Extractor - Pure Data Extraction
# Usage: ./run.sh <nodeId> [--depth=8] [--scale=2] [--svg] [--out=output]

NODE_ID=$1

if [ -z "$NODE_ID" ]; then
  echo ""
  echo "  Figma Extractor - Pure Data Extraction"
  echo "  ======================================="
  echo ""
  echo "  Usage: ./run.sh <nodeId> [options]"
  echo ""
  echo "  Options:"
  echo "    --depth=N   Max tree depth (default: 8)"
  echo "    --scale=N   Screenshot scale (default: 2)"
  echo "    --svg       Export vector nodes as SVG"
  echo "    --out=DIR   Output directory (default: output)"
  echo ""
  echo "  Examples:"
  echo "    ./run.sh 9:2"
  echo "    ./run.sh 9:2 --depth=4 --scale=3"
  echo "    ./run.sh 9:2 --svg --out=my-output"
  echo ""
  exit 1
fi

shift
node figma-extractor.js "$NODE_ID" "$@"
