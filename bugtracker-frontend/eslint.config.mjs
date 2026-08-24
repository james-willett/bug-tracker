import nextPlugin from "@next/eslint-plugin-next";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      ".next/**",
      "coverage/**",
      "node_modules/**",
      "test-results.xml",
    ],
  },
  ...tseslint.configs.recommended,
  nextPlugin.configs["core-web-vitals"],
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    plugins: {
      "react-hooks": reactHooks,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-hooks/set-state-in-effect": "off",
    },
    settings: {
      next: {
        rootDir: ["."],
      },
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "jest.setup.js"],
    languageOptions: {
      globals: globals.jest,
    },
    rules: {
      "@next/next/no-img-element": "off",
    },
  },
  {
    files: ["src/__mocks__/**/*.{ts,tsx}"],
    rules: {
      "@next/next/no-img-element": "off",
    },
  }
);
