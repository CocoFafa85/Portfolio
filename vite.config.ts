import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Read by scripts/postbuild.mjs: the chunks to preload in each inner page's HTML (LOT 4, A0)
    build: {
        manifest: true,
        // Tiny modules shared by two lazy chunks (parseEmphasis, the colour maths) are merged into
        // a chunk that already loads, never served alone: on a direct visit each extra request of
        // the critical path waited for one of the 6 HTTP/1.1 connections Lighthouse simulates
        // (Skills FCP +150 ms, 2026-10-09)
        rollupOptions: { output: { experimentalMinChunkSize: 4096 } },
    },
    base: '/', // Site servi à la racine du domaine personnalisé corentinfanic.dev
    resolve: {
        alias: {
            '@': '/src',
        },
    },
})