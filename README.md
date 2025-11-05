# Contentstack Algolia App

A custom Contentstack App that lets editors search an Algolia index and select one or more records, storing the selection back into a field (or app installation data) as JSON.

## Features

## Scripts (Next.js)

- `npm run dev` – start Next.js development server
- `npm run build` – create production build (`.next`)
- `npm run start` – start production server
- `npm run test` – run unit tests once
- `npm run test:watch` – watch tests
- React + Vite + TypeScript scaffold
- Basic testing with Vitest + Testing Library

## Environment Variables

Create a `.env.local` file (or use Environment Variables in your hosting platform). Use Next.js public prefix so client code can read them:

```
NEXT_PUBLIC_ALGOLIA_APP_ID=YourAlgoliaAppId
NEXT_PUBLIC_ALGOLIA_API_KEY=YourSearchOnlyApiKey
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=YourIndexName
```

- A Contentstack organization with App framework access
- Algolia app ID, search-only API key, and index name

## Environment Variables

## Contentstack App Installation

1. Build the app: `npm run build`.
2. Deploy the Next.js output (e.g., Vercel, Netlify, or your own Node server). The public URL should render the app at `/`.
3. In Contentstack, create/update the App configuration to point the extension iframe to this URL.
4. Assign the App to the desired field / location.
   Create a `.env` file (or use the Contentstack App secure config) with:

## Persisting Data

The app detects a field context via `sdk.location.CustomField`, `EntryFieldLocation`, or `FieldModifierLocation` and uses `field.setData()`; otherwise it stores into `sdk.store` as a fallback.

```
## Future Improvements
- Pagination / infinite scroll
- Facet filtering UI using `SearchFacetCollection`
- Single-select mode option
- Error boundary & retry UI
- Server-side proxy for secured Algolia operations if needed

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
```
