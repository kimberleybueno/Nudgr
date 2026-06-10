import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  register: true,
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  // Pattern B (Screen 11): NEW SW waits until user taps Refresh in UpdateBanner.
  // The custom worker (worker/index.ts) handles the SKIP_WAITING message.
  workboxOptions: {
    skipWaiting: false,
    clientsClaim: true,
  },
  customWorkerSrc: "worker",
  disable: process.env.NODE_ENV === "development",
});

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
};

export default withPWA(nextConfig);
