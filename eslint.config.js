import tseslint from "typescript-eslint";

// Mise en place du lint — ticket INFRA-212.
// Regles minimales sans nouvelle dependance : bannir les echappatoires de types.
export default [
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { ecmaVersion: "latest", sourceType: "module" }
    },
    plugins: { "@typescript-eslint": tseslint.plugin },
    rules: {
      "@typescript-eslint/ban-ts-comment": "error",
      "@typescript-eslint/no-explicit-any": "warn"
    }
  }
];
