# 性能优化

## 性能优化概述

前端性能优化是提升用户体验的关键环节，直接影响用户留存率和转化率。随着Web应用日益复杂，性能优化已成为前端工程师必备的核心技能之一。

### 为什么需要性能优化

1. **用户体验**：更快的加载速度和响应时间提升用户满意度
2. **业务指标**：性能直接影响转化率、SEO排名等关键业务指标
3. **成本控制**：减少带宽消耗和服务器负载
4. **竞争优势**：在竞争激烈的市场中脱颖而出

### 性能指标

#### 核心Web指标 (Core Web Vitals)

Google提出的衡量网页用户体验的关键指标：

- **LCP (Largest Contentful Paint)**：最大内容绘制时间，衡量加载性能
- **FID (First Input Delay)**：首次输入延迟，衡量交互性
- **CLS (Cumulative Layout Shift)**：累积布局偏移，衡量视觉稳定性

#### 其他重要指标

- **FCP (First Contentful Paint)**：首次内容绘制
- **TTI (Time to Interactive)**：可交互时间
- **TBT (Total Blocking Time)**：总阻塞时间

## 加载性能优化

### 资源压缩与优化

#### JavaScript 优化

```javascript
// 代码分割示例
import React, { Suspense, lazy } from 'react';

const LazyComponent = lazy(() => import('./HeavyComponent'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LazyComponent />
    </Suspense>
  );
}

// Tree Shaking 优化
// 推荐：按需导入
import { debounce } from 'lodash-es';

// 避免：全量导入
// import _ from 'lodash';
```

#### CSS 优化

```css
/* 关键CSS内联 */
/* critical.css */
.header { /* header styles */ }
.hero { /* hero section styles */ }

/* 非关键CSS异步加载 */
/* non-critical.css */
.sidebar { /* sidebar styles */ }
.footer { /* footer styles */ }
```

```html
<!-- 内联关键CSS -->
<style>
  /* critical.css 内容 */
</style>

<!-- 异步加载非关键CSS -->
<link rel="preload" href="non-critical.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
```

#### 图片优化

```html
<!-- 响应式图片 -->
<picture>
  <source media="(max-width: 768px)" srcset="image-mobile.webp" type="image/webp">
  <source media="(max-width: 768px)" srcset="image-mobile.jpg">
  <source srcset="image-desktop.webp" type="image/webp">
  <img src="image-desktop.jpg" alt="描述文字">
</picture>

<!-- 使用现代图片格式 -->
<img src="hero.webp" alt="Hero Image" type="image/webp">

<!-- 懒加载 -->
<img data-src="lazy-image.jpg" class="lazy" alt="Lazy loaded image">
```

```javascript
// 图片懒加载实现
const imageObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.classList.remove('lazy');
      observer.unobserve(img);
    }
  });
});

document.querySelectorAll('img.lazy').forEach(img => {
  imageObserver.observe(img);
});
```

### HTTP/2 和资源加载优化

#### 资源预加载

```html
<!-- DNS 预解析 -->
<link rel="dns-prefetch" href="//example.com">

<!-- 预连接 -->
<link rel="preconnect" href="https://fonts.googleapis.com">

<!-- 预加载关键资源 -->
<link rel="preload" href="critical-script.js" as="script">
<link rel="preload" href="hero-image.jpg" as="image">

<!-- 预获取后续页面资源 -->
<link rel="prefetch" href="next-page.html">
```

#### Service Worker 缓存

```javascript
// service-worker.js
const CACHE_NAME = 'my-site-v1';
const urlsToCache = [
  '/',
  '/styles/main.css',
  '/scripts/main.js',
  '/images/logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // 缓存命中则返回缓存，否则发起网络请求
        return response || fetch(event.request);
      })
  );
});
```

## 运行时性能优化

### 渲染性能优化

#### 虚拟滚动

```javascript
// 虚拟滚动实现示例
import { useState, useEffect, useRef } from 'react';

function VirtualList({ items, itemHeight, windowHeight }) {
  const [visibleItems, setVisibleItems] = useState([]);
  const [scrollTop, setScrollTop] = useState(0);
  const containerRef = useRef();

  const totalHeight = items.length * itemHeight;
  const startIndex = Math.floor(scrollTop / itemHeight);
  const endIndex = Math.min(
    startIndex + Math.ceil(windowHeight / itemHeight),
    items.length
  );

  useEffect(() => {
    setVisibleItems(items.slice(startIndex, endIndex));
  }, [scrollTop, items, startIndex, endIndex]);

  const handleScroll = () => {
    setScrollTop(containerRef.current.scrollTop);
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      style={{ height: windowHeight, overflow: 'auto' }}
    >
      <div style={{ height: totalHeight, position: 'relative' }}>
        {visibleItems.map((item, index) => (
          <div
            key={item.id}
            style={{
              position: 'absolute',
              top: (startIndex + index) * itemHeight,
              height: itemHeight,
              width: '100%'
            }}
          >
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
```

#### 防抖与节流

```javascript
// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// 节流函数
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// 使用示例
const debouncedSearch = debounce(searchFunction, 300);
const throttledScroll = throttle(handleScroll, 100);
```

### React 性能优化

#### useMemo 和 useCallback

```javascript
import React, { useState, useMemo, useCallback } from 'react';

function ExpensiveComponent({ items, selectedId }) {
  // 使用 useMemo 缓存计算结果
  const expensiveValue = useMemo(() => {
    console.log('Computing expensive value...');
    return items.reduce((sum, item) => sum + item.value, 0);
  }, [items]);

  // 使用 useCallback 缓存函数
  const handleSelect = useCallback((id) => {
    console.log('Selected item:', id);
  }, []);

  // 使用 memoized 组件避免不必要的重渲染
  const MemoizedItem = React.memo(({ item, onSelect }) => {
    console.log('Rendering item:', item.id);
    return (
      <div onClick={() => onSelect(item.id)}>
        {item.name}: {item.value}
      </div>
    );
  });

  return (
    <div>
      <h2>Expensive Value: {expensiveValue}</h2>
      {items.map(item => (
        <MemoizedItem 
          key={item.id} 
          item={item} 
          onSelect={handleSelect} 
        />
      ))}
    </div>
  );
}
```

#### React.lazy 和 Suspense

```javascript
import React, { Suspense, lazy } from 'react';

// 动态导入组件
const Dashboard = lazy(() => import('./Dashboard'));
const Profile = lazy(() => import('./Profile'));
const Settings = lazy(() => import('./Settings'));

function App() {
  const [currentView, setCurrentView] = useState('dashboard');

  const renderCurrentView = () => {
    switch(currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'profile':
        return <Profile />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div>
      <nav>
        <button onClick={() => setCurrentView('dashboard')}>Dashboard</button>
        <button onClick={() => setCurrentView('profile')}>Profile</button>
        <button onClick={() => setCurrentView('settings')}>Settings</button>
      </nav>
      
      <Suspense fallback={<div>Loading...</div>}>
        {renderCurrentView()}
      </Suspense>
    </div>
  );
}
```

## 网络性能优化

### CDN 优化

```html
<!-- 使用 CDN 加速静态资源 -->
<script src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5/dist/css/bootstrap.min.css">
```

### 资源压缩与缓存

```javascript
// Webpack 配置优化
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
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true, // 移除 console
            drop_debugger: true, // 移除 debugger
          },
        },
      }),
    ],
  },
  
  plugins: [
    new CompressionPlugin({
      algorithm: 'gzip',
      test: /\.(js|css|html|svg)$/,
      threshold: 8192,
      minRatio: 0.8,
    }),
  ],
};
```

## 性能监控与分析

### Web Vitals 监控

```javascript
// 监控 Core Web Vitals
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

function sendToAnalytics(metric) {
  // 发送指标到分析平台
  console.log(metric);
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
```

### 自定义性能监控

```javascript
// 性能监控工具类
class PerformanceMonitor {
  constructor() {
    this.metrics = {};
  }

  // 记录自定义指标
  mark(name) {
    performance.mark(name);
  }

  measure(name, startMark, endMark) {
    performance.measure(name, startMark, endMark);
    const measure = performance.getEntriesByName(name)[0];
    this.metrics[name] = measure.duration;
    return measure.duration;
  }

  // 获取资源加载时间
  getResourceTiming() {
    return performance.getEntriesByType('resource');
  }

  // 获取导航时间
  getNavigationTiming() {
    const navigation = performance.getEntriesByType('navigation')[0];
    return {
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
      tcpConnection: navigation.connectEnd - navigation.connectStart,
      requestTime: navigation.responseEnd - navigation.requestStart,
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
      loadTime: navigation.loadEventEnd - navigation.fetchStart
    };
  }
}

// 使用示例
const monitor = new PerformanceMonitor();
monitor.mark('start-data-fetch');
// ... 数据获取逻辑
monitor.mark('end-data-fetch');
monitor.measure('data-fetch-time', 'start-data-fetch', 'end-data-fetch');
```

### 用户体验监控

```javascript
// 长任务监控
const observer = new PerformanceObserver((list) => {
  for (const entry of list.getEntries()) {
    if (entry.duration > 50) {
      // 记录长任务，可能影响用户体验
      console.warn('Long task detected:', entry);
    }
  }
});

observer.observe({ entryTypes: ['longtask'] });

// 布局偏移监控
let clsValue = 0;
new PerformanceObserver((entryList) => {
  for (const entry of entryList.getEntries()) {
    if (!entry.hadRecentInput) {
      clsValue += entry.value;
      console.log('Current CLS value:', clsValue);
    }
  }
}).observe({ entryTypes: ['layout-shift'] });
```

## 性能优化最佳实践

### 加载优化清单

1. **图片优化**
   - 使用适当的格式（WebP、AVIF）
   - 实施响应式图片
   - 合理使用懒加载

2. **代码优化**
   - 删除未使用的代码
   - 实施代码分割
   - 压缩和混淆代码

3. **缓存策略**
   - 设置合适的缓存头
   - 使用 Service Worker
   - 利用 CDN

### 运行时优化

1. **渲染优化**
   - 虚拟滚动处理大数据列表
   - 合理使用 React.memo、useMemo、useCallback
   - 避免在渲染中进行复杂计算

2. **事件处理优化**
   - 使用事件委托
   - 实施防抖和节流
   - 及时清理事件监听器

### 监控与持续优化

1. **建立监控体系**
   - 集成 Web Vitals 监控
   - 设置性能预算
   - 定期审查性能指标

2. **持续改进**
   - 定期进行性能审计
   - A/B 测试性能优化效果
   - 建立性能回归检测机制

通过系统性的性能优化策略，可以显著提升Web应用的用户体验和业务表现。关键在于建立完整的优化体系，从加载、运行到监控各个环节都要给予足够重视，并持续迭代改进。