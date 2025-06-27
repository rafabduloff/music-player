import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Allow Vite to pre-bundle lucide-react. This prevents the dev server from
  // requesting each icon file individually (e.g. /fingerprint.js) which can
  // be blocked by certain ad-blockers and break the app in development.
  // If you need further dependency tweaks, add them here without excluding
  // lucide-react.
  // optimizeDeps: {
  //   include: [],
  // },
});
