# Maplestreet

Next.js App Router boilerplate with React, strict TypeScript, ESLint, and Vitest with React Testing Library.

## Getting started

Use Node.js **26.13.1**, pinned in `.nvmrc`, `.node-version`, and `package.json`.

```sh
nvm install
nvm use
npm install
npm run dev
```

Open http://localhost:3000. Edit `src/app/page.tsx` to begin.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build |
| `npm start` | Serve the production build after building |
| `npm test` | Run Vitest once, suitable for CI |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run lint` | Run ESLint |
| `npm run typecheck` | Check TypeScript types |

## Market data

Set `MAPLESTREET_ITEMS_API` in `.env` to the items API URL. Next.js reads this value on the server; the browser requests `/api/items` without receiving the configured URL. A local address without a scheme is treated as HTTP.

The API must return a JSON array of objects with `name` (string) and `usual` (number or string). The market table displays these as Name and Price, preserving string prices and formatting numeric prices with digit grouping. The table uses the shared Card surface and shadcn/ui Table primitives, with loading, empty, and retry states.

The 24h column compares the current `usual` with `history[28].usual` (the 29th entry), displaying `(current - historical) / historical × 100` as a signed percentage. Gains appear green, losses red, and unchanged prices neutral. Missing or invalid history and zero historical prices display a dash.

## Tests

Place tests alongside source files using `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx`. Vitest uses jsdom, React Testing Library, and jest-dom matchers. The `@/*` alias resolves to `src/*` in both Next.js and tests.

`src/app/page.test.tsx` provides a starter component test. Vitest supports synchronous Server Components and Client Components; use end-to-end tests for async Server Components.
