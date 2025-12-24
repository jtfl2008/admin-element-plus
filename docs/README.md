# RuoYi-Plus-Soybean 项目文档库

欢迎使用 RuoYi-Plus-Soybean 项目文档库！本文档库为开发者提供完整的项目参考文档，帮助快速理解项目架构、掌握开发规范、提高开发效率。

## 📚 文档目录

### 一、架构文档

深入了解系统的整体架构和技术选型。

1. [系统架构概述](./architecture/01-系统架构概述.md)
   - 项目简介和核心特性
   - 系统架构图和分层设计
   - 技术栈详细说明
   - 模块职责划分和依赖关系
   - 部署架构和运行环境
   - 安全机制和性能优化

2. [项目结构说明](./architecture/02-项目结构说明.md)
   - 完整的目录结构
   - 核心目录详解
   - Monorepo 包说明
   - 文件命名规范
   - 模块导入规范
   - 环境变量配置

### 二、菜单和功能结构

了解系统的功能模块和权限体系。

1. [菜单和功能结构](./menu/01-菜单和功能结构.md)
   - 完整的菜单层级树
   - 页面路由映射表
   - 功能权限矩阵
   - 路由配置说明
   - 权限控制流程
   - 动态路由加载

### 三、开发指南

快速上手开发，掌握常用开发技巧。

1. [快速开发指南](./development/01-快速开发指南.md)
   - 环境准备和项目启动
   - 创建新页面和 API 接口
   - 使用表格和表单组件
   - 开发工作流和 Git 规范
   - 常用开发技巧
   - 调试和性能优化

2. [可复用组件库](./development/02-可复用组件库.md)
   - 通用组件 (Common)
   - 高级组件 (Advanced)
   - 自定义组件 (Custom)
   - 组件使用示例
   - 组件开发规范
   - 组件库扩展

3. [工具函数库](./development/03-工具函数库.md)
   - Monorepo 包工具
   - Vue 组合函数 (Hooks)
   - 通用工具函数
   - 加密和存储工具
   - 表单和路由工具
   - 自定义工具函数

4. [API 接口规范](./development/04-API接口规范.md)
   - RESTful API 设计
   - 统一响应格式
   - 类型定义规范
   - API 服务定义
   - 请求方法和配置
   - Mock 数据和最佳实践

### 四、代码生成和菜单更新

后端代码生成工具和菜单数据更新。

1. [代码生成工具](./java/)
   - 代码生成工具类
   - 模板文件说明
   - 使用方法

2. [菜单 SQL 更新](./sql/)
   - 菜单数据更新脚本
   - 执行说明

3. [代码生成模板](./template/)
   - Vue 页面模板
   - API 接口模板
   - 类型定义模板

## 🚀 快速开始

### 新手入门

如果你是第一次接触本项目，建议按以下顺序阅读文档：

1. **了解项目** → [系统架构概述](./architecture/01-系统架构概述.md)
2. **熟悉结构** → [项目结构说明](./architecture/02-项目结构说明.md)
3. **开始开发** → [快速开发指南](./development/01-快速开发指南.md)
4. **学习组件** → [可复用组件库](./development/02-可复用组件库.md)

### 开发者参考

如果你已经熟悉项目，可以直接查阅以下参考文档：

- **功能开发** → [菜单和功能结构](./menu/01-菜单和功能结构.md)
- **工具使用** → [工具函数库](./development/03-工具函数库.md)
- **接口开发** → [API 接口规范](./development/04-API接口规范.md)

## 📖 文档使用指南

### 文档特点

1. **完整性**: 涵盖项目的所有核心内容
2. **实用性**: 提供大量代码示例和最佳实践
3. **可复用性**: 组件和工具函数可直接复用到新项目
4. **规范性**: 统一的代码规范和开发流程

### 文档更新

本文档库会随着项目的迭代持续更新，建议：

- 定期查看文档更新
- 遇到问题先查阅文档
- 发现文档问题及时反馈
- 贡献文档改进建议

## 🎯 核心概念

### 技术栈

**前端核心**:
- Vue 3.5 - 渐进式 JavaScript 框架
- TypeScript 5.9 - JavaScript 的超集
- Vite 7.2 - 下一代前端构建工具
- Element Plus 2.13 - Vue 3 组件库
- Pinia 3.0 - Vue 状态管理

**后端兼容**:
- Spring Boot - Java 应用框架
- MyBatis-Plus - ORM 框架
- Sa-Token - 权限认证框架
- MySQL - 关系型数据库
- Redis - 缓存数据库

### 核心特性

1. **Monorepo 架构**: 使用 pnpm workspaces 管理多包项目
2. **TypeScript**: 完整的类型系统，提高代码质量
3. **组件化开发**: 丰富的可复用组件库
4. **权限管理**: 精细的 RBAC 权限控制
5. **主题定制**: 灵活的主题配置系统
6. **国际化**: 完整的多语言支持
7. **代码生成**: 自动生成前后端代码

### 开发模式

1. **基于文件系统的路由**: 自动生成路由配置
2. **Composition API**: 使用 Vue 3 组合式 API
3. **响应式设计**: 支持多种设备和屏幕尺寸
4. **模块化开发**: 按功能模块组织代码
5. **约定式提交**: 规范的 Git 提交信息

## 💡 最佳实践

### 代码规范

1. **命名规范**
   - 组件: PascalCase (如 `UserList.vue`)
   - 文件: kebab-case (如 `user-service.ts`)
   - 变量: camelCase (如 `userName`)
   - 常量: UPPER_SNAKE_CASE (如 `API_BASE_URL`)

2. **代码组织**
   - 按功能模块组织
   - 相关文件放在同一目录
   - 避免过深的目录嵌套
   - 使用有意义的命名

3. **注释规范**
   - 使用 JSDoc 注释
   - 复杂逻辑添加说明
   - 公共函数必须注释
   - 避免无意义的注释

### 开发流程

1. **需求分析** → 理解需求，明确功能点
2. **设计接口** → 定义 API 接口和数据结构
3. **创建页面** → 创建页面组件和路由
4. **实现功能** → 编写业务逻辑代码
5. **测试验证** → 功能测试和代码审查
6. **提交代码** → 使用规范的提交信息

### 性能优化

1. **组件懒加载**: 按需加载组件
2. **路由懒加载**: 按需加载路由
3. **图片懒加载**: 延迟加载图片
4. **虚拟滚动**: 大列表使用虚拟滚动
5. **缓存策略**: 合理使用缓存

## 🔧 开发工具

### 推荐工具

1. **编辑器**: VSCode
2. **浏览器**: Chrome / Edge
3. **调试工具**: Vue DevTools
4. **API 测试**: Postman / Apifox
5. **版本控制**: Git

### VSCode 插件

- Vue Language Features (Volar)
- TypeScript Vue Plugin (Volar)
- ESLint
- Prettier
- GitLens

## 📝 常见问题

### 环境问题

**Q: Node.js 版本要求？**
A: Node.js >= 20.19.0

**Q: 使用什么包管理器？**
A: 必须使用 pnpm >= 10.5.0

**Q: 端口被占用怎么办？**
A: 在 `vite.config.ts` 中修改 `server.port`

### 开发问题

**Q: 如何创建新页面？**
A: 在 `src/views/` 目录下创建页面文件，路由会自动生成

**Q: 如何添加新的 API 接口？**
A: 在 `src/service/api/` 目录下创建或修改 API 文件

**Q: 如何使用字典组件？**
A: 使用 `<DictSelect>`, `<DictTag>` 等组件，传入 `dict-type` 属性

### 部署问题

**Q: 如何构建生产版本？**
A: 运行 `pnpm build`

**Q: 构建后的文件在哪里？**
A: 在 `dist/` 目录下

**Q: 如何配置生产环境？**
A: 修改 `.env.prod` 文件

## 🤝 贡献指南

### 如何贡献

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

### 文档贡献

欢迎贡献文档改进：

- 修正错误和笔误
- 补充缺失的内容
- 添加使用示例
- 改进文档结构
- 翻译文档

## 📮 联系方式

### 获取帮助

- **项目主页**: https://ruoyi.xlsea.cn
- **项目文档**: https://docs.ruoyi.xlsea.cn
- **Gitee**: https://gitee.com/xlsea/ruoyi-plus-soybean
- **GitHub**: https://github.com/m-xlsea/ruoyi-plus-soybean

### 交流群

添加作者微信备注：加群

<img src="https://foruda.gitee.com/images/1749174520085305975/ad1b54fe_5601833.png" width="300px" />

## 📄 许可证

本项目采用 [MIT License](../LICENSE) 开源许可证。

## 🙏 致谢

感谢以下开源项目：

- [RuoYi-Vue-Plus](https://gitee.com/dromara/RuoYi-Vue-Plus) - 后端基础框架
- [Soybean Admin](https://github.com/soybeanjs/soybean-admin) - 前端基础框架
- [Vue.js](https://vuejs.org/) - 渐进式 JavaScript 框架
- [Element Plus](https://element-plus.org/) - Vue 3 组件库
- [Vite](https://vitejs.dev/) - 下一代前端构建工具

---

**最后更新**: 2024-12-24

**文档版本**: 2.0.0-beta.2

**维护者**: xlsea, Elio
