import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // A relative base keeps assets working at any GitHub Pages repository path.
  base: './',
})
