import type { NextConfig } from "next";

// STATIC_EXPORT=1 builds the plain-files copy for Hostinger (see build-hostinger.sh).
// Its live data still comes from the Cloudflare site (app/lib/cors.ts allows that).
const isStaticExport = process.env.STATIC_EXPORT === "1";

const nextConfig: NextConfig = isStaticExport
  ? {
      output: "export",
      trailingSlash: true,
      images: { unoptimized: true },
    }
  : {};

export default nextConfig;
