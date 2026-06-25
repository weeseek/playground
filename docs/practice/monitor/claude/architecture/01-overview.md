# 架构概述

## 1. 设计原则

### 1.1 轻量优先

**原则**：核心功能最小化，扩展功能插件化

**实现**：

- 核心SDK只包含Monitor、Reporter、Queue三个核心类
- 所有监控功能通过插件实现
- 插件独立打包，按需加载
- 核心SDK无第三方依赖

**收益**：

- 核心SDK体积 <10KB (gzip)
- 用户按需加载，减少不必要的代码
- 更好的缓存利用

### 1.2 无侵入性

**原则**：不影响宿主应用正常运行

**实现**：

- 所有操作异步执行（requestIdleCallback）
- SDK内部错误静默处理，不影响宿主
- 拦截原生API后保持原有功能不变
- 页面卸载使用sendBeacon，不阻塞

**收益**：

- SDK错误不会导致宿主应用崩溃
- 对宿主应用性能影响最小
- 用户无感知接入

### 1.3 高可靠性

**原则**：监控数据不丢失

**实现**：

- 数据队列缓存，批量上报
- sendBeacon优先，页面卸载也能上报
- localStorage离线缓存
- 失败自动重试（最多3次）

**收益**：

- 上报成功率 >99%
- 离线数据不丢失
- 网络恢复自动上报

### 1.4 易扩展

**原则**：清晰的插件接口，灵活的配置系统

**实现**：

- 标准化Plugin接口
- 插件生命周期管理
- 所有功能可配置开关
- 支持自定义上报器和过滤器

**收益**：

- 用户可自定义插件
- 灵活配置监控范围
- 支持特殊场景适配

### 1.5 类型安全

**原则**：完整的TypeScript类型定义

**实现**：

- 所有公共API有类型定义
- 启用strict模式
- 类型导出供用户使用
- JSDoc注释补充说明

**收益**：

- IDE智能提示
- 编译时类型检查
- 更好的开发体验

---

## 2. 整体架构

### 2.1 架构图

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Monitor SDK                      │
├─────────────────────────────────────────────────────────────┤
│  核心层 (Core Layer)                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Monitor    │  │   Reporter   │  │    Queue     │     │
│  │  (主入口)     │  │  (数据上报)   │  │  (数据队列)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Context    │  │  EventBus    │  │  ConfigMgr   │     │
│  │  (上下文)     │  │  (事件总线)   │  │  (配置管理)   │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  内置插件层 (Built-in Plugins)                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │JSError   │ │Resource  │ │Promise   │ │PagePerf  │      │
│  │Plugin    │ │Error     │ │Error     │ │Plugin    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │WebVitals │ │Click     │ │Route     │ │Http      │      │
│  │Plugin    │ │Plugin    │ │Plugin    │ │Plugin    │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
├─────────────────────────────────────────────────────────────┤
│  扩展插件层 (Extension Plugins)                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐                   │
│  │VueError  │ │React     │ │Recorder  │                   │
│  │Plugin    │ │Error     │ │Plugin    │                   │
│  └──────────┘ └──────────┘ └──────────┘                   │
├─────────────────────────────────────────────────────────────┤
│  传输层 (Transport Layer)                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Beacon     │  │    XHR       │  │   Cache      │     │
│  │  Transport   │  │  Transport   │  │   Manager    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
├─────────────────────────────────────────────────────────────┤
│  工具层 (Utils Layer)                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   logger     │  │   helper     │  │    uuid      │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 层级说明

| 层级 | 职责 | 模块 |
|------|------|------|
| **核心层** | SDK主框架、数据上报、配置管理 | Monitor、Reporter、Queue、Context、EventBus |
| **内置插件层** | 核心监控功能 | 错误、性能、行为监控插件 |
| **扩展插件层** | 框架适配、高级功能 | Vue、React、录屏插件 |
| **传输层** | 数据传输、缓存管理 | Beacon、XHR、Cache |
| **工具层** | 通用工具函数 | logger、helper、uuid |

---

## 3. 技术栈选择

### 3.1 开发语言

**选择**：TypeScript 5.0+

**理由**：

- 类型安全，编译时检查错误
- 更好的IDE支持和代码提示
- 类型定义导出供用户使用
- 便于大型项目维护

**配置**：

```json
{
  "compilerOptions": {
    "target": "ES2015",
    "module": "ESNext",
    "lib": ["ES2015", "DOM"],
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  }
}
```

### 3.2 打包工具

**选择**：Rollup + esbuild

**理由**：

- Rollup：更好的Tree-shaking，输出格式多样
- esbuild：快速的TypeScript编译
- 支持UMD、ESM、CJS三种格式
- 插件独立打包

**配置**：

```javascript
export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/sdk.umd.js', format: 'umd', name: 'MonitorSDK' },
    { file: 'dist/sdk.esm.js', format: 'esm' },
    { file: 'dist/sdk.cjs.js', format: 'cjs' }
  ],
  plugins: [
    esbuild({ target: 'es2015' }),
    terser()
  ]
};
```

### 3.3 测试框架

**选择**：Vitest + Playwright

**理由**：

- Vitest：快速的单元测试，Vite原生支持
- Playwright：跨浏览器E2E测试
- 测试覆盖率报告
- TypeScript支持

### 3.4 文档工具

**选择**：TypeDoc

**理由**：

- 从TypeScript代码自动生成API文档
- JSDoc注释直接成为文档内容
- 保持代码和文档同步

---

## 4. 目录结构

```
packages/sdk/
├── src/
│   ├── core/                    # 核心模块
│   │   ├── Monitor.ts          # SDK主入口类
│   │   ├── Reporter.ts         # 数据上报类
│   │   ├── Queue.ts           # 数据队列类
│   │   ├── Context.ts         # 上下文管理
│   │   ├── EventBus.ts        # 事件总线
│   │   └── ConfigManager.ts   # 配置管理
│   │
│   ├── plugins/                # 内置插件
│   │   ├── error/             # 错误监控插件
│   │   │   ├── JSErrorPlugin.ts
│   │   │   ├── ResourceErrorPlugin.ts
│   │   │   ├── PromiseErrorPlugin.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── performance/        # 性能监控插件
│   │   │   ├── PagePerfPlugin.ts
│   │   │   ├── ResourcePerfPlugin.ts
│   │   │   ├── WebVitalsPlugin.ts
│   │   │   └── index.ts
│   │   │
│   │   └── behavior/          # 行为监控插件
│   │       ├── ClickPlugin.ts
│   │       ├── RoutePlugin.ts
│   │       ├── HttpPlugin.ts
│   │       └── index.ts
│   │
│   ├── extensions/            # 扩展插件（可选）
│   │   ├── vue/
│   │   │   ├── VueErrorPlugin.ts
│   │   │   └── index.ts
│   │   │
│   │   ├── react/
│   │   │   ├── ReactErrorPlugin.ts
│   │   │   ├── ErrorBoundary.tsx
│   │   │   └── index.ts
│   │   │
│   │   └── recorder/
│   │       ├── RecorderPlugin.ts
│   │       └── index.ts
│   │
│   ├── transport/             # 传输层
│   │   ├── BeaconTransport.ts
│   │   ├── XHRTransport.ts
│   │   ├── FetchTransport.ts
│   │   └── CacheManager.ts
│   │
│   ├── utils/                 # 工具函数
│   │   ├── logger.ts          # 调试日志
│   │   ├── helper.ts          # 辅助函数
│   │   ├── uuid.ts            # UUID生成
│   │   ├── throttle.ts        # 节流函数
│   │   └── debounce.ts        # 防抖函数
│   │
│   ├── types/                 # 类型定义
│   │   ├── index.ts           # 类型导出
│   │   ├── config.ts          # 配置类型
│   │   ├── data.ts            # 数据类型
│   │   ├── plugin.ts          # 插件类型
│   │   └── transport.ts       # 传输类型
│   │
│   └── index.ts               # SDK入口
│
├── dist/                      # 打包输出
│   ├── sdk.umd.js             # UMD格式
│   ├── sdk.umd.min.js         # UMD压缩版
│   ├── sdk.esm.js             # ESM格式
│   ├── sdk.esm.min.js         # ESM压缩版
│   ├── sdk.cjs.js             # CJS格式
│   └── plugins/               # 插件独立打包
│
├── test/                      # 测试文件
│   ├── unit/                  # 单元测试
│   ├── integration/           # 集成测试
│   └── e2e/                   # E2E测试
│
├── docs/                      # 文档
│   ├── requirement/           # 需求文档
│   └── architecture/          # 架构文档
│
├── rollup.config.js           # 打包配置
├── tsconfig.json              # TypeScript配置
├── vitest.config.ts           # 测试配置
├── package.json               # 包配置
├── README.md                  # 说明文档
└── CHANGELOG.md               # 变更记录
```

---

## 5. 模块职责

### 5.1 核心模块

| 模块 | 文件 | 职责 |
|------|------|------|
| **Monitor** | Monitor.ts | SDK主入口，管理插件、配置、生命周期 |
| **Reporter** | Reporter.ts | 数据上报，管理上报策略、批量上报 |
| **Queue** | Queue.ts | 数据队列，缓存、限流、存储管理 |
| **Context** | Context.ts | 运行上下文，用户信息、会话、环境 |
| **EventBus** | EventBus.ts | 内部事件通信，插件间消息传递 |
| **ConfigManager** | ConfigManager.ts | 配置管理，验证、合并、动态更新 |

### 5.2 插件模块

| 插件 | 职责 |
|------|------|
| **JSErrorPlugin** | 捕获JS运行时错误 |
| **ResourceErrorPlugin** | 捕获资源加载错误 |
| **PromiseErrorPlugin** | 捕获Promise未处理错误 |
| **PagePerfPlugin** | 采集页面加载性能 |
| **WebVitalsPlugin** | 采集Core Web Vitals |
| **ClickPlugin** | 捕获点击行为 |
| **RoutePlugin** | 捕获路由变化 |
| **HttpPlugin** | 拦截HTTP请求 |

### 5.3 传输模块

| 模块 | 职责 |
|------|------|
| **BeaconTransport** | sendBeacon方式上报 |
| **XHRTransport** | XMLHttpRequest方式上报 |
| **FetchTransport** | fetch方式上报 |
| **CacheManager** | localStorage/IndexedDB缓存管理 |

---

## 6. 依赖关系

### 6.1 模块依赖图

```
┌─────────┐
│ Monitor │
└────┬────┘
     │
     ├──► ┌─────────┐
     │    │ Config  │
     │    │ Manager │
     │    └─────────┘
     │
     ├──► ┌─────────┐
     │    │ Context │
     │    └─────────┘
     │
     ├──► ┌─────────┐
     │    │ Reporter│
     │    └────┬────┘
     │         │
     │         ├──► ┌─────────┐
     │         │    │  Queue  │
     │         │    └────┬────┘
     │         │         │
     │         │         └► ┌─────────┐
     │         │            │  Cache  │
     │         │            │ Manager │
     │         │            └─────────┘
     │         │
     │         └► ┌──────────────┐
     │            │ Transport    │
     │            │(Beacon/XHR)  │
     │            └──────────────┘
     │
     ├──► ┌──────────────┐
     │    │  EventBus    │
     │    └──────────────┘
     │
     └► ┌──────────────┐
        │   Plugins    │
        │  (via use()) │
        └──────────────┘
```

### 6.2 依赖原则

1. **单向依赖**：上层依赖下层，下层不依赖上层
2. **接口隔离**：模块间通过接口通信，不直接访问内部
3. **松耦合**：插件与核心通过EventBus通信，可独立运行

---

## 7. 设计决策记录

### 7.1 为什么选择插件化架构？

**背景**：需要支持多种监控场景，用户可能只需要部分功能

**方案对比**：

| 方案 | 优点 | 缺点 |
|------|------|------|
| 单体架构 | 简单、无依赖问题 | 包体积大、不灵活 |
| 插件化架构 | 轻量、灵活、可扩展 | 复杂度略高 |

**决策**：选择插件化架构

**理由**：

- 核心SDK体积最小化（<10KB）
- 用户按需加载，减少不必要代码
- 方便扩展新功能，不影响核心
- 框架插件（Vue/React）独立可选

### 7.2 为什么选择sendBeacon优先？

**背景**：页面卸载时需要上报数据，传统XHR可能被取消

**方案对比**：

| 方案 | 页面卸载时 | 兼容性 |
|------|------------|--------|
| XMLHttpRequest | 可能被取消 | 全兼容 |
| fetch | 可能被取消 | 不支持IE |
| sendBeacon | 保证发送 | 不支持IE |

**决策**：sendBeacon优先，XHR降级

**理由**：

- sendBeacon保证页面卸载时数据发送
- 浏览器支持率高（除IE）
- IE11使用XHR降级
- 不阻塞页面卸载

### 7.3 为什么不使用第三方库？

**背景**：需要最小化包体积

**决策**：核心SDK零第三方依赖

**理由**：

- 每个第三方库都会增加包体积
- 核心功能（事件监听、数据上报）不需要复杂库
- 工具函数自行实现，体积可控
- 用户项目可能有重复依赖
