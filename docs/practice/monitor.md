# 企业级前端监控系统

## 企业级前端监控系统

在现代Web应用中，用户体验和系统稳定性是衡量产品成功的重要指标。企业级前端监控系统能够帮助我们实时了解应用运行状态，及时发现并解决问题。

## 监控系统的重要性

前端监控系统是保障产品质量和用户体验的关键基础设施：

1. **故障快速响应** - 实时发现问题，缩短故障恢复时间
2. **用户体验优化** - 收集用户行为数据，指导产品优化
3. **性能瓶颈识别** - 发现性能问题，提升应用性能
4. **业务指标分析** - 监控关键业务指标，支撑业务决策

## 监控类型分类

### 错误监控

捕获JavaScript运行时错误、资源加载失败等异常情况：

```javascript
// 全局错误捕获
window.addEventListener('error', (event) => {
  // 记录错误信息
  const errorInfo = {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    error: event.error,
    timestamp: Date.now(),
    url: location.href,
    userAgent: navigator.userAgent
  }
  
  // 发送到监控服务
  sendErrorLog(errorInfo)
})

// Promise未捕获异常
window.addEventListener('unhandledrejection', (event) => {
  const errorInfo = {
    message: event.reason?.message || event.reason,
    stack: event.reason?.stack,
    timestamp: Date.now(),
    url: location.href
  }
  
  sendErrorLog(errorInfo)
})
```

### 性能监控

监控页面加载性能、接口响应时间等关键指标：

```javascript
// 页面性能监控
function monitorPagePerformance() {
  if ('performance' in window) {
    window.addEventListener('load', () => {
      setTimeout(() => {
        const perfData = performance.getEntriesByType('navigation')[0]
        const metrics = {
          dnsTime: perfData.domainLookupEnd - perfData.domainLookupStart,
          tcpTime: perfData.connectEnd - perfData.connectStart,
          requestTime: perfData.responseEnd - perfData.requestStart,
          domParseTime: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
          loadTime: perfData.loadEventEnd - perfData.loadEventStart,
          ttfb: perfData.responseStart - perfData.requestStart
        }
        
        sendPerformanceLog(metrics)
      }, 0)
    })
  }
}

// 接口性能监控
const originalFetch = window.fetch
window.fetch = function(...args) {
  const startTime = Date.now()
  const url = args[0]
  
  return originalFetch.apply(this, args)
    .then(response => {
      const duration = Date.now() - startTime
      sendApiPerformance({
        url,
        duration,
        status: response.status,
        timestamp: startTime
      })
      return response
    })
    .catch(error => {
      const duration = Date.now() - startTime
      sendApiError({
        url,
        duration,
        error: error.message,
        timestamp: startTime
      })
      throw error
    })
}
```

### 用户行为监控

追踪用户操作路径，分析用户行为模式：

```javascript
// 用户行为埋点
class UserBehaviorTracker {
  constructor() {
    this.init()
  }
  
  init() {
    // 页面浏览
    this.trackPageView()
    
    // 点击事件
    document.addEventListener('click', (event) => {
      this.trackClick(event)
    }, true)
    
    // 页面离开
    window.addEventListener('beforeunload', () => {
      this.trackPageLeave()
    })
  }
  
  trackPageView() {
    const pageData = {
      type: 'pageview',
      url: location.href,
      referrer: document.referrer,
      title: document.title,
      timestamp: Date.now()
    }
    
    this.sendLog(pageData)
  }
  
  trackClick(event) {
    const target = event.target
    const clickData = {
      type: 'click',
      element: target.tagName,
      className: target.className,
      id: target.id,
      text: target.textContent?.substring(0, 100),
      x: event.clientX,
      y: event.clientY,
      url: location.href,
      timestamp: Date.now()
    }
    
    this.sendLog(clickData)
  }
  
  trackPageLeave() {
    const leaveData = {
      type: 'pageleave',
      url: location.href,
      timestamp: Date.now(),
      stayTime: Date.now() - this.pageStartTime
    }
    
    // 使用sendBeacon确保数据发送
    if (navigator.sendBeacon) {
      navigator.sendBeacon('/api/log', JSON.stringify(leaveData))
    }
  }
  
  sendLog(data) {
    // 批量发送或节流处理
    fetch('/api/log', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    }).catch(() => {
      // 降级处理，存储到localStorage
      this.storeOffline(data)
    })
  }
}
```

## 监控系统架构设计

### 数据采集层

负责各种监控数据的收集：

```javascript
// 监控SDK设计
class MonitorSDK {
  constructor(options) {
    this.options = options
    this.queue = []
    this.init()
  }
  
  init() {
    this.initErrorMonitor()
    this.initPerformanceMonitor()
    this.initBehaviorMonitor()
    this.startHeartbeat()
  }
  
  // 错误监控初始化
  initErrorMonitor() {
    // ... 错误监控逻辑
  }
  
  // 性能监控初始化
  initPerformanceMonitor() {
    // ... 性能监控逻辑
  }
  
  // 行为监控初始化
  initBehaviorMonitor() {
    // ... 行为监控逻辑
  }
  
  // 心跳检测
  startHeartbeat() {
    setInterval(() => {
      this.sendLog({
        type: 'heartbeat',
        timestamp: Date.now()
      })
    }, 30000)
  }
  
  // 发送日志
  sendLog(data) {
    // 添加到队列
    this.queue.push({
      ...data,
      sessionId: this.getSessionId(),
      userId: this.getUserId(),
      userAgent: navigator.userAgent
    })
    
    // 批量发送
    if (this.queue.length >= 10) {
      this.flush()
    }
  }
  
  // 批量发送数据
  flush() {
    if (this.queue.length === 0) return
    
    const batch = this.queue.splice(0, 10)
    
    fetch(this.options.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(batch)
    }).catch(() => {
      // 发送失败，重新加入队列
      this.queue.unshift(...batch)
    })
  }
}
```

### 数据处理层

对采集的数据进行清洗、聚合和存储：

```javascript
// 后端数据处理示例
const express = require('express')
const app = express()

app.use(express.json())

// 日志接收接口
app.post('/api/log', (req, res) => {
  const logs = req.body
  
  // 数据验证和清洗
  const validLogs = logs.filter(log => {
    return log.timestamp && log.type
  })
  
  // 异步处理日志
  processLogs(validLogs)
    .then(() => {
      res.status(200).json({ success: true })
    })
    .catch(error => {
      console.error('Log processing error:', error)
      res.status(500).json({ success: false })
    })
})

// 日志处理函数
async function processLogs(logs) {
  // 分类处理不同类型日志
  const errorLogs = logs.filter(log => log.type === 'error')
  const performanceLogs = logs.filter(log => log.type === 'performance')
  const behaviorLogs = logs.filter(log => ['pageview', 'click', 'pageleave'].includes(log.type))
  
  // 并行处理
  await Promise.all([
    storeErrorLogs(errorLogs),
    storePerformanceLogs(performanceLogs),
    storeBehaviorLogs(behaviorLogs)
  ])
}
```

### 数据展示层

通过可视化界面展示监控数据：

```javascript
// 监控面板组件示例
import { ref, onMounted } from 'vue'

export default {
  setup() {
    const errorStats = ref([])
    const performanceStats = ref([])
    const userStats = ref([])
    
    onMounted(async () => {
      // 获取错误统计
      errorStats.value = await fetchErrorStats()
      
      // 获取性能统计
      performanceStats.value = await fetchPerformanceStats()
      
      // 获取用户行为统计
      userStats.value = await fetchUserStats()
    })
    
    return {
      errorStats,
      performanceStats,
      userStats
    }
  }
}
```

## 监控告警机制

建立完善的告警机制，及时响应异常情况：

```javascript
// 告警规则配置
const alertRules = {
  errorRate: {
    threshold: 0.01, // 错误率超过1%
    window: 300000,  // 5分钟窗口
    notify: ['email', 'sms', 'webhook']
  },
  responseTime: {
    threshold: 3000, // 响应时间超过3秒
    window: 60000,   // 1分钟窗口
    notify: ['email', 'webhook']
  },
  uptime: {
    threshold: 0.99, // 可用性低于99%
    window: 3600000, // 1小时窗口
    notify: ['email', 'sms']
  }
}

// 告警检测逻辑
class AlertManager {
  constructor(rules) {
    this.rules = rules
    this.metrics = new Map()
  }
  
  checkAlert(metricName, value) {
    const rule = this.rules[metricName]
    if (!rule) return
    
    if (value > rule.threshold) {
      this.triggerAlert(metricName, value, rule)
    }
  }
  
  triggerAlert(metricName, value, rule) {
    const alert = {
      metric: metricName,
      value: value,
      threshold: rule.threshold,
      timestamp: Date.now(),
      message: `${metricName} exceeded threshold: ${value} > ${rule.threshold}`
    }
    
    // 发送告警通知
    rule.notify.forEach(method => {
      this.sendNotification(method, alert)
    })
  }
  
  sendNotification(method, alert) {
    switch (method) {
      case 'email':
        sendEmailAlert(alert)
        break
      case 'sms':
        sendSmsAlert(alert)
        break
      case 'webhook':
        sendWebhookAlert(alert)
        break
    }
  }
}
```

## 性能优化与最佳实践

### 数据采样策略

避免过度监控影响性能：

```javascript
// 采样率控制
class SamplingManager {
  constructor(rate = 1.0) {
    this.rate = rate
  }
  
  shouldSample() {
    return Math.random() < this.rate
  }
  
  // 对不同类型的监控设置不同采样率
  getSamplingRate(type) {
    const rates = {
      error: 1.0,        // 错误100%采样
      performance: 0.1,  // 性能10%采样
      behavior: 0.05     // 行为5%采样
    }
    
    return rates[type] || this.rate
  }
}
```

### 数据压缩与传输优化

```javascript
// 数据压缩
function compressData(data) {
  // 简单的数据压缩策略
  const compressed = {
    t: data.timestamp,
    tp: data.type,
    u: data.url,
    m: data.message,
    // ... 其他字段映射
  }
  
  return compressed
}

// 图片上报减少请求
function sendViaImage(url, data) {
  const img = new Image()
  const params = new URLSearchParams(data).toString()
  img.src = `${url}?${params}`
}
```

## 总结

企业级前端监控系统是保障产品质量和用户体验的重要工具。通过建立完善的监控体系，我们可以：

1. **主动发现问题** - 实时监控应用状态，及时发现异常
2. **快速定位问题** - 详细的错误信息和用户行为轨迹
3. **持续优化体验** - 基于数据驱动的产品优化
4. **降低运维成本** - 自动化监控和告警减少人工干预

在实施监控系统时，需要平衡监控的全面性和性能影响，合理设计采样策略和数据处理流程，确保监控系统本身不会成为性能瓶颈。