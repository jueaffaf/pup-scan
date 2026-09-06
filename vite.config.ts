import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/*
 * GitHub Pages serves a project site from /<repo>/, not from the domain root,
 * so every built URL needs that prefix. Anything referenced as a runtime
 * string rather than an import has to use import.meta.env.BASE_URL itself —
 * Vite can only rewrite what it can see.
 */
export default defineConfig({
  base: process.env.GITHUB_PAGES ? '/pup-scan/' : '/',
  plugins: [react()],
  server: { port: 5173, host: 'localhost' },
})
