# Hardware Docs

Documentation site for [Abstract Machines Hardware](https://github.com/absmach/s0), built with [Fumadocs](https://fumadocs.dev) and Next.js.

Visiting `/` renders the intro page; all doc pages are served at their slug directly (e.g. `/s0-gateway`).

## Development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000 with your browser to see the result.

## Deployment

This site uses:

- **Next.js static export** — `next build` outputs static files to `out/`
- **GitHub Pages** — serves the `out/` directory via GitHub Actions

### GitHub Actions (`.github/workflows/cd.yml`)

Triggers on push to `main`. The workflow:

1. Builds the static site with `pnpm run build`
2. Uploads `out/` as a Pages artifact
3. Deploys to GitHub Pages

## Project structure

| Path                                   | Description                              |
|----------------------------------------|------------------------------------------|
| `src/app/[[...slug]]/page.tsx`         | Docs page renderer (all routes)          |
| `src/app/api/search/route.ts`          | Static search index route handler        |
| `src/app/og/[...slug]/route.tsx`       | OG image generation for docs pages       |
| `src/app/llms-full.txt/route.ts`       | LLM-readable full docs text              |
| `content/docs`                         | MDX source files                         |
| `src/lib/source.ts`                    | Fumadocs source adapter                  |
| `src/lib/layout.shared.tsx`            | Shared layout options (nav, logo)        |

## Learn More

- [Fumadocs](https://fumadocs.dev)
- [Next.js Documentation](https://nextjs.org/docs)
