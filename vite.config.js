import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: './index.html',
        danhSach: './danh-sach-doi-tac.html'
      }
    }
  }
});
