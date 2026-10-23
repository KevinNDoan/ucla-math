# UCLA Mathematics, reimagined

A responsive department website built with Next.js 16 (App Router), React 19, Tailwind CSS 4, and Fuse.js. The application exports to static HTML and can be hosted without a database or application server.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000.

## Production and validation

```sh
npm run build
npm run validate:content
```

The production website is generated in `out/`.

## Content coverage

The collection currently contains 865 entries: all 99 public WordPress pages, 167 news articles, 44 distinguished lecture entries, 82 undergraduate announcements, 156 opportunities, an announcement collection, five people directories, 280 individual department profiles, and 31 current seminar schedules. The directory contains 281 people. See `content/import-report.json` for the exact collection date, counts, and any import errors.

Content is imported from https://ww3.math.ucla.edu/ and its linked department directory and seminar systems. Internal department links are rewritten to local reading pages. PDFs, personal faculty websites, videos, external university services, registration forms, and authenticated resources retain links to their original locations. The collection is a snapshot, not a live mirror of every UCLA subdomain or historical seminar archive.

Refresh the public collection with:

```sh
npm run sync:content
npm run build
npm run validate:content
```

The importer preserves article text, tables, links, lecture abstracts, and contact details, expands source content, removes scripts and original presentation, and rebuilds the full-text search index. Rendered lecture templates and directory profiles are fetched separately because their details are absent from the WordPress body. Original source links remain available on every reading page.

## UCLA visual assets

The design keeps the original Antique Legacy typeface and official UCLA Mathematics signatures, with an independent editorial layout informed by Harvard and Stanford. White navigation, restrained color, sentence-case labels, generous spacing, and original UCLA photography carry through the homepage, search, and directory. Source URLs are recorded in `public/brand/ASSET-SOURCES.md`.

Interface writing uses sentence case and avoids em dash punctuation. Icons are reserved for controls and navigation, rather than decorative search-result badges or initials avatars.

## Search and navigation

- Sitewide full-text search with fuzzy matching, weighted title ranking, matching excerpts, highlighted terms, and category filters.
- Open search with Command/Ctrl + K; use Escape to close, Tab to move through results, or Arrow Down from the search field to focus the first result.
- Dedicated section hubs for undergraduate study, graduate study, research, people, news, events, and resources.
- A searchable, filterable people directory and a complete browsable content archive.
- Responsive navigation, visible focus states, reduced-motion support, semantic headings, and a native accessible search dialog.

## Structure

- `app/`: homepage, section hubs, content reading pages, directory, archive, and search.
- `components/`: navigation, search, directory, collection browser, and event listings.
- `content/`: imported content, people, events, navigation, and coverage report.
- `scripts/sync-content.mjs`: repeatable public content importer.
- `scripts/validate-content.mjs`: content coverage, route, link, sanitization, and search checks.
- `public/search-index.json`: browser-loaded full-text search index; fetched only when search is used.

This is an independent redesign. UCLA owns the original department content and imagery. It is not an official replacement for the university website.
# ucla-math
