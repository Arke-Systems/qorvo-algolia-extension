# Contentstack Algolia App

Search an Algolia index inside Contentstack and store selected record(s) directly in a custom field.

## Features

- Next.js 14 (App Router) + React 18 + TypeScript
- Client-only Algolia search (dynamic import to avoid SSR window issues)
- Multi-select record persistence via `field.setData()` when in a field location (falls back to `sdk.store` if not)
- Automatic (best‑effort) iframe resize attempts (ResizeObserver + mutation + manual recalculation)
- Vitest + Testing Library for unit tests

## Scripts

| Purpose          | Command              |
| ---------------- | -------------------- |
| Dev server       | `npm run dev`        |
| Production build | `npm run build`      |
| Start prod       | `npm run start`      |
| Run tests        | `npm run test`       |
| Watch tests      | `npm run test:watch` |

## Environment Variables

Create `.env.local` (or configure in hosting provider):

```
NEXT_PUBLIC_ALGOLIA_APP_ID=YourAlgoliaAppId
NEXT_PUBLIC_ALGOLIA_API_KEY=YourSearchOnlyApiKey
NEXT_PUBLIC_ALGOLIA_INDEX_NAME=YourIndexName
```

These must be public (prefixed with `NEXT_PUBLIC_`) because the search happens client-side with a search-only key.

## Contentstack App Setup

1. Build: `npm run build`.
2. Deploy (Vercel) – root URL should serve the app.
3. In Contentstack App framework, configure the App to point the field location iframe to that URL.
4. Assign the App to the desired content type field.
5. Open an entry – the Algolia search UI appears; selected hits are saved.

## Persistence Logic

- Field context (`sdk.location.CustomField.field`) -> `field.setData(selectedRecords)` JSON array.
- Non-field (fallback) -> `sdk.store.set()` (installation scope) if needed.

## Resizing Notes

There is no official height API in the App SDK yet; we attempt:

- ResizeObserver on root container
- MutationObserver for dynamic content changes
- Manual recalculation after selection changes

If the iframe height remains fixed, it may be constrained by Contentstack container CSS. A future SDK method would replace these heuristics.

## Removal of Legacy UI Extensions SDK

Earlier versions loaded `@contentstack/ui-extensions-sdk` via a script tag. This has been removed in favor of the App SDK (`@contentstack/app-sdk`) only. All legacy event listeners (`extensionEvent`) and type declarations have been deleted. No action required for consumers.

## Future Improvements

- Pagination / infinite scroll
- Faceted filtering
- Single-select mode toggle
- Hit rendering customization (mapping config)
- Dedicated manual resize control for debugging

## License

MIT
