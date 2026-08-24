# Basic Rules for this Repository

These are the base instructions for all AI work in this repository.

## Project context

- This is a React 19 + Vite application.
- UI is built with Material UI.
- Routing uses `react-router-dom`.
- Authentication uses Auth0 in `src/main.jsx`.
- Shared UI components live under `src\components\common`.
- Theme setup lives in `src\theme\getAppTheme.js`.
- API access should go through `src\api\httpClient.js` unless there is a clear reason not to.

## Mandatory working rules

- Keep changes focused and do not modify unrelated files.
- Follow the existing code style already used in the repo.
- Prefer function components, hooks, and existing React patterns in the codebase.
- Reuse existing shared components before creating new ones.
- Preserve lazy-loaded route structure in `src\App.jsx` unless a route change is required.
- Keep light and dark theme behavior working when editing UI.
- Use `import.meta.env` for Vite environment variables and keep the `VITE_` prefix convention.
- Do not hardcode secrets, tokens, domains, or client IDs.
- Prefer updating existing files over adding new abstractions when the current structure is sufficient.
- Keep components small and readable; extract shared logic only when it is reused or clearly improves clarity.

## Agent mode shell access rules

- Assume shell or run-command access is not allowed unless the user clearly says otherwise.
- Do not ask for Run Command permission during normal agent-mode work.
- If command execution is needed, ask the user to run the command separately and share the console output or the output file path.
- Avoid asking for multiple command runs unless they are genuinely necessary.

## File and structure guidance

- Put route pages in `src\pages`.
- Put reusable presentational or layout components in `src\components\common` unless a better existing folder already fits.
- Put API client and request helpers in `src\api`.
- Keep theme-related changes inside `src\theme` and compatible with Material UI theming.
- If a new asset is needed, place it under the existing asset structure in `src\assets` or `public` as appropriate.

## Quality expectations

- Prefer accessible Material UI components and semantic React markup.
- Avoid breaking existing navigation, authentication flow, and theme toggling.
- When changing UI, keep responsiveness in mind.
- When changing API behavior, preserve current defaults like JSON content type and request timeout unless the task requires otherwise.

## Validation checklist

- Run the existing project scripts after changes when command execution is available:
  - `npm run lint`
  - `npm run build`
