# 构建工具

## 构建工具发展历程

构建工具的发展经历了几个重要阶段：

1. **早期阶段**：简单的文件合并和压缩工具，如YUI Compressor、UglifyJS
2. **模块化时代**：CommonJS、AMD规范催生了Browserify、RequireJS等工具
3. **工程化时代**：Webpack、Rollup等现代构建工具出现，支持复杂的依赖管理和代码分割
4. **现代化时代**：Vite、Snowpack等基于ESM的构建工具兴起，强调开发体验和构建速度

## Webpack

### 核心概念

- **Entry（入口）**：指示 webpack 应该使用哪个模块，来作为构建其内部依赖图的开始
- **Output（出口）**：告诉 webpack 在哪里输出它所创建的 bundles，以及如何命名这些文件
- **Loaders（加载器）**：让 webpack 能够去处理那些非 JavaScript 文件（webpack 自身只理解 JavaScript）
- **Plugins（插件）**：可以用于执行范围更广的任务，从打包优化和压缩，一直到重新定义环境中的变量
- **Mode（模式）**：通过选择 development 或 production 之中的一个，来设置 mode 参数，你可以启用相应模式下的 webpack 内置的优化

### 配置详解

```javascript
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  // 入口配置
  entry: {
    app: './src/index.js',
    vendor: './src/vendor.js'
  },
  
  // 输出配置
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: '[name].[contenthash].js',
    clean: true
  },
  
  // 模块规则
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  
  // 插件配置
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html'
    })
  ],
  
  // 开发工具
  devtool: 'inline-source-map',
  
  // 开发服务器
  devServer: {
    contentBase: './dist',
    hot: true
  }
};
```

### 性能优化

#### 代码分割

代码分割是 webpack 中最引人注目的特性之一，它可以将代码拆分成多个 bundle，然后可以按需加载或并行加载。

```javascript
module.exports = {
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

#### 缓存策略

通过配置 output.filename 中的 hash 值，当文件内容发生变化时，文件名也会改变，从而有效地利用浏览器缓存。

```javascript
output: {
  filename: '[name].[contenthash].js',
}
```

#### Tree Shaking

移除 JavaScript 上下文中未引用的代码，依赖于 ES2015 模块语法的静态结构特性。

```javascript
// webpack.config.js
module.exports = {
  mode: 'production',
  optimization: {
    usedExports: true,
    minimize: true
  }
};
```

### 插件系统

Webpack 插件向第三方开发者提供了 webpack 引擎中完整的能力。使用阶段式的构建回调，开发者可以引入它们自己的行为到 webpack 构建流程中。

自定义插件示例：

```javascript
class MyPlugin {
  apply(compiler) {
    compiler.hooks.done.tap('MyPlugin', (stats) => {
      console.log('编译完成！');
    });
  }
}

module.exports = MyPlugin;
```

常用插件：
- `HtmlWebpackPlugin`：简化 HTML 文件的创建
- `MiniCssExtractPlugin`：将 CSS 提取到单独的文件中
- `CleanWebpackPlugin`：清理构建目录
- `DefinePlugin`：创建编译时可以配置的全局常量

## Rollup

Rollup 是一个 JavaScript 模块打包器，可以将小块代码编译成大块复杂的代码，例如 library 或应用程序。

### 特点

1. **ES6 模块优先**：充分利用 ES6 模块的静态结构特性
2. **Tree Shaking**：自动移除未使用的代码
3. **更小的输出**：生成的代码更加简洁，没有额外的包装器函数
4. **多种输出格式**：支持 ES 模块、CommonJS、IIFE 等格式

### 配置示例

```javascript
// rollup.config.js
export default {
  input: 'src/main.js',
  output: {
    file: 'bundle.js',
    format: 'cjs'
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: 'node_modules/**'
    })
  ]
};
```

## Vite/Esbuild/Snowpack

### Vite

Vite 是下一代前端构建工具，它利用浏览器原生的 ES 模块导入功能来提供超快速的热更新。

#### 核心特性

- **快速冷启动**：基于原生 ESM，无需打包即可运行
- **即时热更新**：HMR 更新速度与模块数量解耦
- **按需编译**：只编译当前页面需要用到的代码

#### 配置示例

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist'
  }
});
```

### Esbuild

Esbuild 是一个新的 JavaScript 打包工具，以其极快的速度而闻名，使用 Go 语言编写。

#### 特点

- **极快的构建速度**：比传统工具快 10-100 倍
- **原生支持 TypeScript 和 JSX**
- **内置代码压缩**

### Snowpack

Snowpack 是一个轻量级的构建工具，采用不同的方法进行 web 打包，无需打包即可运行应用。

## 构建工具选型策略

### 不同场景下的选择

| 场景 | 推荐工具 | 理由 |
|------|---------|------|
| 复杂应用开发 | Webpack | 生态完善，功能强大，社区支持好 |
| 组件库/工具库 | Rollup | Tree shaking 效果好，输出体积小 |
| 现代化应用 | Vite | 开发体验优秀，构建速度快 |
| 极致构建速度 | Esbuild | 构建速度最快，资源占用少 |
| 简单项目 | Snowpack | 配置简单，无须打包 |

### 选型考虑因素

1. **项目规模**：大型项目需要更强大的功能和生态支持
2. **开发体验**：热更新速度、错误提示等
3. **构建速度**：CI/CD 流程中尤为重要
4. **生态系统**：插件和工具的丰富程度
5. **学习成本**：团队成员的学习曲线
6. **维护状态**：项目的活跃度和支持情况

### 实践建议

1. **新项目**：可以优先考虑 Vite，享受现代开发体验
2. **现有项目迁移**：评估迁移成本和收益后再决定
3. **库开发**：使用 Rollup 获得最佳输出效果
4. **性能敏感场景**：考虑 Esbuild 或结合使用多种工具

选择合适的构建工具能够显著提升开发效率和用户体验，应当根据具体项目需求和技术栈做出合理选择。