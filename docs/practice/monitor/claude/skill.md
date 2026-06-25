# Frontend Monitor Development Skill

前端监控项目全流程开发指导技能，覆盖从需求分析到上线的完整开发周期。

## 项目结构

```
monitor_claude_2/
├── packages/
│   ├── sdk/              # 前端监控SDK
│   ├── server/           # 后端服务
│   ├── console/         # 管理控制台（前端）
│   └── demo/            # 演示项目
├── docs/                # 项目文档
└── .claude/             # Claude配置
```

## 工作流程

### 1. 需求分析

当接收到新需求时：

- 明确需求的目标用户和使用场景
- 确定影响范围（SDK/服务端/控制台）
- 评估性能影响，特别是SDK端的包体积和运行时性能
- 输出需求文档，包含功能描述、验收标准、技术方案概要

### 2. 架构设计

设计阶段需遵循：

**SDK设计原则：**

- 最小化包体积，按需加载
- 避免阻塞主线程，使用异步上报
- 兼容性优先，支持主流浏览器
- 提供清晰的API和TypeScript类型定义

**服务端设计原则：**

- 高吞吐量，支持批量数据写入
- 数据存储考虑查询效率
- 提供RESTful API和必要的鉴权

**控制台设计原则：**

- 数据可视化清晰直观
- 响应式设计，支持移动端
- 组件复用，保持UI一致性

### 3. 代码开发

开发规范：

**通用规范：**

- 使用TypeScript，启用严格模式
- 遵循ESLint和Prettier配置
- 提交前确保类型检查和lint通过
- 编写有意义的提交信息

**SDK开发：**

```typescript
// 监控数据上报接口
interface MonitorData {
  type: 'error' | 'performance' | 'behavior';
  timestamp: number;
  data: unknown;
}

// 使用请求空闲时上报
const report = (data: MonitorData) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(() => send(data));
  } else {
    setTimeout(() => send(data), 0);
  }
};
```

**服务端开发：**

- 使用统一的错误处理中间件
- 日志记录关键操作和错误
- 接口添加请求限流

**控制台开发：**

- 组件采用函数式写法 + Hooks
- 状态管理按模块划分
- 使用CSS Modules或Tailwind保持样式隔离

### 4. 数据格式拉齐（跨模块一致性）

> **重要**：SDK、Server、Console三个模块的数据格式必须保持一致，任何变更都需评估跨模块影响，防止数据格式未拉齐导致的bug。

#### 4.1 共享类型定义机制

**推荐方案**：创建共享类型包

```
packages/
├── shared-types/           # 共享类型定义包
│   ├── src/
│   │   ├── monitor-data.ts  # 监控数据类型
│   │   ├── error.ts         # 错误类型定义
│   │   ├── performance.ts   # 性能类型定义
│   │   ├── behavior.ts      # 行为类型定义
│   │   ├── alert.ts         # 告警类型定义
│   │   ├── api.ts           # API请求/响应类型
│   │   └── index.ts         # 类型导出
│   └── package.json
```

**类型定义示例**：

```typescript
// packages/shared-types/src/error.ts

/**
 * 错误数据格式 - SDK上报、Server存储、Console展示必须一致
 */
export interface ErrorData {
  type: 'error';
  subtype: 'js' | 'resource' | 'promise' | 'vue' | 'react';
  timestamp: number;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  stack?: string;
  userId?: string;
  sessionId?: string;
  url?: string;
  userAgent?: string;
  metaData?: Record<string, unknown>;
  breadcrumbs?: Breadcrumb[];
}

/**
 * 聚合错误 - Server存储、Console展示格式
 */
export interface AggregatedError {
  id: string;
  projectId: string;
  fingerprint: string;
  message: string;
  filename?: string;
  lineno?: number;
  colno?: number;
  occurrenceCount: number;
  affectedUsers: number;
  affectedSessions: number;
  firstOccurrence: number;
  lastOccurrence: number;
  status: 'open' | 'resolved' | 'ignored';
}
```

**各模块引用**：

```typescript
// SDK使用
import { ErrorData } from '@monitor/shared-types';

// Server使用
import { ErrorData, AggregatedError } from '@monitor/shared-types';

// Console使用
import { AggregatedError } from '@monitor/shared-types';
```

#### 4.2 数据格式变更流程

**任何数据格式变更必须遵循此流程**：

```
┌─────────────────────────────────────────────────────────────┐
│                   数据格式变更流程                           │
├─────────────────────────────────────────────────────────────┤
│  1. 识别变更影响范围                                         │
│     - 是否影响SDK上报格式？                                  │
│     - 是否影响Server存储格式？                               │
│     - 是否影响Console展示格式？                              │
│                                                             │
│  2. 更新共享类型定义                                         │
│     - 在shared-types中修改类型                               │
│     - 更新类型注释和文档                                     │
│                                                             │
│  3. 评估兼容性                                               │
│     - SDK: 是否需要向后兼容？旧版本SDK数据能否处理？          │
│     - Server: 数据库是否需要迁移？旧数据如何处理？            │
│     - Console: API响应格式变化，前端是否兼容？                │
│                                                             │
│  4. 同步更新三模块                                           │
│     - SDK: 更新上报逻辑                                      │
│     - Server: 更新接收/存储/查询逻辑                          │
│     - Console: 更新展示组件                                  │
│                                                             │
│  5. 编写集成测试                                             │
│     - SDK上报 → Server接收 → Console展示 全链路测试          │
│                                                             │
│  6. 文档更新                                                 │
│     - 更新API文档                                            │
│     - 更新CHANGELOG                                          │
│     - 标注版本兼容性                                         │
└─────────────────────────────────────────────────────────────┘
```

#### 4.3 拉齐检查清单

**新功能开发前**：

- [ ] 查看shared-types中的现有类型定义
- [ ] 确认数据格式是否已定义
- [ ] 如需新增，先定义类型再开发

**代码提交前**：

- [ ] 类型定义是否已同步到shared-types
- [ ] SDK上报字段与Server接收字段是否一致
- [ ] Server存储字段与Console展示字段是否一致
- [ ] 字段命名是否统一（如：userId vs user_id）
- [ ] 时间戳格式是否统一（毫秒 vs 秒）
- [ ] 可选字段标记是否一致（required vs optional）

**测试验证**：

- [ ] SDK上报数据Server能否正确解析
- [ ] Server查询数据Console能否正确渲染
- [ ] 边界值测试（空值、缺失字段）

#### 4.4 常见数据格式不一致问题

| 问题类型 | 示例 | 预防措施 |
|----------|------|----------|
| 字段命名不一致 | SDK用`userId`, Server用`user_id` | 使用shared-types统一命名 |
| 时间格式不一致 | SDK用毫秒, Server存储秒 | 类型定义明确注释单位 |
| 可选字段不一致 | SDK可选字段Server未处理空值 | 类型定义明确`?`标记 |
| 嵌套结构不一致 | SDK扁平结构, Server期望嵌套 | 定义完整嵌套类型 |
| 版本兼容性 | 新版本SDK发送新字段,旧Server报错 | Server忽略未知字段 |

#### 4.5 数据拉齐验证脚本

```bash
# 在CI/CD中运行，验证类型一致性
npm run check:types          # 检查类型定义一致性
npm run check:api-schema     # 检查API schema一致性
npm run test:integration     # 运行集成测试验证数据流
```

---

### 5. 代码审查

审查清单：

**数据拉齐审查要点**：

- [ ] 类型定义是否在shared-types中同步
- [ ] SDK/Server/Console数据格式是否一致
- [ ] 字段命名、类型、可选性是否统一
- [ ] 变更是否影响其他模块

**SDK审查要点：**

- [ ] 包体积影响评估
- [ ] 是否有内存泄漏风险（事件监听、定时器）
- [ ] 错误处理是否完善
- [ ] API文档是否更新
- [ ] 兼容性测试是否通过

**服务端审查要点：**

- [ ] SQL注入、XSS等安全检查
- [ ] 接口权限验证
- [ ] 错误处理和日志记录
- [ ] 性能关键路径是否优化
- [ ] 数据格式与SDK/Console是否一致

**控制台审查要点：**

- [ ] 组件复用性
- [ ] 无障碍访问（a11y）
- [ ] 响应式布局
- [ ] 加载状态和错误状态处理
- [ ] API响应类型与Server是否一致

### 5. 测试

测试要求：

**单元测试：**

- SDK核心功能覆盖率 > 80%
- 服务端业务逻辑覆盖率 > 70%
- 控制台关键组件测试

**集成测试：**

- SDK到服务端的完整上报链路
- 控制台与服务端的API交互

**E2E测试：**

- 关键用户流程（登录、查看监控数据、配置告警）

```bash
# 运行测试
npm run test              # 单元测试
npm run test:e2e          # E2E测试
npm run test:coverage     # 覆盖率报告
```

### 6. 打包

打包流程：

**SDK打包：**

```bash
cd packages/sdk
npm run build        # 生成umd/esm/cjs格式
npm run build:min     # 压缩版本
```

**服务端打包：**

```bash
cd packages/server
npm run build        # 编译TypeScript
```

**控制台打包：**

```bash
cd packages/console
npm run build        # 生产环境构建
```

**打包检查：**

- SDK包体积是否符合预期
- SourceMap是否正确生成
- 版本号是否更新

### 7. 上线部署

部署步骤：

**预发布检查：**

- [ ] 所有测试通过
- [ ] 文档更新完成
- [ ] CHANGELOG已更新
- [ ] 环境变量配置正确

**部署顺序：**

1. 服务端部署（数据库迁移优先）
2. SDK版本发布（NPM发布）
3. 控制台部署

**发布后验证：**

- 监控数据是否正常上报
- 控制台功能是否正常
- 错误日志监控

## 常用命令

```bash
# 开发
npm run dev                    # 启动开发环境
npm run dev:sdk                 # 仅启动SDK开发
npm run dev:server              # 仅启动服务端
npm run dev:console             # 仅启动控制台

# 构建
npm run build                   # 构建所有包
npm run build:sdk               # 构建SDK

# 测试
npm run test                    # 运行测试
npm run lint                    # 代码检查

# 发布
npm run release                 # 发布流程
npm run release:patch           # 补丁版本
npm run release:minor           # 次版本
npm run release:major           # 主版本
```

## 注意事项

1. **SDK发布谨慎**：SDK一旦发布，用户可能长时间不更新，API变更需要向后兼容
2. **数据安全**：监控数据可能包含敏感信息，注意脱敏处理
3. **性能影响**：SDK运行在用户浏览器，必须保证对宿主应用影响最小
4. **告警配置**：生产环境配置合理的错误告警阈值

## 相关资源

- [SDK API文档](../packages/sdk/README.md)
- [服务端API文档](../packages/server/README.md)
- [控制台开发指南](../packages/console/README.md)
- [贡献指南](../CONTRIBUTING.md)
