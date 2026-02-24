import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'

export default defineConfig({
    plugins: [react()],

    // Monorepo: load env files from repo root (../.env, ../.env.local, etc.)
    envDir: resolve(__dirname, '..'),
})