/**
 * Get the base path for the application
 * This is used to prefix asset URLs when deploying to GitHub Pages
 *
 * During build time (SSG), we use the environment variable
 * For runtime, this will be baked into the bundle
 */
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || "";

/**
 * Get the base path
 */
export function getBasePath(): string {
  return BASE_PATH;
}

/**
 * Get the full asset path including base path
 * This works for both build-time and runtime
 */
export function assetPath(path: string): string {
  // Ensure path starts with /
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${BASE_PATH}${normalizedPath}`;
}
