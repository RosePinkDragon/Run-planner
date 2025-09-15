# AGENTS.md

## Project Overview

Run-planner is a web application built with React and Vite to plan and track running activities. It uses TypeScript throughout and Chakra UI v3 for the UI. Data is stored locally in the browser (localStorage). The app now includes a calendar to plan future runs and an Excel (XLSX) importer to bring in training plans.

## Project Structure

- `src/` — Main source code
  - `App.tsx` — Main application component
  - `main.tsx` — Entry point
  - `pages/`
    - `Home.tsx` — Main page with List/Calendar views, import/export actions
  - `components/`
    - `AddEditRunForm.tsx` — Drawer form to create/edit runs (supports initialDate, planned status)
    - `CalendarView.tsx` — Monthly calendar with per-day planning and "Plan +" action
    - `FiltersBar.tsx`, `RunsTable.tsx`, `StatsCards.tsx` — List view UI
    - `ui/` — Reusable Chakra-based primitives (dialog, drawer, provider, etc.)
  - `lib/`
    - `calc.ts`, `time.ts`, `storage.ts` — Utilities
    - `excel.ts` — XLSX import helper for planned runs
  - `store/`
    - `runs.tsx` — React context for run data (local DB v1)
- `public/` — Static assets
- `index.html` — Main HTML file
- `package.json` — Project dependencies and scripts
- `vite.config.ts` — Vite configuration
- `tsconfig*.json` — TypeScript configuration files

## Key Features

- Plan runs on a monthly calendar with a one-click "Plan +" per day
- Track completed runs in a list with filters and stats
- Excel (XLSX) import for planned/actual runs
- CSV and JSON export/import
- Fully local: data saved to localStorage (no backend)

## Data Model (Local DB v1)

Type: `RunEntry`

- `id: string`
- `date: string` (YYYY-MM-DD)
- `distanceKm: number`
- `durationSec: number`
- `paceSecPerKm: number` (derived)
- `type: "Easy" | "Tempo" | "Intervals" | "Hill" | "Long" | "Recovery" | "Strength"`
- `rpe?: number`
- `tags?: string[]`
- `notes?: string`
- `status?: "planned" | "done"` — optional; defaults to `"done"` for existing flows

Notes:

- Stats and summary cards exclude runs with `status === "planned"`.
- Import/merge preserves any provided `status`.

## Build and Test Commands

- **Install dependencies:**

  ```bash
  bun install
  ```

- **Start development server:**

  ```bash
  bun run dev
  ```

- **Build for production:**

  ```bash
  bun run build
  ```

- **Run tests:**

  ```bash
  bun run test
  ```

## Usage

1. Start the dev server and open the app.
2. Use the header buttons to switch between List and Calendar.
3. In Calendar view, click "Plan +" on any date to add a planned run. The drawer form is prefilled with the selected date and saves runs with `status = "planned"`.
4. Planned runs appear under "Planned" in each calendar day. Completed runs appear under "Completed".
5. In List view, add/edit runs as usual; these default to `status = "done"`.
6. Use Export CSV/JSON to back up data. Import JSON supports Merge (dedupe by id) or Replace (overwrite all).
7. Use Import Excel to bring in plans from `.xlsx` files.

## Import/Export Formats

- JSON (Local DB v1)

  - Shape: `{ version: 1, runs: RunEntry[] }`
  - Import modes: Merge (keeps existing, adds new by non-duplicate id) or Replace (overwrites all)

- CSV Export

  - Columns: `date,distance_km,duration_sec,pace_sec_per_km,type,rpe,tags,notes,status`
  - `status` is included so planned/done is preserved

- Excel (XLSX) Import
  - Reads the first worksheet
  - Supported columns (case-sensitive):
    - `date` (YYYY-MM-DD)
    - `distance_km`
    - `duration_sec`
    - `type` (one of the supported RunType values)
    - `rpe` (1-10)
    - `tags` (comma or semicolon separated)
    - `notes`
    - `status` (optional; `planned` or `done`; defaults to `planned` if missing)
  - Unknown/missing columns are ignored

## Dependencies

- React + Vite + TypeScript
- Chakra UI v3
- `xlsx` for Excel parsing

## Code Style Guidelines

- Use TypeScript for all source files.
- Follow the ESLint rules defined in `eslint.config.js`.
- Organize reusable primitives under `src/components/ui/` and feature components under `src/components/`.
- Use functional components and hooks for React code.

Strict TypeScript is enabled (`strict: true`). Use explicit types for callbacks to avoid implicit `any`.

## Testing Instructions

- Place test files alongside source files or in a dedicated test directory if added.
- Run tests using the provided command above.
- Ensure new features and bug fixes include relevant tests.

## Security Considerations

- Do not commit secrets or sensitive data.
- Review dependencies for vulnerabilities before adding.
- Follow best practices for handling user input and authentication (if applicable).

## Commit and Pull Request Guidelines

- **Commit style for agents:**
  - Use the format: `copilot/rest-of-title`
- Write clear, concise commit messages describing the change.
- Reference related issues or pull requests when relevant.
- Ensure all tests pass before submitting a pull request.

## Deployment Steps

- Build the project using the production build command.
- Deploy the contents of the `dist/` directory to your hosting provider.

## Additional Notes

- For large datasets or assets, use external storage and reference them in the documentation.
- Update this file with any new instructions or guidelines as the project evolves.

## Chakra UI v3 Reference for Agents

### Chakra UI v3 Documentation for LLMs

> Chakra UI is an accessible component system for building products with speed

#### Documentation Sets

- [Complete documentation](https://chakra-ui.com/llms-full.txt): The complete Chakra UI v3 documentation including all components, styling and theming
- [Components](https://chakra-ui.com/llms-components.txt): Documentation for all components in Chakra UI v3.
- [Charts](https://chakra-ui.com/llms-charts.txt): Documentation for the charts in Chakra UI v3.
- [Styling](https://chakra-ui.com/llms-styling.txt): Documentation for the styling system in Chakra UI v3.
- [Theming](https://chakra-ui.com/llms-theming.txt): Documentation for theming Chakra UI v3.
- [Migrating to v3](https://chakra-ui.com/llms-v3-migration.txt): Documentation for migrating to Chakra UI v3.

#### Notes

- The complete documentation includes all content from the official documentation
- Package-specific documentation files contain only the content relevant to that package
- The content is automatically generated from the same source as the official documentation
