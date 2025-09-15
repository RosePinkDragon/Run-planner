# AGENTS.md

## Project Overview

Run-planner is a web application built with React and Vite, designed to help users plan and track running activities. The project uses TypeScript for type safety and maintainability. The main source code is located in the `src/` directory, with UI components organized under `src/components/ui/`.

## Project Structure

- `src/` — Main source code
  - `App.tsx` — Main application component
  - `main.tsx` — Entry point
  - `components/ui/` — Reusable UI components (color mode, provider, toaster, tooltip)
- `public/` — Static assets
- `index.html` — Main HTML file
- `package.json` — Project dependencies and scripts
- `vite.config.ts` — Vite configuration
- `tsconfig*.json` — TypeScript configuration files

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

## Code Style Guidelines

- Use TypeScript for all source files.
- Follow the ESLint rules defined in `eslint.config.js`.
- Organize UI components under `src/components/ui/`.
- Use functional components and hooks for React code.

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
