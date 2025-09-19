# Repository Guidelines

This guide supports contributors working on the Ritmex DEX CLI. The project uses Bun as the runtime and Ink for building interactive terminal views, so align your workflows with Bun's tooling and TypeScript strict mode.

## Project Structure & Module Organization
The CLI entry point lives in `index.ts`, currently emitting placeholder output but intended to host Ink render logic. Domain data snapshots in `data/` (such as `getLatestFundingRate.json`) provide deterministic fixtures; update them whenever API shapes change. Supplementary walkthroughs belong in `docs/`, while `tsconfig.json` defines bundler-style module resolution—new source files should import modules via relative or package paths compatible with that setup.

## Build, Test, and Development Commands
Run `bun install` after cloning to sync dependencies. `bun run index.ts` executes the CLI locally; pass any new CLI flags the same way you expect end users to do so. For static analysis, run `bunx --bun tsc --noEmit` to type-check against the strict configuration. Once tests exist, execute `bun test` (Bun’s native test runner) for fast feedback.

## Coding Style & Naming Conventions
Use TypeScript with ESNext modules and 2-space indentation. Prefer `camelCase` for variables and functions, `PascalCase` for Ink components, and keep file names kebab-case (`wallet-details.ts`). Avoid default exports to preserve tree-shakeable imports. Leverage async/await and ensure Promise-returning helpers are typed explicitly, benefiting from `noUncheckedIndexedAccess`.

## Testing Guidelines
Place new test files alongside the code under `__tests__` folders or `*.test.ts` siblings; mock network calls with fixtures from `data/`. Structure tests around CLI behaviours rather than implementation details, and assert on rendered Ink output or stdout. Keep coverage meaningful—exercise happy paths, error handling, and data formatting.

## Commit & Pull Request Guidelines
No historical conventions exist yet, so adopt Conventional Commit prefixes (`feat:`, `fix:`, `chore:`) followed by an imperative summary under 72 characters. Reference related issues in the body and note any data fixture updates. Pull requests should outline the user-facing impact, attach sample CLI output when relevant, and confirm `bun run index.ts` plus type-checks/tests were executed.
