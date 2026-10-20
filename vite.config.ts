import { defineConfig } from "vite-plus";

export default defineConfig({
  base: "./",
  resolve: { tsconfigPaths: true },
  build: {
    // Game code compares `constructor.name` at runtime; minification would mangle it.
    rolldownOptions: { output: { keepNames: true } },
  },
  fmt: {},
  lint: {
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
