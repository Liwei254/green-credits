import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  build: {
    // Production optimizations
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: mode === 'production',
        drop_debugger: mode === 'production',
      },
    },
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ethers: ['ethers'],
          ui: ['lucide-react', 'tailwindcss'],
        },
      },
    },
    sourcemap: mode === 'development',
  },
  server: {
    // Development server config
    port: 3000,
    host: true,
  },
  preview: {
    // Preview server for production builds
    port: 4173,
    host: true,
  },
  define: {
    // Global constants
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
  },
}));
