import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// 如果有别名配置，可按需补充；没有就保持最简
export default defineConfig({
  base: '/admin_system_demo/',   // 关键：部署子路径
  plugins: [react()],
})

