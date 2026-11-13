import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// 管理后台前端：dev 端口 5173，API 代理到本地 Lumen 后端
export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://8.147.235.56',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://8.147.235.56',
        changeOrigin: true,
      },
    },
  },
})
