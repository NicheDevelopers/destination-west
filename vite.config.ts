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
    plugins: ["typescript", "unicorn", "oxc", "import"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
      "import/extensions": ["error", { js: "never", ts: "never" }],
    },
    options: { typeAware: true, typeCheck: true },
    overrides: [
      {
        files: ["src/lib/**"],
        rules: {
          "no-restricted-imports": [
            "error",
            {
              patterns: [
                {
                  group: ["@/engine/**", "@/game/**"],
                  message: "lib/ can't depend on engine/ or game/.",
                },
              ],
            },
          ],
        },
      },
      {
        files: ["src/engine/**"],
        rules: {
          "no-restricted-imports": [
            "error",
            {
              patterns: [
                {
                  group: ["@/game/**"],
                  message: "engine/ can't depend on game/.",
                },
              ],
            },
          ],
        },
      },
    ],
  },
});
