# Contentstack Algolia App

A custom Contentstack App that lets editors search an Algolia index and select one or more records, storing the selection back into a field (or app installation data) as JSON.

## Features

- Debounced search against Algolia index
- Multi-select of hits
- Persists selected records back to Contentstack using the App SDK
- React + Vite + TypeScript scaffold
- Basic testing with Vitest + Testing Library

## Prerequisites

- Node.js 18+
- A Contentstack organization with App framework access
- Algolia app ID, search-only API key, and index name

## Environment Variables

Create a `.env` file (or use the Contentstack App secure config) with:

```
VITE_ALGOLIA_APP_ID=YourAlgoliaAppId
VITE_ALGOLIA_API_KEY=YourSearchOnlyApiKey
VITE_ALGOLIA_INDEX_NAME=YourIndexName
```

## Scripts

- `npm run dev` – start local dev server
- `npm run build` – production build
- `npm run test` – run unit tests once
- `npm run test:watch` – watch tests

## Contentstack App Installation

1. Build the app: `npm run build`.
2. Host the `dist/` output (e.g., Netlify, Vercel, internal server).
3. In Contentstack, create a new App and point to the hosted URL.
4. Assign the App to entries / content types where you need Algolia selection.

## Persisting Data

The app attempts to detect if it's running in an entry field location and uses `field.setData(selectedRecords)`; otherwise it falls back to storing installation data if available.

## Future Improvements

- Add pagination / infinite scroll
- Add configurable hit display mapping
- Allow single-select mode option
- Error boundary & retry UI

## License

MIT
