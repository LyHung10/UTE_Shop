import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import svgr from 'vite-plugin-svgr'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    svgr({
      svgrOptions: {
        icon: true,
        exportType: 'named',
        namedExport: 'ReactComponent',
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      // mọi request bắt đầu bằng /api sẽ được forward tới backend
      '/api': {
        target: 'http://localhost:3000', // <-- ĐỔI thành URL backend của bạn
        changeOrigin: true,
        secure: false,
        // Nếu backend KHÔNG có prefix /api thì bật rewrite để bỏ /api khi chuyển tiếp:
        // rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
})
