# 依赖安装说明

## 需要安装的依赖

项目基础架构已实现完成，但需要安装以下依赖才能正常运行：

### 必需依赖

```bash
# Pinia 持久化插件
npm install pinia-plugin-persistedstate

# NProgress 进度条
npm install nprogress
npm install -D @types/nprogress
```

### 安装命令

```bash
npm install pinia-plugin-persistedstate nprogress
npm install -D @types/nprogress
```

## 已实现的功能模块

✅ **项目目录结构** - 完整的目录结构
✅ **环境配置** - .env.development 和 .env.production
✅ **Vite 配置** - 端口 9527，代理配置，自动导入
✅ **常量定义** - 应用常量和状态码常量
✅ **TypeScript 类型** - API、路由、全局类型定义
✅ **工具函数库** - Storage、Auth、Validate 工具
✅ **环境配置模块** - 统一的环境变量管理
✅ **HTTP 客户端** - 完整的请求/响应拦截和错误处理
✅ **Pinia Store** - Auth、App、Route、Tab 状态管理
✅ **路由系统** - 路由配置、路由守卫、动态路由
✅ **API 服务层** - 认证相关 API 示例
✅ **布局组件** - 默认布局和空白布局
✅ **基础页面** - 登录页、404、403、首页

## 启动项目

安装依赖后，可以使用以下命令启动项目：

```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build:prod

# 类型检查
npm run type-check
```

## 注意事项

1. 项目使用 **端口 9527** 作为开发服务器端口
2. API 代理配置为 `/api` 路径
3. 默认登录账号：admin / admin123（模拟数据）
4. 路由守卫已配置，未登录会自动跳转到登录页
5. Token 使用 Base64 加密存储（生产环境建议使用更安全的加密方式）

## 下一步

安装依赖后，您可以：

1. 启动开发服务器测试基础功能
2. 根据实际需求调整 API 接口地址
3. 添加更多业务路由和页面
4. 完善用户权限控制逻辑
5. 添加更多业务功能模块
