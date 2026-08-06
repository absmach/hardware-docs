# Publishing docs images (maintainers only)

Content images are no longer committed to this repo. They're stored in a shared
Cloudflare R2 bucket (`websites-images`, under the `hardware-docs` key prefix so they
don't collide with other properties in the same bucket) and served at
`/docs/hardware/img/<filename>` by a small Cloudflare Worker script,
[`worker/index.ts`](../worker/index.ts), that reads the object from R2 and streams it
back. MDX content references images by that path, e.g.:

```md
![S0 IoT Gateway](/img/s0.png)
```

(`/img/...` becomes `/docs/hardware/img/...` automatically — see `assetPath()` in
[`src/lib/base-path.ts`](../src/lib/base-path.ts) and its use in
[`src/mdx-components.tsx`](../src/mdx-components.tsx).)

## Why a Worker script, not a Next.js route

This site is a fully static Next.js export (`output: "export"` in `next.config.mjs`),
deployed to Cloudflare as static assets with no Next.js server at all — see
`README.md`'s "Post-build nesting" section. That's also why neither
`@cloudflare/next-on-pages` nor `@opennextjs/cloudflare` apply here: there's no running
Next.js request handler on Cloudflare to reach an R2 binding from.

Before this change, images lived under `content/docs/images/`, co-located with their MDX
files, and were referenced with **relative** markdown paths (e.g. `../images/s0.png`).
Next's static-export bundler resolved those at build time into content-hashed files
under `_next/static/media/`, which meant the image bytes had to be physically present in
the repo just to run `next build` — incompatible with getting them out of git. Content
images are now referenced by the stable absolute path above instead, so the build has no
dependency on the files being present at all, and `wrangler.jsonc` gained a `main` Worker
script (`worker/index.ts`) purely to answer that one route: it falls back from the
`ASSETS` binding (Cloudflare serves any matching static file directly and only invokes
this Worker when nothing matches, since `run_worker_first` defaults to `false`) to
reading `/docs/hardware/img/*` requests straight out of `IMAGES_BUCKET`.

Only maintainers publish images, using [`publish-image.mjs`](./publish-image.mjs). The
script is safe to have in a public repo because it's inert without a token — nobody can
upload to the bucket just by reading this file. See "Why maintainer-only" below.

## One-time setup

1. Create `scripts/.env.publish-image` from the template:

   ```bash
   cp scripts/.env.publish-image.example scripts/.env.publish-image
   ```

2. Create a Cloudflare API token: dashboard -> **My Profile -> API Tokens -> Create Token
   -> Custom Token**, with both permissions on the same token:
   - `Workers R2 Storage: Edit`
   - `Zone -> Cache Purge -> Purge`, **Zone Resources** scoped to the zone fronting this
     site (see the TODO in `scripts/.env.publish-image.example` — the zone ID isn't
     documented anywhere in this repo; confirm it in the dashboard)

3. Paste the token into `CLOUDFLARE_API_TOKEN` and the zone ID into `CLOUDFLARE_ZONE_ID`
   in `scripts/.env.publish-image`.

4. Sanity-check the token before first use:

   ```bash
   curl -s https://api.cloudflare.com/client/v4/user/tokens/verify \
     -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN"
   ```

   Should return `"status":"active"`. If it doesn't, the token value itself is wrong
   (bad copy/paste, expired, revoked) — fix that before troubleshooting anything else.

## Publishing an image

```bash
pnpm run publish-image <local-file> [dest-filename]
```

`[dest-filename]` defaults to the local file's own name and becomes both the R2 object's
key and the filename readers request. Example:

```bash
pnpm run publish-image ./s0-front.png
# -> r2://websites-images/hardware-docs/s0-front.png
# -> https://www.absmach.eu/docs/hardware/img/s0-front.png
# -> reference from MDX as: ![Alt text](/img/s0-front.png)
```

The script does two things, in order:

1. `wrangler r2 object put ... --remote` — uploads to the **real** bucket. `--remote` is
   required; without it, `wrangler` silently writes to a local simulated bucket and
   prints a normal-looking "Upload complete" with no error, and the object is never
   actually live.
2. Purges that exact URL from Cloudflare's edge cache (`POST /zones/{id}/purge_cache`),
   so the update is visible within seconds instead of waiting out the cache TTL.

If you re-run the same command for an existing filename, it overwrites the object in
place and purges again — that's the intended way to update an image without changing its
URL or the MDX that references it.

## Migrating the existing images (one-time)

This branch removes `content/docs/images/` from git. Before merging (or right after, but
before anyone needs the docs pages that reference them to render images), a maintainer
needs to publish the images that are actually referenced from MDX. The original files are
still present in git history (and in any pre-migration checkout) if you need to recover
them — check out the commit before this change, or `git show <old-commit>:content/docs/images/<file>`.

Only these were actually referenced from MDX at migration time (the repo had accumulated
a number of unused images under `content/docs/images/` — e.g. `image.png`,
`image-3.png`, `s0-angled.png`, `mbus.png` — that were dropped rather than migrated,
since nothing linked to them):

```
arch.png, baseboard-front.png, baseboard-pinout.svg, baseconnectors.png, baseframe.png,
battcharger.png, bb-label.png, beagleframe.png, buckconverter.png, decapseth.png,
decaps-sim.png, esp32.png, esp-reset.png, ethernet.png, headers.png, image-1.png,
image-10.png, magneticsandjack.png, powerbase.png, rcs2lp.png, s0.png, s0_pinout.svg,
sdcard.png, sim7080g.png, sim7080gstatus.png, voltconvert.png, wiredmbus.png
```

For each one, run `pnpm run publish-image <path-to-original-file>` with the exact
filename above as `dest-filename` (or as the local file's own name, if it already
matches) so the R2 key matches what `worker/index.ts` and the MDX references expect.

If you're adding a brand-new image going forward, just run `publish-image` and reference
`/img/<filename>` from the MDX — no separate registration step needed.

## Why maintainer-only

This repo is public. The risk isn't the script being visible — it's inert without a
credential. The risk is _credential distribution_: whoever holds `CLOUDFLARE_API_TOKEN`
can write to the shared bucket. So nobody, internal or external, gets a personal R2
token. Only a maintainer, holding this one scoped token, runs `publish-image`.

Practical flow for a PR that adds an image: the contributor attaches the image to the PR
the normal GitHub way (drag-and-drop into the description or a comment) and references
`/img/<filename>` from their MDX changes. A maintainer reviewing the PR runs
`pnpm run publish-image` locally before merging, then approves.

## Troubleshooting

- **`Local file not found: --`** — you ran `pnpm run publish-image -- <file>`. pnpm
  forwards a leading `--` to the script literally instead of stripping it like npm does.
  The script strips it defensively, but plain `pnpm run publish-image <file>` (no `--`)
  is the form to use.
- **`Resource location: local` in the upload output** — means `--remote` didn't get
  applied for some reason (e.g. running the underlying `wrangler` command by hand without
  copying the full flag list from the script). The object was never written to the real
  bucket even though the CLI reports success. Always use `pnpm run publish-image`, or add
  `--remote` yourself if invoking wrangler directly.
- **`Cache purge failed` / `Authentication error` (code 10000)** — Cloudflare reuses this
  code for both "bad token" and "token valid but missing this permission." Run the token
  verify curl command above first to rule out a bad token. If that succeeds, the token is
  missing `Zone -> Cache Purge -> Purge` for the correct zone, or that permission's Zone
  Resources selector doesn't include it — edit the token in the dashboard and add it.
- To confirm an object actually made it into the bucket after a `--remote` upload:

  ```bash
  wrangler r2 object get websites-images/hardware-docs/<filename> --remote --file=/tmp/check
  ```
