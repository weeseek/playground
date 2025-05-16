---
title: 计算机网络大纲
---
# 前端工程师必备的计算机网络知识大纲

## [一、网络基础概念](./overview.md)

### 1. 网络分层模型
- **OSI七层模型**：物理层、数据链路层、网络层、传输层、会话层、表示层、应用层
- **TCP/IP四层模型**：网络接口层、网际层、传输层、应用层
- **前端相关层**：主要关注应用层(HTTP/HTTPS/WebSocket)和传输层(TCP/UDP)

### 2. 关键网络协议
- **IP协议**：网络层核心协议
- **TCP/UDP**：传输层协议对比
- **HTTP/HTTPS**：应用层协议
- **DNS**：域名解析系统

## [二、HTTP协议深度解析](./http.md)

### 1. HTTP/1.x
- 请求/响应模型
- 报文结构(请求行/头/体)
- 常用方法(GET/POST/PUT/DELETE等)
- 状态码分类(1xx-5xx)
- 连接管理(短连接/长连接)

### 2. HTTP/2
- 二进制分帧
- 多路复用
- 头部压缩(HPACK)
- 服务器推送

### 3. HTTP/3
- 基于QUIC协议
- 0-RTT连接建立
- 改进的拥塞控制
- 前向纠错

## [三、HTTPS与安全](./https)

### 1. 加密基础
- 对称加密(AES)
- 非对称加密(RSA)
- 哈希算法(SHA)

### 2. TLS/SSL
- 握手过程详解
- 证书验证机制
- 混合加密体系
- 会话恢复

### 3. Web安全
- CORS机制
- CSRF防护
- XSS防御
- CSP策略
- HSTS

## [四、浏览器网络机制](./browser)

### 1. 资源加载流程
- 解析HTML构建DOM
- 预加载扫描器
- 关键渲染路径优化
- 资源优先级

### 2. 缓存机制
- **强缓存**：Cache-Control/Expires
- **协商缓存**：ETag/Last-Modified
- Service Worker缓存
- HTTP缓存决策树

### 3. 连接管理
- 域名分片
- 并行连接限制
- Keep-Alive机制
- 预连接(preconnect/prefetch)

## [五、WebSocket与实时通信](./websocket)

### 1. WebSocket协议
- 握手过程
- 数据帧格式
- 心跳机制
- 错误处理

### 2. 替代方案对比
- 短轮询(Polling)
- 长轮询(Long-Polling)
- SSE(Server-Sent Events)
- WebRTC

## [六、性能优化相关网络知识](./performance)

### 1. 关键指标
- TTFB(Time To First Byte)
- FP/FCP/FMP/LCP
- DNS查询时间
- TCP连接时间
- SSL协商时间

### 2. 优化策略
- CDN加速
- 资源压缩(Brotli/gzip)
- 资源预加载
- 懒加载
- HTTP/2服务器推送

## [七、前端调试与网络分析](./debug)

### 1. 开发者工具
- Network面板详解
- Waterfall图表分析
- 请求过滤与搜索
- 节流模拟

### 2. 常用工具
- Wireshark抓包分析
- Charles/Fiddler代理
- Postman/Insomnia API测试
- WebPageTest性能测试

## [八、现代Web应用网络特性](./modern)

### 1. PWA网络能力
- Service Worker缓存策略
- 离线体验
- 后台同步

### 2. WebTransport
- 基于QUIC的多路传输
- 不可靠数据传输
- 双向通信

### 3. WebRTC
- STUN/TURN服务器
- ICE候选收集
- 点对点连接建立

## 学习建议

1. 结合浏览器开发者工具实践观察
2. 使用Wireshark等工具分析实际网络流量
3. 阅读RFC文档理解协议细节
4. 关注新兴Web网络API发展
