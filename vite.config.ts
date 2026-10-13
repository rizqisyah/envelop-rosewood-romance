import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  /*
   * Dev proxy: the browser calls same-origin `/api/...` and Vite forwards it to the real
   * backend. Set VITE_API_PROXY_TARGET to point it at a local qinvi-be instead.
   */
  const target = env.VITE_API_PROXY_TARGET || 'https://api.qinvi.id'

  return {
    plugins: [vue()],
    // Absolute, not './': slug routes like /TemaRosewoodRomance/<slug> are rewritten to
    // index.html, and a relative base would resolve assets against the slug path.
    base: '/TemaRosewoodRomance',
    server: {
      port: 5174,
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
        },
      },
    },
  }
})
