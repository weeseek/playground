## 🧱 一、前端监控系统架构概述

### 1. **前端采集层（Client Side）**
- **埋点 SDK**：封装所有监控逻辑，提供统一的 API
- **错误监听器**：监听 JS 错误、资源错误、Promise 错误等
- **性能采集器**：使用 `Performance API` 采集关键性能指标
- **行为采集器**：监听用户行为，如点击、滚动、停留时间等
- **上报机制**：使用 `navigator.sendBeacon` 或 `fetch` 异步上报日志

### 2. **日志传输层（Transport Layer）**
- **上报方式**：`navigator.sendBeacon`（推荐）、`fetch`、`XMLHttpRequest`
- **数据格式**：JSON 格式，包含时间戳、用户 ID、页面 URL、错误类型、堆栈信息等
- **数据压缩**：使用 `gzip` 或 `lz-string` 压缩日志数据
- **重试机制**：失败后重试上报，避免数据丢失

### 3. **后端服务层（Backend Service）**
- **日志接收服务**：接收前端上报的数据，进行格式校验、去重、分类
- **数据存储**：使用 `Elasticsearch`、`MongoDB`、`ClickHouse` 等存储日志
- **数据处理**：对日志进行聚合、分析、统计
- **数据展示**：通过可视化工具（如 Kibana、Grafana）展示监控数据

### 4. **数据展示层（Dashboard）**
- **错误统计面板**：展示错误类型、发生频率、错误堆栈
- **性能面板**：展示 FP、FCP、LCP、FID 等指标
- **用户行为面板**：展示点击热图、页面停留时间、用户路径
- **接口监控面板**：展示接口成功率、耗时分布、错误码统计

---

## 🛠 二、前端采集层详细设计

### 1. **埋点 SDK 设计**

#### 1.1 初始化
```ts
class MonitorSDK {
  private appId: string;
  private reportUrl: string;
  private sampleRate: number;

  constructor(config: { appId: string, reportUrl: string, sampleRate?: number }) {
    this.appId = config.appId;
    this.reportUrl = config.reportUrl;
    this.sampleRate = config.sampleRate || 1.0;
  }

  init() {
    this.initErrorListeners();
    this.initPerformanceListeners();
    this.initUserBehaviorListeners();
  }

  private initErrorListeners() {
    window.addEventListener('error', this.handleError.bind(this));
    window.addEventListener('unhandledrejection', this.handlePromiseError.bind(this));
  }

  private initPerformanceListeners() {
    if (performance && performance.getEntriesByType) {
      performance.getEntriesByType('paint').forEach(this.handlePerformanceEntry.bind(this));
      performance.getEntriesByType('resource').forEach(this.handlePerformanceEntry.bind(this));
      performance.getEntriesByType('navigation').forEach(this.handlePerformanceEntry.bind(this));
    }
  }

  private initUserBehaviorListeners() {
    document.addEventListener('click', this.handleUserClick.bind(this));
    document.addEventListener('scroll', this.handleUserScroll.bind(this));
  }

  private handleError(event: ErrorEvent) {
    const errorInfo = {
      type: 'jsError',
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error?.stack
    };
    this.report(errorInfo);
  }

  private handlePromiseError(event: PromiseRejectionEvent) {
    const errorInfo = {
      type: 'promiseError',
      message: event.reason?.toString(),
      stack: event.reason?.stack
    };
    this.report(errorInfo);
  }

  private handlePerformanceEntry(entry: PerformanceEntry) {
    const performanceInfo = {
      type: 'performance',
      name: entry.name,
      entryType: entry.entryType,
      startTime: entry.startTime,
      duration: entry.duration
    };
    this.report(performanceInfo);
  }

  private handleUserClick(event: MouseEvent) {
    const clickInfo = {
      type: 'userClick',
      target: event.target?.toString(),
      timestamp: Date.now()
    };
    this.report(clickInfo);
  }

  private handleUserScroll(event: Event) {
    const scrollInfo = {
      type: 'userScroll',
      scrollTop: window.scrollY,
      scrollLeft: window.scrollX,
      timestamp: Date.now()
    };
    this.report(scrollInfo);
  }

  private report(data: any) {
    if (Math.random() < this.sampleRate) {
      navigator.sendBeacon(this.reportUrl, JSON.stringify(data));
    }
  }
}
```

### 2. **错误监听器**
- **JS 错误**：`window.onerror`、`window.addEventListener('error')`
- **Promise 错误**：`window.onunhandledrejection`
- **资源加载错误**：`window.addEventListener('error')` 监听图片、脚本、样式等资源加载失败
- **Vue/React 等框架错误边界（Error Boundary）**

### 3. **性能采集器**
- **FP / FCP / LCP / FID / CLS**：使用 `Performance API` 获取关键性能指标
- **白屏时间、首屏时间、DOM 加载时间**
- **接口请求耗时监控**

### 4. **用户行为采集器**
- **点击、滚动、停留时间、页面跳转**
- **埋点上报（PV / UV / 事件埋点）**
- **热力图（Heatmap）**

### 5. **上报机制**
- **异步上报**：使用 `navigator.sendBeacon` 或 `fetch` 异步上报，避免阻塞页面
- **数据压缩**：使用 `lz-string` 或 `pako` 压缩日志数据
- **重试机制**：失败后重试上报，避免数据丢失

---

## 🚀 三、日志传输层详细设计

### 1. **上报方式**
- **navigator.sendBeacon**：推荐使用，确保页面卸载时数据也能上报
- **fetch**：适用于需要更复杂请求头或请求体的场景
- **XMLHttpRequest**：兼容性较好，但不如 `fetch` 和 `navigator.sendBeacon` 方便

### 2. **数据格式**
- **JSON 格式**：包含时间戳、用户 ID、页面 URL、错误类型、堆栈信息等
- **示例**：
  ```json
  {
    "type": "jsError",
    "timestamp": 1634567890123,
    "userId": "user123",
    "url": "https://example.com",
    "message": "ReferenceError: x is not defined",
    "filename": "script.js",
    "lineno": 10,
    "colno": 5,
    "stack": "at script.js:10:5"
  }
  ```

### 3. **数据压缩**
- **lz-string**：轻量级的字符串压缩库
- **pako**：基于 zlib 的压缩库，支持 gzip 和 deflate

### 4. **重试机制**
- **失败后重试**：使用 `setTimeout` 或 `setInterval` 实现重试
- **示例**：
  ```ts
  function reportWithRetry(data: any, maxRetries: number = 3, retryDelay: number = 1000) {
    function attemptReport(retryCount: number) {
      navigator.sendBeacon('/api/report', JSON.stringify(data)).then(() => {
        console.log('Report successful');
      }).catch((error) => {
        if (retryCount < maxRetries) {
          console.error('Report failed, retrying...', error);
          setTimeout(() => attemptReport(retryCount + 1), retryDelay);
        } else {
          console.error('Max retries reached, giving up', error);
        }
      });
    }

    attemptReport(0);
  }
  ```

---

## 🛠 四、后端服务层详细设计

### 1. **日志接收服务**
- **API 设计**：使用 RESTful API 接收前端上报的数据
- **示例**：
  ```ts
  app.post('/api/report', (req, res) => {
    const data = req.body;
    // 校验数据格式
    if (isValidData(data)) {
      // 存储数据
      storeData(data);
      res.status(200).send('Data received');
    } else {
      res.status(400).send('Invalid data format');
    }
  });
  ```

### 2. **数据存储**
- **Elasticsearch**：适合全文搜索和实时分析
- **MongoDB**：适合灵活的文档存储
- **ClickHouse**：适合大规模数据的实时分析

### 3. **数据处理**
- **聚合**：按时间、类型、用户等维度聚合数据
- **分析**：计算错误率、性能指标、用户行为等
- **示例**：
  ```ts
  function aggregateData(data: any[]) {
    const aggregatedData = data.reduce((acc, item) => {
      if (item.type === 'jsError') {
        acc.jsErrors++;
      } else if (item.type === 'performance') {
        acc.performance.push(item);
      }
      return acc;
    }, { jsErrors: 0, performance: [] });

    return aggregatedData;
  }
  ```

### 4. **数据展示**
- **Kibana**：Elasticsearch 的可视化工具
- **Grafana**：支持多种数据源的可视化工具
- **示例**：
  - **错误统计面板**：展示错误类型、发生频率、错误堆栈
  - **性能面板**：展示 FP、FCP、LCP、FID 等指标
  - **用户行为面板**：展示点击热图、页面停留时间、用户路径
  - **接口监控面板**：展示接口成功率、耗时分布、错误码统计

---

## 📊 五、数据展示层详细设计

### 1. **错误统计面板**
- **错误类型**：JS 错误、资源加载错误、Promise 错误
- **发生频率**：按时间、用户、页面等维度统计
- **错误堆栈**：展示详细的错误堆栈信息

### 2. **性能面板**
- **FP / FCP / LCP / FID / CLS**：展示关键性能指标
- **白屏时间、首屏时间、DOM 加载时间**：展示页面加载性能
- **接口请求耗时**：展示接口请求的耗时分布

### 3. **用户行为面板**
- **点击热图**：展示用户点击的热点区域
- **页面停留时间**：展示用户在页面上的停留时间
- **用户路径**：展示用户的页面跳转路径

### 4. **接口监控面板**
- **接口成功率**：展示接口的成功率
- **耗时分布**：展示接口请求的耗时分布
- **错误码统计**：展示接口请求的错误码分布

---

## 🛠 六、监控系统扩展建议

### 1. **支持多环境配置**
- **开发、测试、生产环境配置不同**：通过环境变量或配置文件区分

### 2. **支持插件机制**
- **允许用户自定义埋点、上报逻辑**：提供插件接口，方便扩展

### 3. **支持 SDK 热更新**
- **通过 CDN 动态更新 SDK**：无需重新发布应用

### 4. **支持埋点调试工具**
- **提供前端调试面板**：查看埋点数据是否正常上报

---

## ✅ 七、总结

一个详细的前端监控系统架构设计需要考虑前端采集、日志传输、后端处理和数据展示等多个方面。通过模块化设计、异步上报、数据压缩、重试机制等技术手段，可以确保系统的稳定性和高效性。希望这个设计对你有所帮助，如果有任何具体问题或需要进一步的细节，欢迎继续提问！
