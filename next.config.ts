import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseHost: string | undefined;
try {
  if (supabaseUrl) supabaseHost = new URL(supabaseUrl).hostname;
} catch {}

const config: NextConfig = {
  images: {
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost }]
      : [],
  },
  serverExternalPackages: ["heic-convert", "heic-decode", "libheif-js"],
  experimental: {
    serverActions: { bodySizeLimit: "50mb" },
  },
};

export default config;
