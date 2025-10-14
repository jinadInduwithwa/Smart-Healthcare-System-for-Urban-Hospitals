import { defineConfig } from "vite"; 
import react from "@vitejs/plugin-react-swc"; 
import path from "path"; 
 
// https://vitejs.dev/config/ 
export default defineConfig({ 
  plugins: [react()], 
  optimizeDeps: {
    include: ['recharts'],
    force: true // Force re-optimization
  },
  resolve: { 
    alias: { 
      "@": path.resolve(__dirname, "src"), 
    }, 
  }, 
});