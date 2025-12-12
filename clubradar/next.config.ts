import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set the workspace root to avoid lockfile detection issues
  // This tells Next.js where the actual project root is
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
