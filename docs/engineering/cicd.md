# 持续集成与部署

## CI/CD 概述

持续集成（Continuous Integration，CI）和持续部署（Continuous Deployment，CD）是现代软件开发中的核心实践，它们通过自动化流程确保代码质量和快速交付。

### 核心概念

**持续集成（CI）**：
- 开发人员频繁地将代码变更合并到主分支
- 每次合并后自动运行构建和测试
- 快速发现和修复集成问题

**持续部署（CD）**：
- 在 CI 基础上自动将通过测试的代码部署到生产环境
- 实现从代码提交到生产部署的全自动化流程

### CI/CD 流程

```
代码提交 → 自动构建 → 自动测试 → 自动部署 → 监控反馈
    ↑                                        ↓
    ←←←←←←←←←←←←←←←←← 回滚机制 ←←←←←←←←←←←←←←←←←
```

## 主流 CI/CD 工具

### GitHub Actions

GitHub 原生的 CI/CD 解决方案，与 GitHub 深度集成。

基础工作流配置：

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    strategy:
      matrix:
        node-version: [16.x, 18.x]
        
    steps:
    - uses: actions/checkout@v3
    
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
        cache: 'npm'
        
    - run: npm ci
    - run: npm run build --if-present
    - run: npm test
    
  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    - name: Deploy to production
      run: |
        echo "Deploying to production..."
        # 部署命令
```

### GitLab CI/CD

GitLab 内置的 CI/CD 功能，配置文件为 `.gitlab-ci.yml`。

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  NODE_VERSION: "18"

before_script:
  - npm ci

build:
  stage: build
  script:
    - npm run build
  artifacts:
    paths:
      - dist/

test:
  stage: test
  script:
    - npm run test:unit
    - npm run test:e2e
  coverage: '/Coverage: \d+\.\d+%/'
  
deploy_staging:
  stage: deploy
  script:
    - echo "Deploying to staging..."
    - ./deploy.sh staging
  environment:
    name: staging
  only:
    - develop

deploy_production:
  stage: deploy
  script:
    - echo "Deploying to production..."
    - ./deploy.sh production
  environment:
    name: production
  only:
    - main
```

### Jenkins

老牌开源自动化服务器，功能强大且可扩展。

Jenkinsfile 示例：

```groovy
pipeline {
    agent any
    
    tools {
        nodejs "NodeJS-18"
    }
    
    environment {
        CI = 'true'
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }
        
        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }
        
        stage('Test') {
            steps {
                sh 'npm run test'
            }
            post {
                always {
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report'
                    ])
                }
            }
        }
        
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh './deploy.sh'
            }
        }
    }
    
    post {
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed!'
            mail to: 'team@example.com',
                 subject: "Failed Pipeline: ${env.JOB_NAME} - ${env.BUILD_NUMBER}",
                 body: "Check console output at ${env.BUILD_URL}"
        }
    }
}
```

## 部署策略

### 蓝绿部署 (Blue-Green Deployment)

维护两套相同的生产环境，部署时切换流量。

```bash
# 部署脚本示例
#!/bin/bash

# 部署到绿色环境
kubectl apply -f app-green.yaml

# 运行健康检查
if curl -f http://green-app/health; then
  # 切换流量到绿色环境
  kubectl patch service app-service -p '{"spec":{"selector":{"version":"green"}}}'
  echo "Switched to green environment"
else
  echo "Health check failed, rollback"
  kubectl delete -f app-green.yaml
  exit 1
fi
```

### 滚动更新 (Rolling Update)

逐步替换旧版本实例，避免服务中断。

```yaml
# Kubernetes Deployment
apiVersion: apps/v1
kind: Deployment
metadata:
  name: app-deployment
spec:
  replicas: 4
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1        # 最大额外实例数
      maxUnavailable: 1  # 最大不可用实例数
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: app
        image: my-app:v1.0
        ports:
        - containerPort: 8080
```

### 金丝雀部署 (Canary Deployment)

先向一小部分用户发布新版本，逐步扩大范围。

```yaml
# Istio VirtualService 配置
apiVersion: networking.istio.io/v1alpha3
kind: VirtualService
metadata:
  name: app-service
spec:
  hosts:
  - app.example.com
  http:
  - route:
    - destination:
        host: app-v1
      weight: 90  # 90% 流量到 v1 版本
    - destination:
        host: app-v2
      weight: 10  # 10% 流量到 v2 版本
```

## 容器化部署

### Docker 集成

构建优化的 Docker 镜像：

```dockerfile
# Dockerfile
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && npm cache clean --force

FROM node:18-alpine
WORKDIR /app

# 复制生产依赖
COPY --from=builder /app/node_modules ./node_modules

# 复制应用代码
COPY . .

# 创建非 root 用户
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001
USER nextjs

EXPOSE 3000

CMD ["npm", "start"]
```

多阶段构建优化：

```dockerfile
# 多阶段构建
FROM node:18 AS dependencies
WORKDIR /app
COPY package*.json ./
RUN npm ci

FROM node:18 AS builder
WORKDIR /app
COPY . .
COPY --from=dependencies /app/node_modules ./node_modules
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app

# 复制必要文件
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY package.json .

EXPOSE 3000
CMD ["node", "dist/server.js"]
```

### Kubernetes 部署

完整的 Kubernetes 部署配置：

```yaml
# deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: frontend-app
  labels:
    app: frontend
spec:
  replicas: 3
  selector:
    matchLabels:
      app: frontend
  template:
    metadata:
      labels:
        app: frontend
    spec:
      containers:
      - name: frontend
        image: frontend-app:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        resources:
          requests:
            memory: "128Mi"
            cpu: "250m"
          limits:
            memory: "256Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: frontend-service
spec:
  selector:
    app: frontend
  ports:
    - protocol: TCP
      port: 80
      targetPort: 3000
  type: LoadBalancer
```

## 自动化测试集成

### 测试策略配置

```yaml
# GitHub Actions 中的测试配置
test:
  runs-on: ubuntu-latest
  steps:
  - uses: actions/checkout@v3
  - name: Setup Node.js
    uses: actions/setup-node@v3
    with:
      node-version: '18'
      
  - name: Install dependencies
    run: npm ci
    
  - name: Run linting
    run: npm run lint
    
  - name: Run unit tests
    run: npm run test:unit -- --coverage
    
  - name: Run integration tests
    run: npm run test:integration
    
  - name: Run E2E tests
    run: npm run test:e2e
    
  - name: Upload coverage
    uses: codecov/codecov-action@v3
    with:
      file: ./coverage/lcov.info
```

### 代码质量门禁

```yaml
# 质量门禁检查
quality-gate:
  runs-on: ubuntu-latest
  steps:
  - uses: actions/checkout@v3
  
  - name: Check code quality
    run: |
      # 检查测试覆盖率
      COVERAGE=$(npm run test:coverage -- --coverageReporters=json-summary | grep -o '"lines.pct":[0-9.]*' | cut -d: -f2)
      if (( $(echo "$COVERAGE < 80" | bc -l) )); then
        echo "Coverage is below 80%: $COVERAGE%"
        exit 1
      fi
      
      # 检查代码复杂度
      npm run complexity-check
      
      # 检查安全漏洞
      npm audit --audit-level high
```

## 监控与回滚

### 健康检查

```javascript
// 健康检查端点
app.get('/health', (req, res) => {
  const healthCheck = {
    uptime: process.uptime(),
    message: 'OK',
    timestamp: Date.now(),
    checks: {
      database: checkDatabase(),
      redis: checkRedis(),
      api: checkExternalAPIs()
    }
  };
  
  const isHealthy = Object.values(healthCheck.checks).every(check => check.healthy);
  
  res.status(isHealthy ? 200 : 503).json(healthCheck);
});
```

### 自动回滚机制

```bash
#!/bin/bash
# 自动回滚脚本

DEPLOYMENT_NAME="frontend-app"
NAMESPACE="production"

# 检查部署状态
if ! kubectl rollout status deployment/$DEPLOYMENT_NAME -n $NAMESPACE --timeout=60s; then
  echo "Deployment failed, rolling back..."
  kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE
  exit 1
fi

# 检查应用健康状态
for i in {1..30}; do
  if curl -f http://app-service/health; then
    echo "Application is healthy"
    exit 0
  fi
  sleep 10
done

echo "Application health check failed, rolling back..."
kubectl rollout undo deployment/$DEPLOYMENT_NAME -n $NAMESPACE
exit 1
```

## 安全实践

### 安全扫描集成

```yaml
security-scan:
  runs-on: ubuntu-latest
  steps:
  - uses: actions/checkout@v3
  
  - name: Run security audit
    run: npm audit --audit-level high
    
  - name: Run SAST scan
    uses: github/codeql-action/analyze@v2
    
  - name: Container security scan
    uses: aquasecurity/trivy-action@master
    with:
      image-ref: 'frontend-app:latest'
      format: 'table'
      exit-code: '1'
      ignore-unfixed: true
```

### 密钥管理

```yaml
# 使用 GitHub Secrets
deploy:
  runs-on: ubuntu-latest
  steps:
  - name: Deploy to production
    env:
      API_KEY: ${{ secrets.API_KEY }}
      DATABASE_URL: ${{ secrets.DATABASE_URL }}
    run: |
      ./deploy.sh --api-key=$API_KEY --db-url=$DATABASE_URL
```

## 性能优化

### 缓存策略

```yaml
# GitHub Actions 缓存配置
- name: Cache node modules
  uses: actions/cache@v3
  with:
    path: ~/.npm
    key: ${{ runner.os }}-node-${{ hashFiles('**/package-lock.json') }}
    restore-keys: |
      ${{ runner.os }}-node-

- name: Cache build artifacts
  uses: actions/cache@v3
  with:
    path: |
      dist
      .next
    key: ${{ runner.os }}-build-${{ hashFiles('**/*.js', '**/*.ts', '**/*.jsx', '**/*.tsx') }}
```

### 并行执行

```yaml
# 并行测试执行
test:
  runs-on: ubuntu-latest
  strategy:
    matrix:
      test-suite: [unit, integration, e2e]
  steps:
  - uses: actions/checkout@v3
  - run: npm run test:${{ matrix.test-suite }}
```

通过建立完善的 CI/CD 流程，团队可以实现快速、可靠的软件交付，提高开发效率和产品质量。关键是要根据项目特点选择合适的工具和策略，并持续优化流程。