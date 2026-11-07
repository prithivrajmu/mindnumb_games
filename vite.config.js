import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' => relative asset URLs, so the build works from any subpath (e.g. /mindnumb/)
export default defineConfig({
  base: './',
  plugins: [react()],
})
