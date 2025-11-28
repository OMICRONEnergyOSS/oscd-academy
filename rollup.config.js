import nodeResolve from "@rollup/plugin-node-resolve";

import { rollupPluginHTML as html } from "@web/rollup-plugin-html";
import { importMetaAssets } from "@web/rollup-plugin-import-meta-assets";
import copy from "rollup-plugin-copy";
import { generateSW } from "rollup-plugin-workbox";
import path from "path";
const outputDir = "bundle";

export default [
  {
    input: "index.html",
    external: [
      "./plugins/openscd.github.io/_snowpack/pkg/lit-translate.js",
      "./plugins/openscd.github.io/openscd/dist/translations/loader.js",
    ],
    plugins: [
      html({
        minify: true,
        // injectServiceWorker: true,
        // serviceWorkerPath: "bundle/sw.js",
      }),
      /** Resolve bare module imports */
      nodeResolve(),

      /** Bundle assets references via import.meta.url */
      importMetaAssets({ warnOnError: true }),
      copy({
        targets: [
          {
            src: ["favicon.ico", "fonts", "background.svg", "*.css"],
            dest: `${outputDir}/assets`,
          },
          {
            src: ["plugins"],
            dest: `${outputDir}`,
          },
          // Add more patterns if you have more assets
        ],
        verbose: true,
        flatten: false,
      }),
      /** Create and inject a service worker */
      // generateSW({
      //   globIgnores: ["polyfills/*.js", "nomodule-*.js"],
      //   navigateFallback: "/index.html",
      //   // where to output the generated sw
      //   swDest: path.join(outputDir, "sw.js"),
      //   // directory to match patterns against to be precached
      //   globDirectory: path.join(outputDir),
      //   // cache any html js and css by default
      //   globPatterns: [
      //     "*.{html,js,css}",
      //     "**/*.{html,js,css,webmanifest,ttf,ico,woff,woff2,svg,json}",
      //   ],
      //   skipWaiting: true,
      //   clientsClaim: true,
      //   // Check for updates every time the page loads
      //   cleanupOutdatedCaches: true,
      //   runtimeCaching: [
      //     { urlPattern: "polyfills/*.js", handler: "CacheFirst" },
      //   ],

      //   // For reasons, which remain unexplained, the workbox plugin does not
      //   // automatically include the material symbols font, so we add it manually
      //   // to the precache manifest.
      //   additionalManifestEntries: [
      //     {
      //       url: "assets/fonts/material-symbols-outlined.woff2",
      //       revision: null,
      //     },
      //   ],
      // }),
    ],
    output: {
      dir: outputDir,
      format: "es",
      sourcemap: false,
      entryFileNames: "[name]-[hash].js",
      chunkFileNames: "[name]-[hash].js",
    },
  },
];
