# 实施计划: 项目基础架构搭建

## 概述

本实施计划将 RuoYi-Plus-Soybean 项目的基础架构设计转化为一系列可执行的编码任务。每个任务都建立在前面任务的基础上，确保增量进度和集成。任务专注于编写、修改或测试代码。

## 任务列表

- [x] 1. 创建项目目录结构和基础配置
  - 创建所有必需的目录（assets、components、views、layouts、router、stores、service、utils、hooks、typings、constants、directives、plugins、config）
  - 创建环境配置文件（.env.development、.env.production）
  - 配置 Vite（端口、代理、路径别名、自动导入）
  - _需求: 1.1, 1.2, 1.3, 2.1, 2.2, 10.1, 10.2, 10.3, 10.4, 10.5, 10.6, 10.7_

- [x] 2. 实现常量定义模块
  - 创建 constants/index.ts，定义应用常量（TOKEN_KEY、USER_INFO_KEY、DEFAULT_PAGE_SIZE、REQUEST_TIMEOUT）
  - 创建 constants/status.ts，定义 HTTP 状态码和业务状态码常量
  - _需求: 9.1, 9.2, 9.3, 9.4_

- [x] 3. 实现 TypeScript 类型定义
  - 创建 typings/api.d.ts，定义 API 相关类型（ApiResponse、PageResponse、PageQuery、UserInfo、LoginParams、LoginResponse）
  - 创建 typings/router.d.ts，定义路由相关类型（RouteMeta、RouteConfig）
  - 创建 typings/global.d.ts，定义全局类型
  - _需求: 4.1, 4.2, 4.3, 8.1, 8.2, 8.3_

- [ ] 4. 实现工具函数库
  - [x] 4.1 实现 Storage 工具类
    - 创建 utils/storage.ts
    - 实现 setItem、getItem、removeItem、clear 方法
    - 支持数据序列化和反序列化
    - 支持过期时间配置
    - _需求: 7.1, 7.2_

  - [ ]* 4.2 为 Storage 工具编写基于属性的测试
    - **属性 9: Storage 工具往返一致性**
    - **验证需求: 7.2**

  - [x] 4.3 实现 Auth 工具模块
    - 创建 utils/auth.ts
    - 实现 getToken、setToken、removeToken 方法
    - 实现 encryptToken、decryptToken 方法（使用 crypto-js 或 base64）
    - _需求: 7.3, 7.4_

  - [ ]* 4.4 为 Auth 工具编写基于属性的测试
    - **属性 8: Token 加密存储往返一致性**
    - **验证需求: 7.4**

  - [x] 4.5 实现 Validate 工具模块
    - 创建 utils/validate.ts
    - 实现常用验证函数（isEmail、isPhone、isUrl、isIdCard、isPassword）
    - _需求: 7.1_

  - [ ]* 4.6 为 Validate 工具编写单元测试
    - 测试各种验证规则
    - 测试边缘情况（空值、特殊字符）
    - _需求: 7.1_


- [x] 5. 实现环境配置模块
  - 创建 config/index.ts
  - 读取环境变量（VITE_APP_TITLE、VITE_API_BASE_URL、VITE_API_PREFIX、VITE_UPLOAD_URL）
  - 导出配置对象
  - _需求: 2.3, 2.4_

- [ ]* 5.1 为环境配置编写基于属性的测试
  - **属性 4: 环境配置完整性**
  - **验证需求: 2.3**

- [ ] 6. 实现 HTTP 客户端
  - [x] 6.1 创建 HTTP 客户端类
    - 创建 service/request.ts
    - 初始化 Axios 实例，配置 baseURL、timeout
    - 实现 request、get、post、put、delete 方法
    - _需求: 3.1, 3.9_

  - [x] 6.2 实现请求拦截器
    - 添加 Authorization 请求头（当 token 存在时）
    - 添加 Content-Type 请求头
    - 添加请求时间戳
    - _需求: 3.2, 3.3_

  - [ ]* 6.3 为请求拦截器编写基于属性的测试
    - **属性 1: HTTP 请求头注入一致性**
    - **验证需求: 3.2**

  - [x] 6.4 实现响应拦截器
    - 提取响应数据（返回 data 字段）
    - 处理业务错误码（code !== 200）
    - _需求: 3.4_

  - [ ]* 6.5 为响应拦截器编写基于属性的测试
    - **属性 2: HTTP 响应数据提取一致性**
    - **验证需求: 3.4**

  - [x] 6.6 实现错误处理
    - 处理 HTTP 状态码错误（401、403、500 等）
    - 处理网络错误（超时、连接失败）
    - 显示友好的错误提示
    - _需求: 3.5, 3.6, 3.7, 3.8_

  - [ ]* 6.7 为错误处理编写基于属性的测试
    - **属性 3: 网络错误处理完整性**
    - **验证需求: 3.8**

  - [ ]* 6.8 为 HTTP 客户端编写单元测试
    - 测试基本请求方法
    - 测试特定错误状态码处理（401、403、500）
    - 测试请求取消功能
    - _需求: 3.5, 3.6, 3.7, 3.10_

- [ ] 7. 检查点 - 确保基础工具和 HTTP 客户端测试通过
  - 确保所有测试通过，如有问题请询问用户

- [ ] 8. 实现 Pinia Store 模块
  - [x] 8.1 创建 Store 入口文件
    - 创建 stores/index.ts
    - 配置 Pinia 实例
    - 配置状态持久化插件（pinia-plugin-persistedstate）
    - _需求: 6.1, 6.5_

  - [x] 8.2 实现 Auth Store
    - 创建 stores/modules/auth.ts
    - 定义状态（token、userInfo、permissions、roles）
    - 实现 login 方法（调用登录 API，保存 token）
    - 实现 logout 方法（清除 token，重置状态）
    - 实现 getUserInfo 方法（获取用户信息和权限）
    - 实现 resetToken 方法
    - 实现 getters（isLoggedIn、hasPermission、hasRole）
    - _需求: 6.2, 6.3, 6.4_

  - [ ]* 8.3 为 Auth Store 编写单元测试
    - 测试登录流程
    - 测试登出流程
    - 测试权限检查
    - _需求: 6.4_

  - [x] 8.4 实现 App Store
    - 创建 stores/modules/app.ts
    - 定义状态（sidebarCollapsed、device、theme）
    - 实现 toggleSidebar、setDevice、setTheme 方法
    - _需求: 6.2_

  - [x] 8.5 实现 Route Store
    - 创建 stores/modules/route.ts
    - 定义状态（routes、menuList、isRoutesLoaded）
    - 实现 setRoutes、generateRoutes、resetRoutes 方法
    - _需求: 6.2_

  - [x] 8.6 实现 Tab Store
    - 创建 stores/modules/tab.ts
    - 定义状态（tabs、activeTab）
    - 实现 addTab、removeTab、removeOtherTabs、removeAllTabs、setActiveTab 方法
    - _需求: 6.2_

  - [ ]* 8.7 为 Store 持久化编写基于属性的测试
    - **属性 7: Store 状态持久化往返一致性**
    - **验证需求: 6.5**


- [ ] 9. 实现路由系统
  - [x] 9.1 创建路由配置文件
    - 创建 router/routes.ts
    - 定义常量路由（登录页、404、403）
    - 定义动态路由配置结构
    - 支持路由懒加载
    - _需求: 5.2, 5.3_

  - [ ]* 9.2 为路由配置编写单元测试
    - 测试公共路由存在性
    - 测试路由懒加载功能
    - 测试路由元信息配置
    - _需求: 5.2, 5.3, 5.7_

  - [x] 9.3 创建路由实例
    - 创建 router/index.ts
    - 初始化 Vue Router 实例
    - 注册常量路由
    - _需求: 5.1_

  - [x] 9.4 实现路由守卫
    - 创建 router/guards.ts
    - 实现全局前置守卫（beforeEach）
      - 显示加载进度条
      - 检查路由是否需要认证
      - 检查用户登录状态
      - 未登录时重定向到登录页
      - 首次登录时动态加载路由
      - 设置页面标题
    - 实现全局后置守卫（afterEach）
      - 隐藏加载进度条
    - _需求: 5.4, 5.5, 5.6, 5.8_

  - [ ]* 9.5 为路由守卫编写基于属性的测试
    - **属性 5: 路由认证守卫一致性**
    - **验证需求: 5.4**

  - [x] 9.6 实现动态路由生成函数
    - 在 Route Store 中实现 generateRoutes 方法
    - 根据用户权限过滤路由
    - 生成菜单列表
    - _需求: 5.6_

  - [ ]* 9.7 为动态路由生成编写基于属性的测试
    - **属性 6: 路由权限过滤正确性**
    - **验证需求: 5.6**

- [x] 10. 创建 API 服务层示例
  - 创建 service/api/auth.ts
  - 实现登录接口（login）
  - 实现获取用户信息接口（getUserInfo）
  - 实现登出接口（logout）
  - 使用 HTTP 客户端发送请求
  - _需求: 1.2_

- [ ] 11. 集成和连接所有模块
  - [x] 11.1 更新 main.ts
    - 导入并配置 Pinia
    - 导入并配置 Router
    - 注册路由守卫
    - 挂载应用

  - [x] 11.2 创建布局组件骨架
    - 创建 layouts/default/index.vue（默认布局）
    - 创建 layouts/blank/index.vue（空白布局）
    - _需求: 1.1_

  - [x] 11.3 创建基础页面组件
    - 创建 views/login/index.vue（登录页）
    - 创建 views/error/404.vue（404 页面）
    - 创建 views/error/403.vue（403 页面）
    - _需求: 5.3_

  - [ ]* 11.4 编写集成测试
    - 测试完整的登录流程
    - 测试路由导航流程
    - 测试权限控制流程
    - _需求: 5.4, 5.5, 5.6_

- [ ] 12. 最终检查点 - 确保所有测试通过
  - 运行所有单元测试和基于属性的测试
  - 检查代码覆盖率（目标 80% 以上）
  - 确保所有测试通过，如有问题请询问用户

## 注意事项

- 标记为 `*` 的任务是可选的，可以跳过以加快 MVP 开发
- 每个任务都引用了具体的需求以便追溯
- 检查点确保增量验证
- 基于属性的测试验证通用正确性属性
- 单元测试验证特定示例和边缘情况
- 所有测试必须使用 Vitest 和 fast-check
- 基于属性的测试必须运行至少 100 次迭代

