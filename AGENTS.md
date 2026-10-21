# Destination West

A western adventure game that runs in the browser. Everything is drawn on one `<canvas>`, there's no framework and no runtime dependencies. It starts in `index.js`, which runs `src/game/main.ts`.

## Commands

We use [Vite+](https://viteplus.dev/guide/), so run everything through `vp`, not `npm`, `pnpm` or `npx`. Docs are in `node_modules/vite-plus/docs`.

```sh
vp install   # dependencies
vp dev       # dev server
vp test      # tests
vp check     # format + lint + type check
vp fmt       # format only
```

CI and the pre-commit hook (`.vite-hooks/pre-commit`) run `vp lint --deny-warnings`, `vp fmt --check` and `vp test`. We're halfway through moving from JS to TS, so `vp check` already shows errors on `main`. Just don't add new ones to the files you change.

## Where things are

- `src/engine/`: game loop, rendering, input, states, sprites, audio playback, movement, hitboxes, tiles, base `Entity`, debug view
- `src/game/`: Destination West itself, one folder per feature (`Entity/`, `Location/`, `Dialogue/`, `Combat/`, ...), plus game data (`consts.ts`, `items.ts`, `imgInfo.ts`, keybinds)
- `src/lib/`: generic helpers that don't know about the engine or the game
- Imports only go `game → engine → lib`. Lint enforces it.
- `src/game/Dialogue/*.dwd`: dialogues in our own format, imported with `?raw`
- `public/`: images and sounds
- `styles/`: CSS, pulled in by `main.css`

## Writing code

Write code someone new to the project can read top to bottom and understand the first time.

- Use plain loops, `if`s and early returns. If a one-liner, nested ternary or chain of calls takes effort to read, write it out over a few lines instead.
- No base class, factory, generic or option until there's a second thing that actually needs it.
- No exports or types nobody uses, no wrapper functions called once, no checks for things that can't happen, no type gymnastics when a plain type works.
- Name things well enough that they don't need a comment.
- Don't add comments or JSDoc that repeat what the code says, but leave existing ones alone.

## Cleanup

When you work on something, clean up the code you're in:

- Rename unclear variables.
- Split long functions.
- Delete dead code and unused imports.

Keep the cleanup to the functions and files you're already changing. If you notice something bigger, or something outside what you're working on, don't fix it on the side. Mention it at the end so it can be done separately, even if nobody asked.

## Conventions

- Write new files in TS.
- Use the `@/` alias for imports from other folders (`@/game/Game`) and `./` within the same folder. Leave out the `.js`/`.ts` extension.
- Import from `vite-plus` and `vite-plus/test`, not `vite` or `vitest`.
- Tests go next to the code they test, as `*.test.ts`.
- Private members in TS are `private x`, not `_x`.
- Some code checks `constructor.name` at runtime, so renaming a class can break things.

## Moving a file from JS to TS

Split it into separate commits so `git log --follow` still works and each diff is easy to review:

1. `git mv x.js x.ts` and commit just the rename.
2. Add types without changing the logic.
3. Clean up, if needed.

## Git

- Never commit unless explicitly asked to. Leave changes in the working tree for review.
- The repo is on GitLab.
- Branches are named `<issue>-short-name`.
- Commit messages look like `<issue>: Add thing`.
- No `Co-Authored-By` or other AI attribution lines.
