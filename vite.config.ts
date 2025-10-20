import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    assetsInlineLimit: 0, // 모든 파일을 항상 경로로 유지
  },
  assetsInclude: ['**/*.svg'], // SVG를 asset으로 처리
})
