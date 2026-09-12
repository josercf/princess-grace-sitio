import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules', 'public/assets/generated', 'playwright-report', 'test-results'] },
  ...tseslint.configs.recommended,
);
