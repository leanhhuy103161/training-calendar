import type { UserConfig } from '@commitlint/types'

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      ['feat', 'fix', 'chore', 'test', 'docs', 'refactor', 'perf', 'ci'],
    ],
    'scope-enum': [
      2,
      'always',
      ['react-app', 'host', 'dashboard', 'shared', 'e2e', 'docker', 'ci', 'figma'],
    ],
    'scope-empty': [2, 'never'],
    'subject-case': [2, 'always', 'lower-case'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
  },
}

export default config
