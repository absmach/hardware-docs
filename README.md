# Hardware Docs

Documentation site for [Abstract Machines Hardware](https://github.com/absmach/a0), built with [Fumadocs](https://fumadocs.dev) and Next.js.

The site is served under `/docs/hardware/`.

## Development

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000/docs/hardware/ with your browser to see the result.

## Deployment

This site uses:

- **Next.js static export** — `next build` outputs static files to `out/`
- **Next.js `basePath`** — generates links and assets under `/docs/hardware`
- **Post-build nesting** — `scripts/nest-static-export.mjs` moves the export under `out/docs/hardware/` so Cloudflare static assets can serve it from the route prefix without custom Worker code

### Cloudflare build settings (Dashboard)

| Setting         | Value                          |
| --------------- | ------------------------------ |
| Build command   | `pnpm run build`               |
| Deploy command  | `npx wrangler deploy`          |
| Version command | `npx wrangler versions upload` |
| Root directory  | `/`                            |

### Environment Variables

Only one build variable is needed:

```env
NEXT_PUBLIC_BASE_URL=https://www.absmach.eu/docs/hardware
```

Set this as a Cloudflare build variable so it is embedded into the static output at build time.

## Learn More

- [Fumadocs](https://fumadocs.dev)
- [Next.js Documentation](https://nextjs.org/docs)
