import { defineConfig, type UserConfig } from "tsdown";

const isProd = process.env.NODE_ENV === "production";

/**
 * 公共构建配置
 */
const sharedConfig = {
  entry: "src/index.ts",
  platform: "browser",
  target: "es2022",
  sourcemap: true,
  dts: false,
  minify: false,
  clean: false,
} satisfies UserConfig;

export default defineConfig([
  // Browser ESM
  {
    ...sharedConfig,
    name: "esm",
    format: "esm",
    fixedExtension: true,
    dts: true,
  },

  // Browser IIFE
  {
    ...sharedConfig,
    name: "iife",
    format: "iife",
    globalName: "datasetConfig",
    minify: isProd,
    outputOptions: {
      entryFileNames: `dataset-config.${isProd ? "min." : ""}js`,
    },
  },
]);
