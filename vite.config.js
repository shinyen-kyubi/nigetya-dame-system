import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pagesのリポジトリ名に合わせて base を設定
export default defineConfig({
  plugins: [react()],
  base: '/nigetya-dame-system/',
})
