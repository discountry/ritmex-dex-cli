# Repository Guidelines

Bun + Ink drive this CLI for monitoring exchange funding. The runtime now follows a modular layout: UI in `src/components`, orchestration hooks in `src/hooks`, HTTP clients under `src/services/http`, shared helpers inside `src/utils`, and domain contracts in `src/types`. Keep `index.tsx` as composition glue only.

## Project Structure & Module Organization
- `components/`: stateless Ink views (`Header`, `FundingTable`, `Footer`, `InkTable`). Accept data via props; never fetch or mutate state here.
- `hooks/`: feature logic (`useEdgexFunding`, `useLighterFunding`, `useFundingRows`, `useTableSorting`, `useKeyboardNavigation`, etc.). Prefer composing hooks to layering conditionals inside components.
- `services/http/`: provider-specific clients (`edgex.ts`, `lighter.ts`) that expose typed fetch functions with no caller-side caching.
- `utils/`: cross-cutting helpers (`constants`, `format`, `table`, `time`, `snapshot`). Add new utilities here to avoid duplication.
- `types/`: source-of-truth TypeScript models re-exported via `types/index.ts`. Update these first when API payloads shift.
- `data/`: stores persisted funding snapshots for fast startup; regenerate whenever API shapes change.

## Build, Test, and Development Commands
- `bun install` syncs dependencies.
- `bun start` (alias of `bun run index.tsx`) launches the Ink interface.
- `bunx --bun tsc --noEmit` must pass before committing. Add `bun test` suites once they exist.

## Coding Style & Naming Conventions
- TypeScript ESNext modules, 2-space indent, and named exports. Avoid default exports to keep imports explicit.
- Files use `kebab-case`. Components and hooks follow `PascalCase`/`camelCase` (`useFundingRows`). Constants live in `UPPER_SNAKE_CASE`.
- Hooks should manage one concern, expose plain return objects, and handle async flows with `async/await` plus typed results.
- UI components render only; pass derived strings or numbers from hooks/utilities.

## Testing Guidelines
- Co-locate tests (e.g., `src/hooks/__tests__/useEdgexFunding.test.ts`). Stub HTTP layers; never call live exchanges.
- Validate behaviour: refresh cadence, throttling, snapshot persistence, formatting. Cover error states alongside happy paths.

## Commit & Pull Request Guidelines
- Use Conventional Commit prefixes (`feat:`, `fix:`, `chore:`, `refactor:`) with ≤72 char imperative messages.
- PRs should summarize the user-facing change, list touched hooks/services/utils, and paste representative CLI output when UI shifts.
- Explicitly mention snapshot or constant updates. Confirm `bunx --bun tsc --noEmit` and a manual `bun start` run (or automated tests when available).
