## 前端工程化 — 模块化开发

> **目标**：把前端代码拆分成可复用、可维护、可测试、可部署的“模块”，并通过工具链实现自动化打包、按需加载、共享依赖等功能。

---

### 1. 模块化开发概述

| 维度 | 说明 |
|------|------|
| **定义** | 将业务代码拆分成独立、可组合的单元（模块），每个模块拥有自己的依赖、接口和生命周期。 |
| **核心价值** | ① **可维护性**：单一职责、易定位；② **可复用性**：组件/库可在多项目共享；③ **可测试性**：模块化后可单元测试；④ **可扩展性**：按需加载、热更新；⑤ **团队协作**：职责分离、并行开发。 |
| **关键技术** | JavaScript 模块系统（ESM、CommonJS、AMD、UMD）、构建工具（Webpack、Rollup、Vite、esbuild）、CSS 模块、微前端、模块联邦。 |

---

### 2. JavaScript 模块系统

| 模块系统 | 语法 | 适用场景 | 备注 |
|-----------|------|----------|------|
| **ES Modules (ESM)** | `export`, `import` | 浏览器原生 + Node 12+ | 推荐，支持 tree‑shaking、动态 import |
| **CommonJS (CJS)** | `module.exports`, `require()` | Node 旧版、Webpack 默认 | 兼容旧库 |
| **AMD** | `define([...], function(){})` | 浏览器异步加载 | 现在很少使用 |
| **UMD** | 兼容 CommonJS、AMD、全局 | 需要同时支持多环境 | 典型的第三方库包装方式 |
| **ESM + Dynamic Import** | `import('module.js').then(m=>...)` | 按需加载、懒加载 | 支持代码拆分 |

> **推荐**：从项目初始就使用 **ESM**，通过构建工具兼容旧库。  
> **动态 import** 让你可以在运行时按需加载模块，减少首屏体积。

---

### 3. 构建工具与打包策略

| 工具 | 亮点 | 典型配置 |
|------|------|----------|
| **Webpack** | 强大插件生态、代码拆分、模块联邦 | `optimization.splitChunks`, `output.library`, `moduleFederationPlugin` |
| **Rollup** | 纯 ESM 打包、Tree‑Shaking | `output.format: 'esm'` |
| **Vite** | 开发时原生 ESM + HMR，构建时使用 Rollup | `build.rollupOptions` |
| **esbuild** | 极快构建、零配置 | `bundle: true` |
| **Parcel** | 零配置、内置 HMR | 适合快速原型 |

#### 3.1 代码拆分 & 按需加载

```js
// 传统方式
import Header from './components/Header';

// 按需加载
const LazyHeader = React.lazy(() => import('./components/Header'));
```

#### 3.2 Webpack 模块联邦（Module Federation）

```js
// host.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'host',
      remotes: { remoteApp: 'remoteApp@http://localhost:3001/remoteEntry.js' },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
    })
  ]
};

// remote.config.js
module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'remoteApp',
      filename: 'remoteEntry.js',
      exposes: { './Button': './src/Button' },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
    })
  ]
};
```

> **好处**：不同团队可独立发布、热更新、共享依赖。

---

### 4. CSS / SCSS 模块化

| 方法 | 说明 | 适用场景 |
|------|------|----------|
| **CSS Modules** | 通过 `*.module.css` 或 `*.module.scss` 自动生成唯一类名 | 单页面或组件库 |
| **PostCSS + `postcss-modules`** | 支持自定义命名、自动导出 | 与任何构建工具配合 |
| **Tailwind CSS** | 原子化类 + JIT 编译 | 快速原型、全局样式 |
| **styled‑components / Emotion** | CSS-in-JS | 组件级样式、主题化 |

> **最佳实践**  
> 1. 组件内部使用 CSS Modules 或 CSS‑in‑JS。  
> 2. 全局样式使用 `src/styles/global.css`。  
> 3. 通过 `:root` 或 CSS 变量实现主题切换。

---

### 5. 组件化与共享库

| 方案 | 说明 | 适用场景 |
|------|------|----------|
| **Storybook** | 组件文档 + UI 交互 | 组件库开发、设计系统 |
| **Bit** | 组件单元化、版本化、共享 | 多团队共享组件 |
| **Nx / Turborepo** | 代码仓库多包管理 | Monorepo 共享代码、缓存 |
| **Lerna** | 版本管理、发布 | 传统 NPM 包管理 |

> **典型目录结构（Monorepo）**

```
/packages
  /ui-button
    src/
    package.json
  /ui-modal
    src/
    package.json
  /shared-utils
    src/
    package.json
```

> **发布流程**  
> 1. 代码提交到 GitHub。  
> 2. CI 运行 lint、测试、构建。  
> 3. 发布到 npm 或私服。  

---

### 6. 微前端（Micro‑Frontends）

| 方案 | 核心思想 | 优点 | 缺点 |
|------|----------|------|------|
| **Single‑Spa** | 多框架同页面，路由共享 | 兼容多技术栈 | 复杂度高 |
| **Module Federation** | 共享依赖、按需加载 | 运行时无缝集成 | 需要构建工具支持 |
| **iframe** | 业务隔离 | 简单、隔离 | SEO、性能差 |
| **Web Components** | 标准化组件 | 兼容性好 | 生态相对成熟 |

> **推荐**：对于大型项目，先从 **Module Federation** 开始；若技术栈多样化，可考虑 **Single‑Spa** 结合 **Web Components**。

---

### 7. 最佳实践

| 方面 | 建议 |
|------|------|
| **代码组织** | `src/components`, `src/pages`, `src/utils`, `src/hooks`；使用 `index.js` 作为 barrel 导出。 |
| **模块命名** | 采用 PascalCase（组件） + kebab-case（文件） | 统一命名规则 |
| **依赖管理** | `package.json` 中声明 `peerDependencies` 与 `devDependencies`；使用 `npm ci` 或 `yarn install --frozen-lockfile`。 |
| **Lint + Formatter** | ESLint + Prettier；遵循 Airbnb 或自定义规则。 |
| **单元测试** | Jest + React Testing Library / Vue Test Utils；覆盖率 > 80%。 |
| **集成/端到端** | Cypress / Playwright；在 CI 中执行。 |
| **性能监控** | Web Vitals、Bundle Analyzer；开启 Gzip/ Brotli。 |
| **安全** | CSP、依赖审计（Snyk、npm audit）、HTTPS、XSS 防护。 |
| **文档** | Storybook + Docsify / VitePress；自动生成 API 文档。 |

---

### 8. 常见问题与解决方案

| 问题 | 说明 | 解决方案 |
|------|------|----------|
| **首屏加载慢** | 入口文件体积大 | ① 按需加载入口组件；② 使用 `preload`/`prefetch`；③ 开启 Gzip/Brotli |
| **模块冲突** | 两个库使用不同版本的同一依赖 | ① 使用 `module federation` 或 `webpack` 的 `alias`；② 将依赖提升为 `peerDependencies` |
| **热更新失效** | 代码改动后页面不刷新 | ① 检查 HMR 配置；② 确认 `react-refresh` 或 `vue-hot-reload` 已启用 |
| **构建时间过长** | 大量文件、无缓存 | ① 开启 `cache`；② 使用 `esbuild` 或 `Vite`；③ 采用 Monorepo 缓存 |
| **模块化导致的体积膨胀** | 过度拆分导致多请求 | ① 合并相关模块；② 使用 `dynamic import()` + `webpackChunkName` |

---

### 9. 参考资源（截至 2025）

| 资源 | 链接 | 备注 |
|------|------|------|
| MDN ES Modules | https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Guide/Modules | 官方文档 |
| Webpack 官方文档 | https://webpack.js.org/ | 配置教程 |
| Module Federation 例子 | https://github.com/module-federation/module-federation-examples | 实战 |
| Vite 官方文档 | https://vitejs.dev/ | 快速启动 |
| Bit 官方文档 | https://bit.dev/ | 组件共享 |
| Single‑Spa 官方文档 | https://single-spa.js.org/ | 微前端 |

---

> **结语**  
> 模块化开发是前端工程化的核心，既能让代码更易维护，又能让团队协作更高效。通过合适的模块系统、构建工具、组件化策略以及微前端技术，你可以把前端项目从“脚本堆砌”升级为“可持续交付”的软件工程。祝你编码愉快 🚀
