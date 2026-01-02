import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  outputFileTracing: false, // Fix for ENOENT: middleware.js.nft.json error on Vercel
};

export default nextConfig;
