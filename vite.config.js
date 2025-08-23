import { defineConfig } from "vite";

export default defineConfig({
    build: {
        rollupOptions: {
            input: {
                index: "src/index.ts",
                background: "src/background.ts",
            },
            output: {
                entryFileNames: "js/[name].js",
                chunkFileNames: "js/[name]-[hash].js",
                assetFileNames: "assets/[name]-[hash][extname]",
            },
        },
        outDir: "dist",
        sourcemap: true,
    },
});
