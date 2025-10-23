# CI/CD流水线搭建

## CI/CD 流水线核心组件

一个完整的 CI/CD 流水线通常包括以下几个关键阶段：

### 1. 代码拉取与环境准备

在 CI/CD 流水线的开始阶段，系统需要从代码仓库拉取最新代码，并准备运行环境。

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  build:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout code
      uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
        cache: 'npm'
```

### 2. 依赖安装与构建

安装项目依赖并执行构建过程，这是确保代码质量的重要环节。

```yaml
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run tests
      run: npm run test:coverage
    
    - name: Build project
      run: npm run build
```

### 3. 代码质量检查

集成代码质量检查工具，确保代码符合规范。

```yaml
    - name: Code quality check
      run: |
        npm run lint
        npm run type-check
    
    - name: Security audit
      run: npm audit --audit-level high
```

## 自动化部署策略

### 基于环境的部署

为不同环境配置不同的部署策略：

```yaml
# 不同分支对应不同环境
deploy-staging:
  needs: build
  if: github.ref == 'refs/heads/develop'
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to staging
      run: |
        echo "Deploying to staging environment"
        # 部署到测试环境的命令

deploy-production:
  needs: build
  if: github.ref == 'refs/heads/main'
  runs-on: ubuntu-latest
  steps:
    - name: Deploy to production
      run: |
        echo "Deploying to production environment"
        # 部署到生产环境的命令
```

### 容器化部署

使用 Docker 进行容器化部署，提高部署的一致性和可移植性：

```dockerfile
# Dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
```

```yaml
    - name: Build and push Docker image
      run: |
        docker build -t my-app:${{ github.sha }} .
        docker tag my-app:${{ github.sha }} my-registry/my-app:latest
        docker push my-registry/my-app:latest
```

## 高级 CI/CD 特性

### 并行处理与缓存优化

通过并行执行任务和缓存依赖来提高流水线效率：

```yaml
    strategy:
      matrix:
        node-version: [14, 16, 18]
        os: [ubuntu-latest, windows-latest]
    
    runs-on: ${{ matrix.os }}
    
    steps:
    - name: Cache node modules
      uses: actions/cache@v3
      with:
        path: ~/.npm
        key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
```

### 自动化版本管理

集成语义化版本控制和自动发布：

```yaml
# 自动生成版本号和 CHANGELOG
release:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v3
      with:
        fetch-depth: 0
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '16'
    
    - name: Create Release
      run: |
        npm run release
        git push --follow-tags origin main
```

### 多环境配置管理

通过环境变量和配置文件管理不同环境的配置：

```javascript
// config/index.js
const configs = {
  development: {
    API_URL: 'http://localhost:3000',
    DEBUG: true
  },
  staging: {
    API_URL: 'https://staging-api.example.com',
    DEBUG: true
  },
  production: {
    API_URL: 'https://api.example.com',
    DEBUG: false
  }
};

const env = process.env.NODE_ENV || 'development';
module.exports = configs[env];
```

## 监控与回滚机制

### 健康检查

部署后执行健康检查确保服务正常运行：

```yaml
    - name: Health check
      run: |
        sleep 30
        curl -f https://your-app-url.com/health || exit 1
```

### 自动回滚

当部署失败时自动回滚到上一个稳定版本：

```yaml
    - name: Deploy with rollback
      run: |
        if ! deploy-command; then
          echo "Deployment failed, rolling back..."
          rollback-command
          exit 1
        fi
```

## 最佳实践总结

### 流水线优化建议

1. **分阶段执行**：将构建、测试、部署分为不同阶段，便于定位问题
2. **并行处理**：对于独立任务采用并行执行提高效率
3. **缓存利用**：合理使用缓存减少重复工作
4. **权限控制**：严格控制部署权限，避免误操作
5. **日志记录**：详细记录每一步操作，便于问题排查

### 安全性考虑

```yaml
# 敏感信息通过 secrets 管理
env:
  API_TOKEN: ${{ secrets.API_TOKEN }}
  DEPLOY_KEY: ${{ secrets.DEPLOY_KEY }}
```