import { defineConfig, normalizePath, type Plugin } from 'vite'
import type { ProxyOptions } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'
import { platform } from 'os'
import fs from 'node:fs'
import path from 'node:path'

// 主入口配置
// 统一使用 SaaS 模式
// 单体部署本质上就是只有 src，没有新建其他租户应用

// src 目录
const srcPath = resolve(__dirname, 'src')
/** Windows 上别名替换需统一为正斜杠 */
const srcRootPosix = normalizePath(srcPath)
const frontendRoot = __dirname

function resolvePkg(name: string): string {
  return resolve(frontendRoot, 'node_modules', name)
}

function fixUniverSafariLookbehindPlugin(): Plugin {
  let outDir = '';
  const patch = (code: string) => code.replace(/\(\(\?\<!#\)\.\)\*/g, '[^\\]]*?');
  return {
    name: 'fix-univer-safari-lookbehind',
    apply: 'build',
    enforce: 'post',
    configResolved(config) {
      outDir = path.isAbsolute(config.build.outDir)
        ? config.build.outDir
        : path.resolve(config.root, config.build.outDir);
    },
    transform(code, id) {
      const normalizedId = id.replace(/\\/g, '/');
      if (!normalizedId.includes('@univerjs/') || !code.includes('(?<!#)')) {
        return null;
      }
      const patched = patch(code);
      if (patched === code) return null;
      return { code: patched, map: null };
    },
    generateBundle(_outputOptions, bundle) {
      for (const item of Object.values(bundle)) {
        if (item.type !== 'chunk' || !item.code.includes('(?<!#)')) continue;
        item.code = patch(item.code);
      }
    },
    closeBundle() {
      const assetsDir = path.join(outDir, 'assets');
      if (!fs.existsSync(assetsDir)) return;
      for (const name of fs.readdirSync(assetsDir)) {
        if (!name.endsWith('.js')) continue;
        const fp = path.join(assetsDir, name);
        const code = fs.readFileSync(fp, 'utf8');
        if (!code.includes('(?<!#)')) continue;
        const patched = patch(code);
        if (patched !== code) fs.writeFileSync(fp, patched, 'utf8');
      }
    },
  };
}

export default defineConfig({
  base: '/',
  // 优化：设置根目录为src目录，因为index.html在src目录下
  root: srcPath, // src目录
  publicDir: resolve(__dirname, 'static'),
  assetsInclude: ['**/*.wasm'],
  // 服务器配置
  server: {
    // 支持局域网访问；VITE_HOST 由 package.json dev 脚本注入，未设置时默认监听所有网卡
    host: process.env.VITE_HOST || '0.0.0.0',
    // 局域网设备通过主机名/IP 访问均放行，避免 Vite 8 默认 Host 校验返回 403
    allowedHosts: true,
    port: 8100,
    strictPort: false,
    open: true,
    cors: true,
    proxy: {
      '/api': {
        // 后端服务地址从环境变量读取
        target: 'https://kuaigeyun.com/',
        changeOrigin: true,
        secure: false,
        // 关键修复：增加超时时间，防止后端重启时连接超时
        timeout: 120000, // 菜单全量同步等重操作可能超过 30 秒，统一放宽到 120 秒
        ws: true, // 支持 WebSocket
        // 关键修复：配置代理错误处理，防止后端重启导致前端服务崩溃
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            // 后端服务不可用时，只记录错误，不导致前端服务崩溃
            // 这是关键：错误处理不会导致 Vite 服务崩溃
            console.warn('⚠️ 代理错误（后端可能正在重启）:', err.message);
          });
          proxy.on('proxyReq', (proxyReq, _req, _res) => {
            // 设置更长的超时时间
            proxyReq.setTimeout(120000);
          });
        },
      } as ProxyOptions,
      '/static/client-packages': {
        target: process.env.VITE_API_TARGET || `http://${process.env.VITE_BACKEND_HOST || '127.0.0.1'}:${process.env.VITE_BACKEND_PORT || '8200'}`,
        changeOrigin: true,
        secure: false,
      } as ProxyOptions,
      '/static/client-updates': {
        target: process.env.VITE_API_TARGET || `http://${process.env.VITE_BACKEND_HOST || '127.0.0.1'}:${process.env.VITE_BACKEND_PORT || '8200'}`,
        changeOrigin: true,
        secure: false,
      } as ProxyOptions,
      // 积木报表代理，使其感觉上是"融合"在同一个域名下
      '/jeecg-boot': {
        target: 'http://localhost:8200',
        changeOrigin: true,
        secure: false,
      } as ProxyOptions,
    },
    hmr: {
      overlay: true,
      timeout: 30000,
    },
    watch: {
      // 优化文件监听，确保 HMR 正常工作，避免频繁重启
      ignored: [
        '**/node_modules/**',
        '**/.git/**',
        '**/dist/**',
        '**/.vite/**',
        '**/build/**',
        '**/coverage/**',
        '**/*.log',
        '**/*.tmp',
        '**/startlogs/**',
        '**/logs/**',
        '**/.DS_Store',
        '**/Thumbs.db',
        '**/package-lock.json',
        '**/yarn.lock',
        '**/pnpm-lock.yaml',
        '**/.env.local',
        '**/.env.*.local',
        // ⚠️ 关键修复：忽略后端目录，防止前端服务监听后端文件变化导致崩溃
        '**/riveredge-backend/**',
        '**/backend/**',
        '**/__pycache__/**',
        '**/*.py',
        '**/*.pyc',
        '**/*.pyo',
        '**/*.sqlite',
        '**/*.sqlite3',
        '**/*.db',
        // 忽略 IDE 和编辑器文件
        '**/.vscode/**',
        '**/.idea/**',
        '**/*.swp',
        '**/*.swo',
        '**/*~',
        // 忽略 macOS 文件
        '**/.fseventsd/**',
        '**/.DocumentRevisions-V100/**',
        '**/.TemporaryItems/**',
        '**/.Trashes/**',
        // 忽略 Windows 系统文件
        '**/desktop.ini',
        '**/Desktop.ini',
        '**/Thumbs.db',
        '**/$RECYCLE.BIN/**',
        '**/*.stackdump',
        // ⚠️ 额外保护：忽略项目根目录下的后端目录
        '../../riveredge-backend/**',
        '../../../riveredge-backend/**',
        '**/../riveredge-backend/**',
        // 忽略其他可能变化的文件
        '**/migrations/**',
        '**/*.lock',
        '**/uv.lock',
        '**/Pipfile.lock',
        '**/poetry.lock',
        // 忽略测试文件
        '**/tests/**',
        '**/test/**',
        '**/*.test.{js,ts,jsx,tsx}',
        '**/*.spec.{js,ts,jsx,tsx}',
        // 忽略构建产物
        '**/*.map',
        '**/*.min.js',
        '**/*.min.css',
      ],
      // Windows 环境下使用轮询模式以确保文件变化能被检测到
      usePolling: platform() === 'win32',
      // ⚠️ 优化：增加文件变化检测间隔，减少 CPU 占用和重启频率
      interval: platform() === 'win32' ? 2000 : 500, // Windows 增加到 2 秒，其他平台 0.5 秒
      // 优化文件监听性能
      binaryInterval: platform() === 'win32' ? 3000 : 1000, // Windows 增加到 3 秒
      // 使用原子写入检测，减少不必要的重载
      atomic: true,
    },
  },
  // 构建配置 - 优化性能
  build: {
    // Vite 8 默认 Lightning CSS 无法识别 Tailwind 原生指令；改用 esbuild 压缩
    cssMinify: 'esbuild',
    // 输出到项目根目录的 dist，与面板/Caddy 期望的 riveredge-frontend/dist 一致
    outDir: resolve(__dirname, 'dist'),
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    // 单块告警阈值（KB），拆分后各块仍可能较大
    chunkSizeWarningLimit: 800,
    // 生产环境配置
          // 代码分割配置（按依赖类型分割，不按路由分割，避免菜单加载慢）
    rollupOptions: {
      // 生产构建单入口 index.html；开发环境见下方 login-mpa-rewrite（/login → login.html 独立入口）
      output: {
        // 手动代码分割策略（顺序重要：优先匹配最具体的路径）
        manualChunks: (id) => {
          if (id.includes('node_modules')) {
            // 巨型可视化/文档/PDF 栈：各自独立 chunk，避免被并入 vendor-other 拖累首屏
            if (id.includes('@univerjs')) return 'vendor-univerjs';
            if (id.includes('monaco-editor') || id.includes('@monaco-editor')) return 'vendor-monaco';
            if (id.includes('three') && !id.includes('react-three')) return 'vendor-three';
            if (id.includes('occt-import-js')) return 'vendor-occt';
            if (id.includes('@mlightcad/libredwg-web')) return 'vendor-libredwg';
            if (id.includes('echarts')) return 'vendor-echarts';
            if (id.includes('xlsx') || id.includes('exceljs')) return 'vendor-xlsx';
            if (id.includes('html2canvas')) return 'vendor-html2canvas';
            if (id.includes('jspdf') || id.includes('pdf-lib') || id.includes('pdfjs-dist')) return 'vendor-pdf';
            if (id.includes('@ant-design/pro-flow')) return 'vendor-pro-flow';
            if (id.includes('@svar-ui/react-gantt')) return 'vendor-gantt';
            if (id.includes('@ant-design/pro-components')) return 'vendor-pro-components';
            if (id.includes('@ant-design/charts') || id.includes('@ant-design/plots')) return 'vendor-charts';
            if (id.includes('@ant-design/graphs')) return 'vendor-graphs';
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) return 'vendor-react';
            if (id.includes('antd') || id.includes('@ant-design')) return 'vendor-antd';
            if (id.includes('framer-motion') || id.includes('lottie')) return 'vendor-animation';
            return 'vendor-other';
          }
          if (id.includes('/components/uni-import')) return 'component-uni-import';
          if (id.includes('/components/uni-query')) return 'component-uni-query';
          if (id.includes('/pages/login')) return 'page-login';
          if (id.includes('/apps/')) {
            const appMatch = id.match(/\/apps\/([^/]+)/);
            if (appMatch) return `app-${appMatch[1]}`;
          }
          if (id.includes('/pages/system/')) return 'pages-system';
          if (id.includes('/pages/infra/')) return 'pages-infra';
          if (id.includes('/pages/personal/')) return 'pages-personal';
        },
        // 文件命名规则
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          // 图片资源
          if (assetInfo.name && /\.(png|jpe?g|svg|gif|webp)$/.test(assetInfo.name)) {
            return 'assets/images/[name]-[hash][extname]';
          }
          // 字体资源
          if (assetInfo.name && /\.(woff2?|eot|ttf|otf)$/.test(assetInfo.name)) {
            return 'assets/fonts/[name]-[hash][extname]';
          }
          // CSS 资源
          if (assetInfo.name && /\.css$/.test(assetInfo.name)) {
            return 'assets/css/[name]-[hash][extname]';
          }
          // 其他资源
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
    // 构建目标（es2020 可减小 polyfill 体积，现代浏览器均支持）
    target: 'es2020',
    // CSS 代码分割
    cssCodeSplit: true,
    // 资源内联阈值（小于 8KB 的资源内联为 base64，减少请求数）
    assetsInlineLimit: 8192,
  },
  plugins: [
    fixUniverSafariLookbehindPlugin(),
    tailwindcss(),
    // occt-import-js 为 Emscripten CJS，Vite 动态 import 不会自动补 default export
    {
      name: 'occt-import-js-esm-bridge',
      enforce: 'post',
      transform(code, id) {
        const normalizedId = id.replace(/\\/g, '/');
        if (!normalizedId.includes('occt-import-js/dist/occt-import-js.js')) {
          return null;
        }
        if (code.includes('export default occtimportjs')) {
          return null;
        }
        return {
          code: `${code}\nexport default occtimportjs;\nexport { occtimportjs };\n`,
          map: null,
        };
      },
    },
    // 登录页 MPA：开发环境 /login 映射到 login.html（独立入口、无静态骨架；与 Caddy 生产配置一致）
    {
      name: 'login-mpa-rewrite',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          const url = req.url || '';
          const pathname = url.split('?')[0];
          if (pathname === '/login' || pathname === '/login/') {
            req.url = '/login.html';
          }
          next();
        });
      },
    },
    // React 插件：SWC 编译 + Fast Refresh（Vite 8）
    // 默认覆盖 .ts/.tsx/.mts/.jsx；JSX runtime 与 tsconfig jsx:react-jsx 一致为 automatic
    react({
      devTarget: 'es2020',
      // 用户明确选择 SWC，关闭「改用 @vitejs/plugin-react / OXC」提示
      disableOxcRecommendation: true,
    }),
  ],
  resolve: {
    // 与 tsconfig `@/*` -> `./src/*` 一致。仅用 `{ '@': src }` 时 `@/foo` 在 Rollup 中可能无法解析。
    alias: [
      {
        find: /^@\/(.*)$/,
        replacement: `${srcRootPosix}/$1`,
      },
      { find: 'react/jsx-runtime', replacement: resolvePkg('react/jsx-runtime.js') },
      { find: 'react-dom', replacement: resolvePkg('react-dom') },
      { find: 'react', replacement: resolvePkg('react') },
      { find: 'antd', replacement: resolvePkg('antd') },
      { find: '@ant-design/icons', replacement: resolvePkg('@ant-design/icons') },
    ],
  },
  // 优化依赖预构建：只列出"首屏 & 高频"包；Univer 全家桶等超重库仅在打开表格类页面时
  // 触发按需预构建，避免冷启动被迫扫描整套 CAD/sheet/docs 资源。
  css: {
    // Tailwind 由 plugins 中的 @tailwindcss/vite 处理；此处保留 postcss transformer 兼容 Less 等
    transformer: 'postcss',
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      'antd/es/border-beam',
      '@ant-design/icons',
      '@ant-design/pro-components',
      '@tanstack/react-query',
      'zustand',
      'dayjs',
      // Univer 依赖注入 token 须在同一预构建图内（dev 下 exclude 会导致多份 @univerjs/core / engine-render）
      '@univerjs/presets',
      '@univerjs/presets/preset-sheets-core',
    ],
    // 首屏不直接引用的大块头显式排除，让 Vite 在页面访问时再按需构建
    exclude: [
      'echarts',
      'three',
      'monaco-editor',
      'xlsx',
      'html2canvas',
      'jspdf',
      'occt-import-js',
      '@mlightcad/libredwg-web',
    ],
    // 强制每次启动时重新预构建，避免缓存过期导致 chunk 文件缺失的 "file does not exist" 错误
    //（清除缓存重试可临时解决，但下次启动同样问题会复现）
    force: true,
    // Vite 8 预构建已切到 Rolldown；target 由 build.target / SWC devTarget 承担
  },
  // ⚠️ 优化：适当的日志级别
  logLevel: 'info', // 显示必要信息，方便调试
  // ⚠️ 优化：允许清屏，但减少频率
  clearScreen: true,
})
