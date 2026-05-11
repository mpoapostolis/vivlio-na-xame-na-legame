import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://agios-andreas.local',
  output: 'static',
  trailingSlash: 'never',
  build: {
    assets: '_static',
    inlineStylesheets: 'auto',
  },
  server: {
    port: 3000,
    host: true,
  },
  vite: {
    server: {
      fs: {
        allow: ['..'],
      },
    },
  },
});
