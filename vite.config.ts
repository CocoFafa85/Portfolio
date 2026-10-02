import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    base: '/', // Site servi à la racine du domaine personnalisé corentinfanic.dev
    resolve: {
        alias: {
            '@': '/src',
        },
    },
})