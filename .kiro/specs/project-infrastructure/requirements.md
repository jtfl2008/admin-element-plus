# 需求文档 - 项目基础架构搭建

## 简介

本需求文档定义了 RuoYi-Plus-Soybean 项目的基础架构搭建需求，包括项目结构、环境配置、HTTP 客户端、路由系统和状态管理等核心基础设施。

## 术语表

- **System**: RuoYi-Plus-Soybean 前端应用系统
- **HTTP_Client**: 基于 Axios 封装的 HTTP 请求客户端
- **Router**: Vue Router 路由管理器
- **Store**: Pinia 状态管理存储
- **Auth_Module**: 认证授权模块
- **API_Service**: API 接口服务层
- **Environment_Config**: 环境配置文件

## 需求

### 需求 1: 项目目录结构

**用户故事**: 作为开发者，我希望项目有清晰的目录结构，以便快速定位和组织代码。

#### 验收标准

1. THE System SHALL 包含标准的 src 目录结构，包含以下子目录：
   - `assets`: 静态资源
   - `components`: 可复用组件
   - `views`: 页面组件
   - `layouts`: 布局组件
   - `router`: 路由配置
   - `stores`: 状态管理
   - `service`: API 服务层
   - `utils`: 工具函数
   - `hooks`: 组合函数
   - `typings`: 类型定义
   - `constants`: 常量定义
   - `directives`: 自定义指令
   - `plugins`: 插件配置

2. THE System SHALL 在 service 目录下包含 api 子目录

3. THE System SHALL 在 typings 目录下包含 api.d.ts、global.d.ts 和 router.d.ts 类型定义文件

### 需求 2: 环境配置

**用户故事**: 作为开发者，我希望能够配置不同环境的 API 地址和其他环境变量，以便在开发、测试和生产环境中使用不同的配置。

#### 验收标准

1. THE System SHALL 支持开发环境配置文件 .env.development

2. THE System SHALL 支持生产环境配置文件 .env.production

3. THE Environment_Config SHALL 包含以下配置项：
   - VITE_APP_TITLE: 应用标题
   - VITE_API_BASE_URL: API 基础地址
   - VITE_API_PREFIX: API 前缀
   - VITE_UPLOAD_URL: 文件上传地址

4. THE System SHALL 在 src/config 目录下提供配置模块用于读取环境变量

### 需求 3: HTTP 客户端封装

**用户故事**: 作为开发者，我希望有一个统一的 HTTP 客户端，以便处理所有的 API 请求、响应拦截和错误处理。

#### 验收标准

1. THE HTTP_Client SHALL 使用 Axios 库实现 HTTP 请求功能

2. WHEN Token 存在时，THE HTTP_Client SHALL 在请求头中添加 Authorization 字段

3. WHEN 发送请求时，THE HTTP_Client SHALL 在请求头中添加 Content-Type 字段

4. WHEN 接收到响应时，THE HTTP_Client SHALL 提取响应数据并返回统一格式

5. IF 响应状态码为 401，THEN THE HTTP_Client SHALL 清除本地 Token 并重定向到登录页面

6. IF 响应状态码为 403，THEN THE HTTP_Client SHALL 显示权限不足的错误提示

7. IF 响应状态码为 500，THEN THE HTTP_Client SHALL 显示服务器错误提示

8. WHEN 请求发生网络错误时，THE HTTP_Client SHALL 捕获错误并显示友好提示信息

9. THE HTTP_Client SHALL 支持配置请求超时时间，默认值为 10000 毫秒

10. THE HTTP_Client SHALL 提供取消请求的功能接口

### 需求 4: API 响应格式

**用户故事**: 作为开发者，我希望所有 API 响应遵循统一的格式，以便统一处理响应数据。

#### 验收标准

1. THE System SHALL 定义统一的 API 响应类型，包含以下字段：
   - code: 响应状态码（200 表示成功）
   - msg: 响应消息
   - data: 响应数据

2. THE System SHALL 定义分页响应类型，包含以下字段：
   - rows: 数据列表
   - total: 总记录数

3. THE System SHALL 定义通用查询参数类型，包含以下字段：
   - pageNum: 页码
   - pageSize: 每页数量
   - orderByColumn: 排序字段
   - isAsc: 是否升序

### 需求 5: 路由系统

**用户故事**: 作为开发者，我希望有一个灵活的路由系统，支持动态路由、路由守卫和权限控制。

#### 验收标准

1. THE Router SHALL 使用 Vue Router 4.x 版本

2. THE Router SHALL 支持路由组件的懒加载功能

3. THE Router SHALL 包含以下公共路由：
   - 登录页面路由 (/login)
   - 404 错误页面路由 (/404)
   - 403 权限错误页面路由 (/403)

4. WHEN 用户访问需要认证的路由时，THE Router SHALL 验证用户登录状态

5. IF 用户未登录且访问需要认证的路由，THEN THE Router SHALL 重定向用户到登录页面

6. WHEN 用户登录成功时，THE Router SHALL 根据用户权限动态注册可访问的路由

7. THE Router SHALL 支持路由元信息配置，包括以下字段：
   - title: 页面标题
   - icon: 菜单图标
   - requiresAuth: 是否需要认证
   - permissions: 所需权限列表
   - keepAlive: 是否缓存页面状态

8. WHEN 路由切换时，THE Router SHALL 显示页面加载进度指示器

### 需求 6: 状态管理

**用户故事**: 作为开发者，我希望使用 Pinia 管理全局状态，以便在组件间共享数据。

#### 验收标准

1. THE Store SHALL 使用 Pinia 3.x 版本

2. THE System SHALL 包含以下 Store 模块：
   - auth: 认证状态模块
   - app: 应用状态模块
   - route: 路由状态模块
   - tab: 标签页状态模块

3. THE Auth_Module SHALL 管理以下状态数据：
   - token: 访问令牌
   - userInfo: 用户信息对象
   - permissions: 用户权限列表
   - roles: 用户角色列表

4. THE Auth_Module SHALL 提供以下操作方法：
   - login: 用户登录
   - logout: 用户登出
   - getUserInfo: 获取用户信息
   - resetToken: 重置访问令牌

5. THE Store SHALL 支持将状态持久化到 localStorage

### 需求 7: 工具函数库

**用户故事**: 作为开发者，我希望有一套常用的工具函数，以便提高开发效率。

#### 验收标准

1. THE System SHALL 在 utils 目录下包含以下工具模块：
   - storage: 本地存储工具
   - auth: 认证工具
   - common: 通用工具函数
   - validate: 表单验证工具

2. THE storage 工具模块 SHALL 提供以下方法：
   - setItem: 存储数据到本地
   - getItem: 从本地获取数据
   - removeItem: 从本地删除数据
   - clear: 清空本地存储

3. THE auth 工具模块 SHALL 提供以下方法：
   - getToken: 获取访问令牌
   - setToken: 设置访问令牌
   - removeToken: 删除访问令牌

4. THE auth 工具模块 SHALL 对 Token 进行加密后再存储到本地

### 需求 8: TypeScript 类型定义

**用户故事**: 作为开发者，我希望有完整的 TypeScript 类型定义，以便获得更好的类型提示和代码补全。

#### 验收标准

1. THE System SHALL 在 typings 目录下提供全局类型定义

2. THE System SHALL 提供 API 相关的类型定义，包括：
   - 请求参数类型
   - 响应数据类型
   - 分页类型
   - 查询参数类型

3. THE System SHALL 提供路由相关的类型定义，包括：
   - 路由配置类型
   - 路由元信息类型

4. THE System SHALL 提供 Store 相关的类型定义，包括：
   - 状态数据类型
   - 操作方法类型

5. THE System SHALL 为所有公共工具函数提供 TypeScript 类型声明

### 需求 9: 常量定义

**用户故事**: 作为开发者，我希望将常量集中管理，以便统一维护和修改。

#### 验收标准

1. THE System SHALL 在 constants 目录下提供常量定义文件

2. THE System SHALL 定义以下应用常量：
   - TOKEN_KEY: Token 在本地存储中的键名
   - USER_INFO_KEY: 用户信息在本地存储中的键名
   - DEFAULT_PAGE_SIZE: 默认分页大小
   - REQUEST_TIMEOUT: HTTP 请求超时时间

3. THE System SHALL 定义 HTTP 状态码常量集合

4. THE System SHALL 定义业务状态码常量集合

### 需求 10: Vite 配置优化

**用户故事**: 作为开发者，我希望优化 Vite 配置，以便提高开发体验和构建性能。

#### 验收标准

1. THE System SHALL 将开发服务器端口配置为 9527

2. THE System SHALL 配置开发代理，将 /api 路径的请求转发到后端服务器

3. THE System SHALL 配置路径别名，将 @ 符号映射到 src 目录

4. THE System SHALL 配置自动导入 Vue 核心 API，包括 ref、reactive、computed 等

5. THE System SHALL 配置自动导入 Vue 组件

6. THE System SHALL 配置构建优化选项，包括代码分割和代码压缩

7. WHEN 开发服务器启动时，THE System SHALL 在浏览器中自动打开应用页面
