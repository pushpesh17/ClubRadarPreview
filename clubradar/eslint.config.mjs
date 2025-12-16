import { defineConfig } from "eslint/config";

// Simplified ESLint flat config to avoid build-time issues with eslint-config-next.
// This still ignores Next.js build artefacts while letting Next.js run `next lint`.
export default defineConfig([
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
]);
