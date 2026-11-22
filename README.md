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

## Tests

Place tests alongside source files using `.test.ts`, `.test.tsx`, `.spec.ts`, or `.spec.tsx`. Vitest uses jsdom, React Testing Library, and jest-dom matchers. The `@/*` alias resolves to `src/*` in both Next.js and tests.

`src/app/page.test.tsx` provides a starter component test. Vitest supports synchronous Server Components and Client Components; use end-to-end tests for async Server Components.
