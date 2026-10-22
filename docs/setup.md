# Setting up the project

## 1. Install Vite+

We run everything through the [Vite+](https://viteplus.dev/guide/) CLI - `vp`. Install it once per machine:

```sh
# macOS / Linux
curl -fsSL https://vite.plus | bash

# Windows (PowerShell)
irm https://vite.plus/ps1 | iex
```

Open a new terminal and check that `vp --version` works. You don't need to install Node.js or pnpm yourself, `vp` downloads the versions the project needs.

## 2. Install dependencies

In the project folder:

```sh
vp install
```

This also turns on the pre-commit hook. The `prepare` script in `package.json` runs `vp config`, which points git at the hooks in `.vite-hooks/`. Check that it worked:

```sh
vp hooks status
```

It should say `Dispatcher: installed`. The `.vite-hooks/_` folder it creates is generated and ignored by git.

If you cloned the project before the hook existed, run `vp install` again. That also installs any dependencies added since then.

## 3. Run the game

```sh
vp dev
```

and open the address it prints.

## The pre-commit hook

Before every commit, `.vite-hooks/pre-commit` runs the same checks as CI:

```sh
vp test
vp lint --deny-warnings
vp fmt --check
```

If any of them fails, the commit is rejected. They check the whole project, not just the files you staged, so an unformatted file you haven't added yet will still block the commit.

To fix what they complain about, run `vp fmt` for formatting and `vp lint --fix` for the lint issues it can fix on its own.

### Skipping the hook

`main` doesn't pass `vp lint` yet, because of type errors left over from the move from JS to TS. Until that's fixed, commit with:

```sh
git commit --no-verify
```

If your git client can't pass that flag, set `VP_GIT_HOOKS=0` in its environment instead.

To turn the hook off in your clone for good, run `vp hooks disable`. It stays off after later installs, until you run `vp hooks enable`.

## Editor

In VS Code, install the [Vite Plus Extension Pack](https://marketplace.visualstudio.com/items?itemName=VoidZero.vite-plus-extension-pack), set Oxc as the default formatter and turn on format on save. Then `vp fmt --check` won't catch you out.
