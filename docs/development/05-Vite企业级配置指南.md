# Vite 企业级配置指南

## 概述

本文档整理了企业级 Vue3 + Vite 项目所需的核心配置，涵盖路径别名、环境变量、开发服务器、插件和构建优化等方面。

## 一、基础配置

### 1.1 路径别名配置

路径别名可以简化模块导入，提高代码可读性。

```typescript
// vite.config.ts
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})
```

同时需要在 `tsconfig.app.json` 中配置对应的路径映射：

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 1.2 环境变量配置

企业级项目通常需要区分开发环境和生产环境。

#### 创建环境变量文件

```bash
# 项目根目录
.env                # 所有环境共用的变量
.env.development    # 开发环境
.env.production    # 生产环境
```

#### 环境变量文件示例

```bash
# .env.development
NODE_ENV=development
VITE_APP_TITLE=管理系统（开发环境）
VITE_APP_BASE_API=http://localhost:3000/api
VITE_APP_BASE_URL=http://localhost:5173
VITE_APP_UPLOAD_URL=http://localhost:3000/upload
```

```bash
# .env.production
NODE_ENV=production
VITE_APP_TITLE=管理系统
VITE_APP_BASE_API=https://api.example.com
VITE_APP_BASE_URL=https://www.example.com
VITE_APP_UPLOAD_URL=https://upload.example.com
```

#### TypeScript 类型声明

创建 `src/env.d.ts` 文件：

```typescript
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_APP_BASE_API: string
  readonly VITE_APP_BASE_URL: string
  readonly VITE_APP_UPLOAD_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

#### 使用环境变量

```typescript
// 在代码中使用
const apiUrl = import.meta.env.VITE_APP_BASE_API
const appTitle = import.meta.env.VITE_APP_TITLE
```

#### 配置启动脚本

```json
{
  "scripts": {
    "dev": "vite --mode development",
    "build": "vite build --mode production"
  }
}
```

### 1.3 开发服务器配置

```typescript
// vite.config.ts
export default defineConfig({
  server: {
    host: '0.0.0.0', // 允许外部访问
    port: 5173,      // 端口号
    open: true,      // 自动打开浏览器
    cors: true,      // 允许跨域
    
    // 代理配置
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/upload': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      }
    },
    
    // HMR 配置
    hmr: {
      overlay: true, // 错误覆盖层
    },
  },
})
```

## 二、插件配置

### 2.1 必备插件

```typescript
// vite.config.ts
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

export default defineConfig({
  plugins: [
    vue(),
    vueJsx(),
    vueDevTools(), // 仅在开发环境启用
  ],
})
```

### 2.2 自动导入插件

自动导入 Vue API 和组件，减少重复的 import 语句。

#### 安装依赖

```bash
npm install -D unplugin-auto-import unplugin-vue-components
```

#### 配置插件

```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    vue(),
    
    // 自动导入 Vue API
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        'pinia',
        {
          '@vueuse/core': [
            // 按需导入 VueUse 函数
            'useMouse',
            'useLocalStorage',
            // ...
          ],
        },
      ],
      dts: 'src/auto-imports.d.ts', // 生成类型声明文件
      eslintrc: {
        enabled: true, // 生成 ESLint 配置
        filepath: './.eslintrc-auto-import.json',
      },
    }),
    
    // 自动导入组件
    Components({
      dts: 'src/components.d.ts', // 生成类型声明文件
      dirs: ['src/components'], // 组件目录
      extensions: ['vue'],
      deep: true, // 搜索子目录
    }),
  ],
})
```

### 2.3 UI 组件库按需导入

以 Element Plus 为例：

```bash
npm install -D unplugin-vue-components unplugin-auto-import
npm install element-plus
```

```typescript
// vite.config.ts
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
})
```

### 2.4 SVG 图标插件

```bash
npm install -D vite-plugin-svg-icons
```

```typescript
// vite.config.ts
import { createSvgIconsPlugin } from 'vite-plugin-svg-icons'
import path from 'path'

export default defineConfig({
  plugins: [
    createSvgIconsPlugin({
      iconDirs: [path.resolve(process.cwd(), 'src/assets/icons')],
      symbolId: 'icon-[dir]-[name]',
    }),
  ],
})
```

### 2.5 压缩插件

```bash
npm install -D vite-plugin-compression
```

```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 大于 10KB 的文件进行压缩
      algorithm: 'gzip',
      ext: '.gz',
    }),
  ],
})
```

## 三、构建优化配置

### 3.1 基础构建配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    target: 'es2015', // 浏览器兼容性目标
    outDir: 'dist',   // 输出目录
    assetsDir: 'assets', // 静态资源目录
    assetsInlineLimit: 4096, // 小于 4KB 的资源内联为 base64
    cssCodeSplit: true, // CSS 代码分割
    sourcemap: false,   // 生产环境不生成 sourcemap
    
    // 清除 console 和 debugger
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    
    // 分块策略
    rollupOptions: {
      output: {
        // 静态资源分类打包
        chunkFileNames: 'js/[name]-[hash].js',
        entryFileNames: 'js/[name]-[hash].js',
        assetFileNames: '[ext]/[name]-[hash].[ext]',
        
        // 代码分割
        manualChunks: {
          // 将 Vue 相关库打包到一起
          vue: ['vue', 'vue-router', 'pinia'],
          // 将第三方库打包到一起
          vendor: ['axios', 'dayjs'],
        },
      },
    },
    
    // 分块大小警告限制
    chunkSizeWarningLimit: 1000,
  },
})
```

### 3.2 代码分割优化

```typescript
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // node_modules 中的包分离
          if (id.includes('node_modules')) {
            // 将大型库单独打包
            if (id.includes('element-plus')) {
              return 'element-plus'
            }
            if (id.includes('echarts')) {
              return 'echarts'
            }
            // 其他第三方库
            return 'vendor'
          }
        },
      },
    },
  },
})
```

## 四、完整配置示例

```typescript
// vite.config.ts - 完整企业级配置示例
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import viteCompression from 'vite-plugin-compression'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())
  
  return {
    plugins: [
      vue(),
      vueJsx(),
      vueDevTools(),
      
      AutoImport({
        imports: ['vue', 'vue-router', 'pinia'],
        resolvers: [ElementPlusResolver()],
        dts: 'src/auto-imports.d.ts',
        eslintrc: {
          enabled: true,
          filepath: './.eslintrc-auto-import.json',
        },
      }),
      
      Components({
        resolvers: [ElementPlusResolver()],
        dts: 'src/components.d.ts',
        dirs: ['src/components'],
      }),
      
      viteCompression({
        verbose: true,
        disable: false,
        threshold: 10240,
        algorithm: 'gzip',
        ext: '.gz',
      }),
    ],
    
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    
    server: {
      host: '0.0.0.0',
      port: 5173,
      open: true,
      cors: true,
      proxy: {
        '/api': {
          target: env.VITE_APP_BASE_API,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    
    build: {
      target: 'es2015',
      outDir: 'dist',
      assetsDir: 'assets',
      assetsInlineLimit: 4096,
      cssCodeSplit: true,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
          assetFileNames: '[ext]/[name]-[hash].[ext]',
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            'element-plus': ['element-plus'],
          },
        },
      },
      chunkSizeWarningLimit: 1000,
    },
    
    optimizeDeps: {
      include: ['vue', 'vue-router', 'pinia', 'element-plus'],
    },
  }
})
```

## 五、配置清单总结

### 必备配置
- ✅ 路径别名配置（@ 符号）
- ✅ 环境变量配置（开发/生产）
- ✅ 开发服务器配置
- ✅ 代理配置
- ✅ 构建优化配置

### 推荐插件
- ✅ @vitejs/plugin-vue - Vue 3 支持
- ✅ @vitejs/plugin-vue-jsx - JSX 支持
- ✅ vite-plugin-vue-devtools - 开发工具
- ✅ unplugin-auto-import - 自动导入 API
- ✅ unplugin-vue-components - 自动导入组件
- ✅ vite-plugin-compression - Gzip 压缩

### 构建优化
- ✅ 代码分割
- ✅ 资源压缩
- ✅ 缓存策略

## 六、参考资源

- [Vite 官方文档](https://vitejs.dev/)
- [Vue 3 官方文档](https://vuejs.org/)
- [TypeScript 官方文档](https://www.typescriptlang.org/)
