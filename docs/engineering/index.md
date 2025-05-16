---
title: 前端工程化大纲
---
# 前端工程化大纲

## [一、前端工程化概述](./overview.md)
1. 什么是前端工程化
2. 前端工程化的必要性
3. 前端工程化的发展历程
4. 现代前端工程化的核心目标

## [二、模块化开发](./module.md)
1. JavaScript模块化
   - CommonJS
   - AMD/CMD
   - ES Module
2. CSS模块化
   - CSS预处理器(Sass/Less/Stylus)
   - CSS Modules
   - CSS-in-JS
3. 资源模块化
   - 图片、字体等资源的模块化处理

## [三、包管理与依赖管理](./packmanage.md)
1. npm/yarn/pnpm
   - 包管理工具比较
   - 依赖管理策略
   - lock文件的作用
2. 私有仓库搭建
   - Verdaccio
   - Nexus
3. Monorepo管理
   - Lerna
   - pnpm workspace
   - Turborepo

## [四、构建工具](./buildtools.md)
1. 构建工具发展历程
2. Webpack
   - 核心概念
   - 配置详解
   - 性能优化
   - 插件系统
3. Rollup
4. Vite/Esbuild/Snowpack
5. 构建工具选型策略

## [五、代码规范与质量保障](./eslint.md)
1. 代码规范
   - ESLint
   - Stylelint
   - Prettier
   - EditorConfig
2. 代码质量
   - SonarQube
   - 代码覆盖率
3. Git规范
   - Git Hooks
   - Commitlint
   - 分支管理策略

## [六、自动化测试](./autotesting.md)
1. 单元测试
   - Jest
   - Mocha
   - Vitest
2. 组件测试
   - React Testing Library
   - Vue Test Utils
3. E2E测试
   - Cypress
   - Playwright
   - Puppeteer
4. 测试覆盖率
   - Istanbul
   - Jest coverage

## [七、持续集成与部署(CI/CD)](./cicd.md)
1. CI/CD概念与流程
2. 常用CI/CD工具
   - GitHub Actions
   - GitLab CI
   - Jenkins
   - Travis CI
3. 自动化部署策略
   - 蓝绿部署
   - 灰度发布
   - 滚动更新
4. 部署平台
   - Docker容器化
   - Serverless部署
   - 静态资源托管

## [八、性能优化](./performance.md)
1. 构建性能优化
   - 构建速度优化
   - 产出物优化
2. 运行时性能优化
   - 代码分割
   - 懒加载
   - 缓存策略
   - 预加载/预渲染
3. 监控与分析
   - Lighthouse
   - Web Vitals
   - Performance API

## 九、微前端架构
1. 微前端概念与适用场景
2. 主流微前端方案
   - 单一SPA
   - Qiankun
   - Module Federation
   - Web Components
3. 微前端实践中的问题与解决方案

## 十、工程化进阶
1. 低代码平台建设
2. 组件库/工具链开发
3. 脚手架开发
   - Yeoman
   - Plop
   - 自定义CLI工具
4. 文档工具
   - Storybook
   - Docusaurus
   - Vitepress

## [十一、前端工程化未来趋势](./future.md)
1. 构建工具演进方向
2. 新标准与新特性
3. AI在前端工程化中的应用
4. 全栈工程化趋势

## 十二、实战项目
1. 从零搭建企业级前端工程化方案
2. 定制化脚手架开发
3. 性能优化实战
4. CI/CD流水线搭建
