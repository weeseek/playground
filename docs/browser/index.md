---
title: 浏览器原理深入解析学习大纲
---

# **浏览器原理深入解析学习大纲**  

## [一、浏览器基础架构](./architecture.md) 
### 1. **浏览器组成与核心模块**  
- **用户界面（UI）**：地址栏、导航按钮、书签等  
- **浏览器引擎**：协调UI与渲染引擎  
- **渲染引擎（Rendering Engine）**：解析HTML/CSS，构建渲染树（Blink/WebKit/Gecko）  
- **JavaScript引擎（V8/SpiderMonkey/JavaScriptCore）**  
- **网络栈（Networking）**：HTTP/HTTPS请求处理  
- **数据存储（Storage）**：Cookie、LocalStorage、IndexedDB  
- **GPU加速**：硬件加速渲染  

### 2. **多进程架构（Chrome为例）**  
- **浏览器进程（Browser Process）**：管理UI、网络、存储  
- **渲染进程（Renderer Process）**：每个标签页独立进程（沙盒化）  
- **GPU进程（GPU Process）**：处理3D/WebGL渲染  
- **插件进程（Plugin Process）**：Flash/PDF等  
- **扩展进程（Extension Process）**：浏览器扩展  

## [二、网页渲染流程（关键渲染路径）](rendering.md)  
### 1. **从URL到页面显示**  
1. **导航阶段**  
   - DNS解析 → TCP握手 → TLS协商 → HTTP请求 → 响应解析  
   - 检查缓存（强缓存/协商缓存）  
2. **HTML解析与DOM构建**  
   - 字节流 → 字符流 → Token → DOM树  
   - 预加载扫描器（Preload Scanner）优化资源加载  
3. **CSS解析与CSSOM构建**  
   - CSS解析 → CSSOM树（层叠规则计算）  
4. **渲染树（Render Tree）合成**  
   - DOM + CSSOM → 渲染树（排除`display: none`等不可见元素）  
5. **布局（Layout/Reflow）**  
   - 计算元素几何信息（盒模型、位置）  
6. **绘制（Paint）**  
   - 生成绘制指令（Paint Records）  
7. **合成（Composite）**  
   - 图层（Layer）管理 → GPU光栅化 → 最终显示  

### 2. **优化渲染性能**  
- **减少重排（Reflow）和重绘（Repaint）**  
- **使用`transform`和`opacity`触发GPU加速**  
- **避免布局抖动（Layout Thrashing）**  
- **使用`requestAnimationFrame`优化动画**  

## [三、JavaScript引擎与事件循环（Event Loop）](js-engine.md)  
### 1. **V8引擎核心机制**  
- **解析（Parsing）** → **解释（Ignition）** → **优化编译（TurboFan）**  
- **隐藏类（Hidden Class）** 和 **内联缓存（Inline Cache）** 优化  
- **垃圾回收（GC）**：标记-清除、分代回收  

### 2. **事件循环（Event Loop）**  
- **调用栈（Call Stack）**  
- **任务队列（Task Queue）**：宏任务（`setTimeout`、`I/O`）  
- **微任务队列（Microtask Queue）**：`Promise`、`MutationObserver`  
- **渲染阶段（Render Steps）**：`requestAnimationFrame`  

**经典面试题：**  
```js
console.log(1);
setTimeout(() => console.log(2), 0);
Promise.resolve().then(() => console.log(3));
console.log(4);
// 输出顺序：1 → 4 → 3 → 2
```

## [四、浏览器存储与缓存机制](storage.md)  
### 1. **HTTP缓存**  
- **强缓存**（`Cache-Control`、`Expires`）  
- **协商缓存**（`ETag`、`Last-Modified`）  

### 2. **本地存储**  
- **Cookie**（4KB，随请求发送）  
- **Web Storage**（`localStorage` 10MB / `sessionStorage` 会话级）  
- **IndexedDB**（结构化数据存储）  
- **Service Worker + Cache API**（PWA离线缓存）  

### 3. **缓存策略优化**  
- **CDN加速**  
- **HTTP/2 Server Push**  
- **Stale-While-Revalidate**（SWR策略）  

## [五、浏览器安全机制](security.md)
### 1. **同源策略（Same-Origin Policy）**  
- **限制跨域请求**（`XMLHttpRequest`、`fetch`）  
- **CORS（跨域资源共享）**（`Access-Control-Allow-Origin`）  
- **JSONP（传统跨域方案）**  

### 2. **安全防护**  
- **XSS（跨站脚本攻击）防御**：输入转义、CSP（内容安全策略）  
- **CSRF（跨站请求伪造）防御**：Token验证、`SameSite Cookie`  
- **HTTPS与混合内容（Mixed Content）**  

## [六、现代浏览器高级特性](advanced.md)  
### 1. **Web Workers & Service Workers**  
- **多线程计算**（`Worker`）  
- **离线缓存 & 后台同步**（`Service Worker`）  

### 2. **WebAssembly（WASM）**  
- 高性能计算（C++/Rust → WASM）  

### 3. **Web Components**  
- 自定义组件（`Shadow DOM`、`Custom Elements`）  

## [七、调试与性能分析](debug.md)
### 1. **Chrome DevTools 核心功能**  
- **Performance面板**（分析FPS、CPU占用）  
- **Memory面板**（内存泄漏检测）  
- **Network面板**（请求瀑布图）  

### 2. **Lighthouse 性能评分**  
- **FCP（First Contentful Paint）**  
- **LCP（Largest Contentful Paint）**  
- **CLS（Cumulative Layout Shift）**  

## **学习建议**  
1. **动手实践**：使用DevTools分析网页加载过程  
2. **阅读源码**：Chromium开源项目  
3. **深入理解**：《How Browsers Work》（Tali Garsiel）  
