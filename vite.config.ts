import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [sveltekit()],
    ssr: {
        noExternal: ["@geoman-io/maplibre-geoman-free"],
    },
    optimizeDeps: {
        include: ["@geoman-io/maplibre-geoman-free"],
    },
});
