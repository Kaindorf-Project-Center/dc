// eslint.config.mjs
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import unusedImports from "eslint-plugin-unused-imports";

export default [
  // Ignore output and deps
  { ignores: ["dist/**", "node_modules/**"] },

  // Base JS rules
  js.configs.recommended,

  // TypeScript support (ESLint v9 + flat config)
  ...tseslint.configs.recommendedTypeChecked,

  // Project-wide defaults (applies to all files unless overridden)
  {
    rules: {
      "arrow-spacing": ["warn", { before: true, after: true }],
      "brace-style": ["error", "1tbs", { allowSingleLine: true }],
      "comma-dangle": ["error", "always-multiline"],
      "comma-spacing": "error",
      "comma-style": "error",
      "dot-location": ["error", "property"],
      "handle-callback-err": "off",
      indent: ["error", "tab"],
      "keyword-spacing": "error",
      "max-nested-callbacks": ["error", { max: 4 }],
      "max-statements-per-line": ["error", { max: 2 }],
      "no-console": "off",
      "no-empty-function": "error",
      "no-floating-decimal": "error",
      "no-inline-comments": "error",
      "no-lonely-if": "error",
      "no-multi-spaces": "error",
      "no-multiple-empty-lines": ["error", { max: 2, maxEOF: 1, maxBOF: 0 }],
      "no-shadow": ["error", { allow: ["err", "resolve", "reject"] }],
      "no-trailing-spaces": "error",
      "no-var": "error",
      "object-curly-spacing": ["error", "always"],
      "prefer-const": "error",
      quotes: ["error", "single"],
      semi: ["error", "always"],
      "space-before-blocks": "error",
      "space-before-function-paren": [
        "error",
        { anonymous: "never", named: "never", asyncArrow: "always" },
      ],
      "space-in-parens": "error",
      "space-infix-ops": "error",
      "space-unary-ops": "error",
      "spaced-comment": "error",
      yoda: "error",
    },
  },

  // JS files (optional: keep for explicitness)
  {
    files: ["**/*.{js,cjs,mjs}"],
    languageOptions: {
      ecmaVersion: 2021,
      sourceType: "module",
      globals: { ...globals.node },
    },
  },

  // TS files
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tseslint.parser,
      // Prefer the new projectService (auto-detects your tsconfig)
      parserOptions: {
        projectService: true,
        // If needed, you can fall back to:
        // project: ['./tsconfig.json'],
        // tsconfigRootDir: import.meta.dirname,
      },
      ecmaVersion: 2021,
      sourceType: "module",
      globals: { ...globals.node },
    },
    plugins: {
      "@typescript-eslint": tseslint.plugin,
      "unused-imports": unusedImports,
    },
    rules: {
      // Good TS ergonomics
      "@typescript-eslint/consistent-type-imports": "error",

      // Use the fixer-capable unused imports plugin
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
    },
  },
];
