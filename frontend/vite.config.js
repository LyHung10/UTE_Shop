import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from "vite-plugin-svgr";

import path from "path"
export default defineConfig({
  plugins: [react(), tailwindcss(),svgr({
    svgrOptions: {
      icon: true,
      // This will transform your SVG to a React component
      exportType: "named",
      namedExport: "ReactComponent",
    },
  })],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})