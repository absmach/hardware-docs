#!/usr/bin/env node
// Maintainer-only. Uploads a docs content image to the shared R2 bucket and
// purges it from Cloudflare's edge cache, so it's live right after this
// finishes. Requires CLOUDFLARE_API_TOKEN (scoped: R2 Edit on
// websites-images + Zone Cache Purge on the zone fronting this site) and
// CLOUDFLARE_ZONE_ID.
//
// Usage:
//   pnpm run publish-image <local-file> [dest-filename]
//
// [dest-filename] defaults to the local file's own name and becomes both
// the R2 object's key and the filename readers request:
//
//   pnpm run publish-image ./s0-front.png
//   -> uploaded to r2://websites-images/hardware-docs/s0-front.png
//   -> live at https://www.absmach.eu/docs/hardware/img/s0-front.png
//   -> reference it from MDX as: ![Alt text](/img/s0-front.png)

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { basename, extname } from "node:path";
import process from "node:process";

const BUCKET_NAME = "websites-images";
// Shared bucket holds assets for multiple properties; this prefix keeps
// this site's objects from colliding with theirs. Keep in sync with
// R2_KEY_PREFIX in worker/index.ts.
const KEY_PREFIX = "hardware-docs";

// Confirmed from README.md's documented Cloudflare build variable
// (NEXT_PUBLIC_BASE_URL=https://www.absmach.eu/docs/hardware) and
// public/_redirects, which both only make sense if this Worker is routed
// from the www.absmach.eu zone at the /docs/hardware path. The docs/CNAME
// file pointing at hardware.absmach.eu appears to be a leftover from this
// repo's prior GitHub Pages deployment (see the untouched gh-pages branch
// and public/.nojekyll) and not where the site is actually served today.
const SITE_ORIGIN = "https://www.absmach.eu";
const BASE_PATH = "/docs/hardware";

const MIME_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".gif": "image/gif",
  ".avif": "image/avif",
  // No video exists in this repo today. If that changes, add the relevant
  // video MIME types here — the upload/purge logic below is format-agnostic.
};

try {
  process.loadEnvFile(new URL("./.env.publish-image", import.meta.url));
} catch {
  // No local env file — assume CLOUDFLARE_API_TOKEN / CLOUDFLARE_ZONE_ID
  // are already exported (e.g. in CI).
}

// pnpm forwards a leading "--" to the underlying command instead of
// stripping it (unlike npm), so tolerate it either way.
const cliArgs = process.argv.slice(2).filter((arg) => arg !== "--");
const [localFile, destFilenameArg] = cliArgs;

if (!localFile) {
  console.error(
    "Usage: pnpm run publish-image <local-file> [dest-filename]\n" +
      "Example: pnpm run publish-image ./s0-front.png",
  );
  process.exit(1);
}

if (!existsSync(localFile)) {
  console.error(`Local file not found: ${localFile}`);
  process.exit(1);
}

const destFilename = destFilenameArg || basename(localFile);

const contentType = MIME_TYPES[extname(destFilename).toLowerCase()];
if (!contentType) {
  console.error(`Unrecognized file extension for: ${destFilename}`);
  process.exit(1);
}

const { CLOUDFLARE_API_TOKEN, CLOUDFLARE_ZONE_ID } = process.env;
if (!CLOUDFLARE_API_TOKEN || !CLOUDFLARE_ZONE_ID) {
  console.error(
    "Missing CLOUDFLARE_API_TOKEN and/or CLOUDFLARE_ZONE_ID.\n" +
      "Copy scripts/.env.publish-image.example to scripts/.env.publish-image and fill in both.",
  );
  process.exit(1);
}

const objectPath = `${BUCKET_NAME}/${KEY_PREFIX}/${destFilename}`;

console.log(`Uploading ${localFile} -> r2://${objectPath}`);
execFileSync(
  "wrangler",
  [
    "r2",
    "object",
    "put",
    objectPath,
    `--file=${localFile}`,
    `--content-type=${contentType}`,
    "--remote",
  ],
  { stdio: "inherit", env: process.env },
);

const publicUrl = `${SITE_ORIGIN}${BASE_PATH}/img/${destFilename}`;

console.log(`Purging edge cache for ${publicUrl}`);
const purgeResponse = await fetch(
  `https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/purge_cache`,
  {
    method: "POST",
    headers: {
      Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ files: [publicUrl] }),
  },
);

const purgeResult = await purgeResponse.json();
if (!purgeResponse.ok || !purgeResult.success) {
  console.error("Cache purge failed:", JSON.stringify(purgeResult, null, 2));
  process.exit(1);
}

console.log(`Done. Live at ${publicUrl}`);
console.log(`Reference it from MDX as: ![Alt text](/img/${destFilename})`);
