import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

const isProd = process.env.NODE_ENV === "production";
const isGitHubPages = process.env.PAGES_BASE_PATH !== undefined;
const basePath = isProd && isGitHubPages ? process.env.PAGES_BASE_PATH : "";

/** @type {import('next').NextConfig} */
const config = {
  output: "export",
  reactStrictMode: true,
  ...(basePath && {
    basePath: basePath,
    assetPrefix: basePath,
  }),
  images: {
    unoptimized: true,
  },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
};

export default withMDX(config);
