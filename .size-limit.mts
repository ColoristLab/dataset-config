import type { SizeLimitConfig } from "size-limit";

export default [
  {
    limit: "600B",
    path: "./dist/index.mjs",
  },
] satisfies SizeLimitConfig;
