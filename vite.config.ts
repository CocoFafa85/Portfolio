import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Read by scripts/postbuild.mjs: the chunks to preload in each inner page's HTML (LOT 4, A0)
    build: { manifest: true },
    base: '/', // Site servi à la racine du domaine personnalisé corentinfanic.dev
    resolve: {
        alias: {
            '@': '/src',
        },
    },
})