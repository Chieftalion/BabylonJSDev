import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    watch: {
      usePolling: true, // This fixes the auto-update issue
    },
    host: true,
  },
});