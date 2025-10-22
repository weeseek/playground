# 代码规范与质量保障

## ESLint 简介

ESLint 是一个开源的 JavaScript 代码检查工具，由 Nicholas C. Zakas 于 2013 年创建。它被设计为完全可配置的，允许开发者定义自己的代码规范，并能够在开发过程中实时检测代码质量问题。

### 主要特点

- **可插拔性**：每个规则都是独立的插件，可以根据需要开启或关闭
- **可配置性**：可以详细配置每条规则的行为
- **可扩展性**：支持自定义规则和插件
- **实时反馈**：集成到编辑器中，提供实时错误提示
- **自动修复**：部分规则支持自动修复功能

## 安装与基本配置

### 安装 ESLint

```bash
# 全局安装
npm install -g eslint

# 本地安装（推荐）
npm install --save-dev eslint

# 初始化配置文件
npx eslint --init
```

### 基本配置文件

`.eslintrc.js` 示例配置：

```javascript
module.exports = {
  // 指定脚本的运行环境
  env: {
    browser: true,
    es2021: true,
    node: true
  },
  
  // 指定要使用的扩展
  extends: [
    'eslint:recommended',
    '@typescript-eslint/recommended'
  ],
  
  // 解析器选项
  parserOptions: {
    ecmaVersion: 12,
    sourceType: 'module'
  },
  
  // 规则配置
  rules: {
    'indent': ['error', 2],
    'quotes': ['error', 'single'],
    'semi': ['error', 'always']
  }
};
```

## 核心概念

### Rules（规则）

ESLint 中的每条规则都是独立的，可以设置为以下三种状态之一：

- `"off"` 或 `0` - 关闭规则
- `"warn"` 或 `1` - 开启警告（不影响退出码）
- `"error"` 或 `2` - 开启错误（触发时退出码为1）

### Environments（环境）

预定义了特定环境的全局变量，常见的环境包括：

```javascript
{
  "env": {
    "browser": true,    // 浏览器全局变量
    "node": true,       // Node.js 全局变量
    "es6": true,        // ES6 语法和环境
    "jest": true,       // Jest 测试环境
    "jquery": true      // jQuery 全局变量
  }
}
```

### Extends（继承）

通过 extends 可以继承现有的配置集：

```javascript
{
  "extends": [
    "eslint:recommended",           // ESLint 推荐规则
    "plugin:react/recommended",     // React 推荐规则
    "plugin:vue/vue3-essential",    // Vue3 基础规则
    "@vue/prettier"                 // Prettier 集成
  ]
}
```

## 高级配置

### 配置层级和优先级

ESLint 的配置遵循一定的优先级顺序：

1. 行内配置（/*eslint-disable*/ 等）
2. 命令行选项
3. 项目级配置文件（.eslintrc.*）
4. 用户主目录配置文件

### 自定义规则

创建自定义规则以满足特定项目需求：

```javascript
// eslint-plugin-custom/index.js
module.exports = {
  rules: {
    'no-console-log': {
      create(context) {
        return {
          CallExpression(node) {
            if (
              node.callee.type === 'MemberExpression' &&
              node.callee.object.name === 'console' &&
              node.callee.property.name === 'log'
            ) {
              context.report({
                node,
                message: 'Unexpected console.log statement.'
              });
            }
          }
        };
      }
    }
  }
};
```

### 插件系统

ESLint 支持丰富的插件生态系统：

```javascript
{
  "plugins": [
    "react",
    "vue",
    "@typescript-eslint"
  ],
  "rules": {
    "react/prop-types": "error",
    "vue/no-unused-vars": "error",
    "@typescript-eslint/explicit-function-return-type": "warn"
  }
}
```

## 与其他工具集成

### 与 Prettier 集成

Prettier 是代码格式化工具，与 ESLint 结合使用可以实现代码风格统一：

```bash
npm install --save-dev eslint-config-prettier eslint-plugin-prettier
```

配置示例：

```javascript
{
  "extends": [
    "eslint:recommended",
    "prettier"  // 必须放在最后，用于禁用与 prettier 冲突的规则
  ],
  "plugins": ["prettier"],
  "rules": {
    "prettier/prettier": "error"
  }
}
```

### 与 TypeScript 集成

```bash
npm install --save-dev @typescript-eslint/parser @typescript-eslint/eslint-plugin
```

配置示例：

```javascript
{
  "parser": "@typescript-eslint/parser",
  "plugins": ["@typescript-eslint"],
  "extends": [
    "eslint:recommended",
    "@typescript-eslint/recommended"
  ]
}
```

### CI/CD 集成

在持续集成流程中集成 ESLint 检查：

```yaml
# .github/workflows/ci.yml
name: CI
on: [push, pull_request]
jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm ci
      - run: npx eslint . --ext .js,.ts,.jsx,.tsx
```

## 性能优化

### 忽略文件配置

使用 `.eslintignore` 文件排除不需要检查的文件：

```text
node_modules/
dist/
build/
*.min.js
coverage/
```

### 缓存机制

启用缓存可以显著提高重复检查的速度：

```bash
eslint . --cache --cache-location ./node_modules/.cache/eslint/
```

### 并行处理

对于大型项目，可以使用多进程并行处理：

```bash
npm install --save-dev eslint-plugin-parallel
```

## 最佳实践

### 团队协作规范

1. **统一配置**：团队内使用相同的 ESLint 配置
2. **版本控制**：将配置文件纳入版本控制系统
3. **自动化检查**：在 Git Hooks 和 CI 中强制执行检查

### Git Hooks 集成

使用 husky 和 lint-staged 实现提交前检查：

```bash
npm install --save-dev husky lint-staged
```

配置 package.json：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged"
    }
  },
  "lint-staged": {
    "*.{js,jsx,ts,tsx}": [
      "eslint --fix",
      "git add"
    ]
  }
}
```

### IDE 集成

主流编辑器都支持 ESLint 插件：

- VS Code: ESLint 官方插件
- WebStorm: 内置支持
- Vim: ALE 或 coc-eslint 插件

### 渐进式采用

对于遗留项目，可以采用渐进式的方式引入 ESLint：

1. 先启用基础规则，避免大量错误
2. 逐步增加更严格的规则
3. 使用 `--quiet` 参数先解决 error 级别问题
4. 将特定文件加入 ignore 列表暂时跳过

## 常见问题与解决方案

### 规则冲突解决

当多个配置来源产生冲突时，应明确配置优先级：

```javascript
{
  // 明确指定规则优先级
  "rules": {
    // 覆盖继承的规则
    "no-console": "error",
    // 自定义规则优先级高于 extend
    "prefer-const": "warn"
  }
}
```

### 性能问题优化

针对大型项目的性能优化建议：

1. 合理配置忽略文件
2. 启用缓存机制
3. 适当调整规则严格程度
4. 分批处理不同类型的文件

### 错误抑制技巧

合理使用 ESLint 注释指令：

```javascript
// 禁用单行规则
alert('foo'); // eslint-disable-line no-alert

// 禁用下一行规则
// eslint-disable-next-line no-console
console.log('bar');

// 禁用整个文件的规则
/* eslint-disable no-undef */
// 文件内容...
/* eslint-enable no-undef */
```

通过合理配置和使用 ESLint，可以显著提高代码质量和团队协作效率，建立良好的代码规范体系。