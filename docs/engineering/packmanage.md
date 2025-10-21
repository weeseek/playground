# 前端工程化 – 包管理与依赖管理全攻略

## 目录

1. [背景与目标](#_1-背景与目标)  
2. [国内镜像服务](#_2-国内镜像服务)  
3. [包管理工具选择](#_3-包管理工具选择)  
4. [依赖管理最佳实践](#_4-依赖管理最佳实践)  
5. [私有仓库（本地镜像）](#_5-私有仓库本地镜像)  
6. [安全与合规](#_6-安全与合规)  
7. [CI/CD 集成](#_7-cicd-集成)  
8. [性能优化技巧](#_8-性能优化技巧)  
9. [总结与下一步](#_9-总结与下一步)  

---

## 1. 背景与目标

> 随着前端项目规模的扩大，**依赖爆炸**、**网络不稳定**、**合规审计** 等问题愈发突出。  
> 传统的 `npm install` 方式在国内网络环境下常出现超时、下载不完整甚至被墙的情况。  
> 本文旨在：

1. **提升下载速度**：使用国内镜像、缓存、离线安装。  
2. **保证可复现**：锁定依赖版本，使用 `--frozen-lockfile`。  
3. **降低磁盘占用**：采用 `pnpm` 的硬链接机制。  
4. **支持 monorepo**：统一管理多包项目。  
5. **实现安全合规**：自动审计、自动升级。  
6. **实现 CI/CD 自动化**：缓存、并行构建、发布。  

---

## 2. 国内镜像服务

| 镜像 | 说明 | 访问地址 | 推荐理由 |
|------|------|----------|----------|
| **npmmirror.com** | 官方镜像，保持同步，兼容性好 | `https://registry.npmmirror.com` | 官方维护、最快、最稳定 |
| **cnpmjs.org** | 兼容 npm 的 CLI，提供 `cnpm` 命令 | `https://r.cnpmjs.org` | 与 npm CLI 兼容，适合老项目 |
| **腾讯云 npm 镜像** | 与 npmmirror 同源 | `https://registry.npmmirror.com` | 企业级稳定性 |
| **本地私有镜像** | 私有包、内部 npm | 通过 Verdaccio / Nexus / Artifactory | 内部安全、可控 |

> **统一使用 `npmmirror.com`**，因为它是官方镜像，保持同步最快，兼容性最佳。  
> 只需在全局或项目级 `.npmrc` / `.yarnrc.yml` 中配置即可。

### 2.1 全局配置示例

```bash
# npm
npm config set registry https://registry.npmmirror.com
npm config set fetch-retries 5
npm config set fetch-retry-factor 2
npm config set fetch-retry-mintimeout 10000
npm config set fetch-retry-maxtimeout 60000

# Yarn Classic
yarn config set registry https://registry.npmmirror.com

# Yarn Berry
yarn config set npmRegistryServer https://registry.npmmirror.com

# pnpm
pnpm config set registry https://registry.npmmirror.com
```

> **项目级配置**（`.npmrc`）也可以放在根目录，覆盖全局设置。

```ini
# .npmrc
registry=https://registry.npmmirror.com
fetch-retries=5
fetch-retry-factor=2
fetch-retry-mintimeout=10000
fetch-retry-maxtimeout=60000
```

---

## 3. 包管理工具选择

| 工具 | 适用场景 | 特色 | 国内化建议 |
|------|----------|------|------------|
| **npm** | 传统、最基础 | 官方维护、兼容性好 | 仅用于 `npm ci`，不建议直接 `npm install` |
| **Yarn Classic** | 旧项目、社区插件 | `yarn.lock`、工作区 | `yarn install --frozen-lockfile` |
| **Yarn Berry (v2+)** | 新项目、Pnp | Plug’n’Play、零 `node_modules` | 需要 `nodeLinker: node-modules` 以兼容旧依赖 |
| **pnpm** | 性能、磁盘占用 | `pnpm-lock.yaml`、硬链接 | 推荐作为主工具，支持 workspace、严格 peer |

> **国内化推荐**：**pnpm** 兼具性能与安全，官方支持国内镜像。  
> 若项目已有 Yarn Classic，可迁移到 pnpm 以享受更快的安装速度。

### 3.1 pnpm 迁移脚本

```bash
# 1. 安装 pnpm
npm i -g pnpm

# 2. 迁移 lockfile
pnpm import  # 将 package-lock.json 转为 pnpm-lock.yaml

# 3. 安装依赖
pnpm install

# 4. 生成 pnpm-lock.yaml 并提交
git add pnpm-lock.yaml
```

> 迁移后，删除 `node_modules` 并在 CI 中使用 `pnpm install --frozen-lockfile`。

---

## 4. 依赖管理最佳实践

### 4.1 版本锁定

| 文件 | 说明 |
|------|------|
| `package-lock.json` | npm |
| `yarn.lock` | Yarn Classic |
| `pnpm-lock.yaml` | pnpm |

> **国产化**：在 CI 中使用 `--frozen-lockfile`，确保每次构建使用相同依赖版本。

### 4.2 Workspace / Monorepo

| 工具 | 配置示例 | 说明 |
|------|----------|------|
| **pnpm** | `pnpm-workspace.yaml` | 支持多包共享依赖、并行安装 |
| **Yarn Classic** | `package.json` `workspaces` | 旧项目可继续使用 |
| **Yarn Berry** | `package.json` `workspaces` | 需要 `nodeLinker: node-modules` |

#### pnpm-workspace.yaml 示例

```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

#### package.json 示例（monorepo）

```json
{
  "name": "my-monorepo",
  "private": true,
  "workspaces": [
    "packages/*",
    "apps/*"
  ],
  "devDependencies": {
    "typescript": "^5.4"
  }
}
```

> **建议**：将公共工具、组件、服务拆分为 `packages/*`，业务功能拆分为 `apps/*`，通过 workspace 共享依赖，避免重复下载。

### 4.3 依赖冲突与 dedupe

- **pnpm**：默认按严格模式安装，避免多版本冲突。  
- **npm 7+**：支持 `npm dedupe` 自动合并。  
- **Yarn**：`yarn dedupe`。

> **示例**：若 `react` 在不同包中出现多版本，可在根 `package.json` 统一声明 `react` 版本，pnpm 会自动 dedupe。

### 4.4 Peer Dependencies

- **pnpm**：默认不自动安装 Peer，需手动添加或使用 `--save-peer`。  
- **Yarn 2+**：自动安装 Peer。  
- **npm**：自 7 起自动安装 Peer。

> **实践**：在根 `package.json` 统一声明 `peerDependencies`，并在子包中使用 `pnpm add -O` 或 `pnpm add -P` 进行显式声明。

---

## 5. 私有仓库（本地镜像）

| 方案 | 说明 | 典型配置 |
|------|------|----------|
| **Verdaccio** | 轻量级私有 npm，支持镜像、缓存、权限 | `verdaccio.yaml` → `storage`, `uplinks`, `packages` |
| **Nexus Repository OSS** | 企业级，支持多仓库类型 | `npm` → `npm-hosted`, `npm-proxy`, `npm-group` |
| **Artifactory OSS** | 兼容 npm，支持高级权限 | `npm-hosted`, `npm-proxy` |

> **配置示例（Verdaccio）**

```yaml
storage: ./storage
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
packages:
  '@my-org/*':
    access: $all
    publish: $authenticated
    proxy: npmjs
```

> **使用**：在项目 `.npmrc` 中添加 `registry=http://localhost:4873`。

---

## 6. 安全与合规

| 工具 | 说明 | 适用场景 |
|------|------|----------|
| **npm audit** | 内置依赖安全扫描 | 任何 npm/yarn/pnpm |
| **Snyk** | 详细报告、自动修复 | 需要更细粒度的安全分析 |
| **Dependabot** | 自动 PR 更新 | GitHub、GitLab |
| **Renovate** | 兼容多平台 | 大型 monorepo、CI 集成 |

> **实践**：在 PR 触发时执行 `npm audit --production`，若发现 CVE 自动生成 PR；在 CI 里执行 `pnpm audit` 并强制通过 `--audit-level=high`。

---

## 7. CI/CD 集成

| 步骤 | 说明 | 示例 |
|------|------|------|
| **缓存策略** | 缓存 `node_modules` 或 pnpm store | GitHub Actions: `actions/cache@v4` |
| **可复现安装** | 使用 lockfile + frozen | `pnpm install --frozen-lockfile` |
| **构建脚本** | 统一入口 | `npm run build` / `pnpm build` |
| **安全检查** | 结合 audit | `pnpm audit --audit-level=high` |
| **发布** | 通过 npm / Verdaccio | `npm publish --access=public` |

### 7.1 GitHub Actions 示例

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm test
      - run: pnpm build
```

> **缓存**：`cache: 'pnpm'` 会自动使用 pnpm store 缓存，进一步提升速度。

---

## 8. 性能优化技巧

| 技术 | 说明 | 适用场景 |
|------|------|----------|
| **pnpm** | 硬链接、共享依赖、磁盘占用 < 1/3 | 大型项目、CI |
| **Yarn Plug'n'Play** | 零 `node_modules` | 需要极致速度、无文件系统开销 |
| **离线安装** | `pnpm install --offline` | 网络不稳定环境 |
| **并行安装** | `pnpm install -r` | monorepo |
| **缓存** | `pnpm store` | CI 缓存加速 |

> **实践**：在 CI 里使用 `pnpm install --frozen-lockfile --offline`，并将 `~/.pnpm-store` 缓存到 CI 缓存。

---

## 9. 总结与下一步

> 通过本文，你已经掌握了：
> - 国内镜像的配置与使用  
> - pnpm 作为主力包管理器的优势与迁移方法  
> - 依赖锁定、workspace/monorepo 的最佳实践  
> - 私有仓库的搭建与使用  
> - 安全审计、CI/CD 自动化与缓存策略  
> - 性能优化技巧，显著提升构建速度与磁盘占用  

> **下一步**  
> 1. **完善 CI/CD**：加入自动发布、代码质量检查（ESLint、Prettier）  
> 2. **监控与告警**：使用 Dependabot、Renovate 的通知机制  
> 3. **持续改进**：定期清理不再使用的依赖、升级到最新安全版本  
> 4. **团队协同**：制定包管理规范、共享 `.npmrc`、统一镜像地址  

> **祝你在前端工程化之路上一路顺风 🚀**  

---  

> **参考链接**  
> - [npmmirror.com](https://registry.npmmirror.com)  
> - [pnpm 官方文档](https://pnpm.io/zh/)  
> - [Verdaccio 官方](https://verdaccio.org)  
> - [npm audit](https://docs.npmjs.com/cli/v9/commands/npm-audit)  
> - [Snyk](https://snyk.io)  
> - [Dependabot](https://dependabot.com)  
