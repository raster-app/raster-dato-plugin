import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
	plugins: [react()],
	// DatoCMS loads `dist/index.html` from wherever the package is served, so assets resolve relative to it.
	base: './',
})
