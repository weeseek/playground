# 微前端

## 微前端概述

微前端（Micro Frontends）是一种架构模式，它将微服务的理念扩展到前端领域，允许将大型前端应用拆分为更小、更独立的部分，由不同的团队独立开发、部署和维护。

### 什么是微前端

微前端是将单体前端应用分解为多个小型前端应用的方法，每个应用负责特定的业务功能，可以独立开发、测试、部署和扩展。

### 微前端的价值

1. **团队自治**：不同团队可以独立工作，减少协调成本
2. **技术多样性**：不同微应用可以使用不同的技术栈
3. **独立部署**：各部分可以独立发布，降低整体风险
4. **增量升级**：可以逐步迁移旧系统，而非一次性重构
5. **可扩展性**：更容易横向扩展团队和系统

## 微前端架构模式

### 1. 路由分发模式

根据不同路由加载不同的微应用：

```javascript
// 主应用路由配置
const routes = [
  {
    path: '/dashboard',
    component: () => import('dashboard/MicroApp')
  },
  {
    path: '/user',
    component: () => import('user/MicroApp')
  },
  {
    path: '/order',
    component: () => import('order/MicroApp')
  }
];
```

### 2. iframe 模式

使用 iframe 隔离各个微应用：

```html
<!-- 主应用模板 -->
<div class="main-container">
  <nav>
    <!-- 导航菜单 -->
  </nav>
  <iframe 
    id="micro-iframe" 
    src="/dashboard" 
    frameborder="0"
    style="width: 100%; height: calc(100vh - 60px);">
  </iframe>
</div>
```

```javascript
// 路由切换
function navigateTo(path) {
  document.getElementById('micro-iframe').src = path;
}
```

### 3. Web Components 模式

使用 Web Components 技术封装微应用：

```javascript
// 微应用封装为 Web Component
class DashboardWidget extends HTMLElement {
  connectedCallback() {
    this.innerHTML = '<div id="dashboard-root"></div>';
    this.mountReactApp();
  }

  mountReactApp() {
    import('dashboard/App').then(({ default: App }) => {
      ReactDOM.render(<App />, this.querySelector('#dashboard-root'));
    });
  }

  disconnectedCallback() {
    ReactDOM.unmountComponentAtNode(this.querySelector('#dashboard-root'));
  }
}

customElements.define('dashboard-widget', DashboardWidget);
```

### 4. 运行时集成模式

使用专门的微前端框架在运行时动态加载微应用。

## 主流微前端解决方案

### 1. Single-SPA

Single-SPA 是最早的微前端框架之一，提供了完整的微前端生态系统。

基础配置：

```javascript
// single-spa 配置
import { registerApplication, start } from 'single-spa';

registerApplication({
  name: '@org/dashboard',
  app: () => System.import('@org/dashboard'),
  activeWhen: ['/dashboard']
});

registerApplication({
  name: '@org/user',
  app: () => System.import('@org/user'),
  activeWhen: ['/user']
});

start();
```

微应用入口文件：

```javascript
// dashboard/src/single-spa-index.js
import React from 'react';
import ReactDOM from 'react-dom';
import singleSpaReact from 'single-spa-react';
import App from './App';

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: App,
  errorBoundary(err, info, props) {
    return <div>发生错误: {err.message}</div>;
  }
});

export const { bootstrap, mount, unmount } = lifecycles;
```

### 2. qiankun（乾坤）

蚂蚁集团开源的微前端解决方案，基于 Single-SPA。

主应用配置：

```javascript
// 主应用 main.js
import { registerMicroApps, start } from 'qiankun';

registerMicroApps([
  {
    name: 'reactApp',
    entry: '//localhost:3001',
    container: '#react-container',
    activeRule: '/react',
  },
  {
    name: 'vueApp',
    entry: '//localhost:3002',
    container: '#vue-container',
    activeRule: '/vue',
  },
]);

start();
```

微应用配置：

```javascript
// React 微应用
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// 👇 将渲染操作放入 lifeCycle 完成后执行
function render(props) {
  const { container } = props;
  ReactDOM.render(<App />, container ? container.querySelector('#root') : document.querySelector('#root'));
}

// 独立运行时
if (!window.__POWERED_BY_QIANKUN__) {
  render({});
}

export async function bootstrap() {
  console.log('[react16] react app bootstraped');
}

export async function mount(props) {
  console.log('[react16] props from main framework', props);
  render(props);
}

export async function unmount(props) {
  const { container } = props;
  ReactDOM.unmountComponentAtNode(container ? container.querySelector('#root') : document.querySelector('#root'));
}
```

### 3. Module Federation

Webpack 5 提供的原生微前端解决方案。

主应用配置：

```javascript
// webpack.config.js (主应用)
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'shell',
      remotes: {
        dashboard: 'dashboard@http://localhost:3001/remoteEntry.js',
        user: 'user@http://localhost:3002/remoteEntry.js'
      },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
    }),
    new HtmlWebpackPlugin({
      template: './public/index.html'
    })
  ]
};
```

微应用配置：

```javascript
// webpack.config.js (微应用)
const { ModuleFederationPlugin } = require('webpack').container;

module.exports = {
  plugins: [
    new ModuleFederationPlugin({
      name: 'dashboard',
      filename: 'remoteEntry.js',
      exposes: {
        './DashboardApp': './src/App'
      },
      shared: { react: { singleton: true }, 'react-dom': { singleton: true } }
    })
  ]
};
```

使用远程模块：

```javascript
// 主应用中使用远程模块
import React, { Suspense } from 'react';

const RemoteDashboard = React.lazy(() => import('dashboard/DashboardApp'));

function App() {
  return (
    <div>
      <h1>主应用</h1>
      <Suspense fallback="Loading...">
        <RemoteDashboard />
      </Suspense>
    </div>
  );
}
```

## 微前端通信机制

### 1. Props 传递

```javascript
// 主应用向微应用传递数据
registerApplication({
  name: '@org/dashboard',
  app: () => System.import('@org/dashboard'),
  activeWhen: ['/dashboard'],
  customProps: {
    userInfo: currentUser,
    theme: currentTheme,
    onLogout: handleLogout
  }
});
```

### 2. 全局状态管理

```javascript
// 全局状态管理器
class GlobalState {
  constructor() {
    this.state = {};
    this.listeners = [];
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.listeners.forEach(listener => listener(this.state));
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getState() {
    return this.state;
  }
}

const globalState = new GlobalState();

// 微应用中使用
export function useGlobalState() {
  const [state, setState] = useState(globalState.getState());

  useEffect(() => {
    return globalState.subscribe(setState);
  }, []);

  return [state, globalState.setState.bind(globalState)];
}
```

### 3. 事件总线

```javascript
// 简单事件总线实现
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }

  off(event, callback) {
    if (this.events[event]) {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
  }
}

const eventBus = new EventBus();

// 使用示例
// 微应用A发送事件
eventBus.emit('user-login', { userId: 123, username: 'john' });

// 微应用B监听事件
eventBus.on('user-login', (data) => {
  console.log('用户登录:', data);
});
```

## 样式隔离方案

### 1. CSS Modules

```css
/* dashboard.module.css */
.container {
  background-color: #f0f0f0;
  padding: 20px;
}

.title {
  color: blue;
  font-size: 24px;
}
```

```javascript
import styles from './dashboard.module.css';

function Dashboard() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>仪表盘</h1>
    </div>
  );
}
```

### 2. Shadow DOM

```javascript
class IsolatedComponent extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'closed' });
    
    const style = document.createElement('style');
    style.textContent = `
      .container {
        background: red;
        padding: 10px;
      }
    `;
    
    const div = document.createElement('div');
    div.className = 'container';
    div.textContent = '这是隔离的组件';
    
    shadow.appendChild(style);
    shadow.appendChild(div);
  }
}

customElements.define('isolated-component', IsolatedComponent);
```

### 3. CSS 命名空间

```scss
// 使用 BEM 或其他命名约定
.dashboard {
  &__header {
    // header styles
  }
  
  &__content {
    // content styles
  }
  
  &__footer {
    // footer styles
  }
}
```

## 微前端部署策略

### 1. 独立部署

每个微应用独立构建和部署：

```dockerfile
# Dockerfile for micro-frontend
FROM nginx:alpine

COPY dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

### 2. 统一部署

所有微应用打包到一起部署：

```javascript
// 构建脚本
const fs = require('fs-extra');
const path = require('path');

async function buildMicroFrontends() {
  // 构建各个微应用
  await Promise.all([
    buildApp('dashboard'),
    buildApp('user'),
    buildApp('order')
  ]);

  // 复制到主应用目录
  await fs.copy('dashboard/dist', 'main-app/public/dashboard');
  await fs.copy('user/dist', 'main-app/public/user');
  await fs.copy('order/dist', 'main-app/public/order');
}
```

### 3. 动态加载

运行时从 CDN 或服务器动态加载微应用：

```javascript
// 动态加载微应用
async function loadMicroApp(appName) {
  const manifest = await fetch('/apps-manifest.json').then(res => res.json());
  const appInfo = manifest[appName];
  
  if (!appInfo) {
    throw new Error(`Micro app ${appName} not found`);
  }

  const script = document.createElement('script');
  script.src = appInfo.entry;
  script.onload = () => {
    // 初始化微应用
    window[appName].bootstrap();
  };
  
  document.head.appendChild(script);
}
```

## 微前端最佳实践

### 1. 技术选型原则

- **统一基础框架**：核心共享依赖保持一致
- **渐进式迁移**：从边缘业务开始试点
- **标准化接口**：定义清晰的通信协议

### 2. 团队协作规范

```javascript
// 微应用接口规范
interface MicroApp {
  // 生命周期方法
  bootstrap(): Promise<void>;
  mount(props: MountProps): Promise<void>;
  unmount(): Promise<void>;
  
  // 可选方法
  update?(props: UpdateProps): Promise<void>;
}

interface MountProps {
  container: HTMLElement;
  customProps: Record<string, any>;
  onGlobalStateChange: (callback: Function) => void;
  setGlobalState: (state: Record<string, any>) => void;
}
```

### 3. 性能优化

```javascript
// 预加载策略
class PreloadStrategy {
  static preloadApps(appNames) {
    appNames.forEach(appName => {
      // 预加载关键微应用
      import(/* webpackChunkName: "[request]" */ `@org/${appName}`);
    });
  }
  
  static prefetchApps(appNames) {
    // 低优先级预获取
    appNames.forEach(appName => {
      import(/* webpackPreload: true */ `@org/${appName}`);
    });
  }
}
```

### 4. 错误处理

```javascript
// 微应用错误边界
class MicroAppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // 上报错误
    console.error('MicroApp Error:', error, errorInfo);
    // 发送到监控系统
    reportError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>微应用加载失败，请稍后重试</div>;
    }

    return this.props.children;
  }
}
```

## 常见挑战与解决方案

### 1. 数据一致性

```javascript
// 使用分布式事务或最终一致性方案
class DataConsistencyManager {
  async executeTransaction(operations) {
    try {
      // 执行本地操作
      await operations.local();
      
      // 通知其他微应用
      eventBus.emit('data-changed', {
        type: 'user-profile-update',
        data: updatedData
      });
      
      // 记录操作日志用于补偿
      await this.logOperation(operationLog);
    } catch (error) {
      // 执行补偿操作
      await this.rollbackOperations(failedOps);
      throw error;
    }
  }
}
```

### 2. 跨应用状态管理

```javascript
// 使用 Zustand 或类似的状态管理库
import { create } from 'zustand';

const useGlobalStore = create((set, get) => ({
  user: null,
  theme: 'light',
  
  setUser: (user) => set({ user }),
  setTheme: (theme) => set({ theme }),
  
  // 跨应用状态同步
  syncWithStorage: () => {
    const stored = localStorage.getItem('global-state');
    if (stored) {
      set(JSON.parse(stored));
    }
  }
}));
```

### 3. 版本兼容性

```javascript
// 版本管理策略
const versionManager = {
  checkCompatibility(mainVersion, microVersion) {
    // 实现版本兼容性检查逻辑
    const mainParts = mainVersion.split('.');
    const microParts = microVersion.split('.');
    
    // 主版本号必须一致
    return mainParts[0] === microParts[0];
  },
  
  getCompatibleVersions(appName) {
    // 从版本服务获取兼容版本列表
    return fetch(`/api/versions/${appName}/compatible`).then(res => res.json());
  }
};
```

微前端作为一种重要的前端架构模式，在大型企业级应用中发挥着越来越重要的作用。通过合理的架构设计和实施策略，可以有效提升团队开发效率和系统可维护性。