import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'lucide-react'],
          ui: ['@/components/ui/button', '@/components/ui/dialog'], // и другие UI компоненты
        },
      },
    },
    chunkSizeWarningLimit: 600,
  },
});
