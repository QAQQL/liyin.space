import {fileURLToPath, URL} from 'node:url'

import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

//ElementUI 按需导入
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import {ElementPlusResolver} from 'unplugin-vue-components/resolvers'

// https://vitejs.dev/config/
export default defineConfig({
    base: '/', plugins: [vue(), AutoImport({
        resolvers: [ElementPlusResolver()],
    }), Components({
        resolvers: [ElementPlusResolver()],
    }),], build: {
        rollupOptions: {
            output: {
                entryFileNames: 'js/[name]-[hash].js', chunkFileNames: 'js/[name]-[hash].js', assetFileNames(assetInfo) {
                    if (assetInfo.name.endsWith('.css')) {
                        return 'css/[name]-[hash].css'
                    }
                    if (['.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp'].some(ext => assetInfo.name.endsWith(ext))) {
                        return 'img/[name]-[hash].[ext]'
                    }
                    return 'assets/[name]-[hash].[ext]'
                }
            }, manualChunks(id) {
                if (id.includes('node_modules')) {
                    return 'vendor'
                }
            }
        }
    }, resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    }, server: {
        host: "0.0.0.0",
        proxy: {
            '/hoyolab': {
                target: 'https://sg-public-api.heybox.com',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/hoyolab/, ''),
                configure: (proxy) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        for (const headersKey in req.headers) {
                            if (headersKey.startsWith('rewrite-')) {
                                proxyReq.setHeader(headersKey.replace('rewrite-', ''), req.headers[headersKey])
                            }
                        }
                    })
                },
            }, '/mihoyo': {
                target: 'https://api-takumi.mihoyo.com',
                changeOrigin: true,
                secure: true,
                rewrite: (path) => path.replace(/^\/mihoyo/, ''),
                configure: (proxy) => {
                    proxy.on('proxyReq', (proxyReq, req, res) => {
                        for (const headersKey in req.headers) {
                            if (headersKey.startsWith('rewrite-')) {
                                proxyReq.setHeader(headersKey.replace('rewrite-', ''), req.headers[headersKey])
                            }
                        }
                    })
                },
            }
        }
    }
})
