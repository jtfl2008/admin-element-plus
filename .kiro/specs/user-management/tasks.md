# 实施计划: 用户管理模块

## 概述

本实施计划将用户管理模块的设计转化为可执行的编码任务。任务按依赖关系排序，确保增量开发和集成。

**项目已有组件:**
- DialogForm: 对话框表单组件
- ConfigurableForm: 可配置查询表单组件
- ConfigurableTable: 可配置数据表格组件
- SelectTable: 下拉表格选择器组件
- useTable: 表格工具 Hook

## 任务列表

### 阶段一：基础设施

- [x] 1. 创建用户管理类型定义
  - 创建 `src/typings/api/system.d.ts`（如不存在）
  - 定义 `UserSearchParams` 搜索参数接口
  - 定义 `User` 用户实体接口
  - 定义 `UserOperateParams` 操作参数接口
  - 定义 `DeptTree` 部门树接口
  - 定义 `Post` 岗位接口
  - 定义 `Role` 角色接口
  - _需求: 12.1-12.12_

- [x] 2. 创建用户管理 API 服务
  - 创建 `src/service/api/system/user.ts`
  - 实现 `fetchGetUserList` 获取用户列表
  - 实现 `fetchGetDeptTree` 获取部门树
  - 实现 `fetchCreateUser` 新增用户
  - 实现 `fetchUpdateUser` 更新用户
  - 实现 `fetchBatchDeleteUser` 批量删除用户
  - 实现 `fetchGetUserInfo` 获取用户详情
  - 实现 `fetchResetUserPassword` 重置密码
  - 实现 `fetchUpdateUserStatus` 更新状态
  - 实现 `fetchGetPostList` 获取岗位列表
  - 实现 `fetchGetRoleList` 获取角色列表
  - 在 `src/service/api/index.ts` 中导出
  - _需求: 12.1-12.10_

### 阶段二：通用组件

- [x] 3. 创建状态切换组件 StatusSwitch
  - 创建 `src/components/StatusSwitch/index.vue`
  - 基于 el-switch 封装
  - 实现 Props: modelValue, activeValue, inactiveValue, disabled, loading
  - 实现切换前确认功能（使用 ElMessageBox.confirm）
  - 实现 change 事件
  - _需求: 11.1-11.5, 7.1-7.5_

- [x] 4. 创建权限 Hook
  - 创建 `src/hooks/useAuth.ts`（如不存在则创建）
  - 实现 `hasAuth(permission: string)` 方法
  - 从 Auth Store 获取用户权限列表
  - 支持通配符权限 `*:*:*`
  - _需求: 13.1-13.6_

### 阶段三：用户管理页面

- [x] 5. 实现用户管理主页面
  - 更新 `src/views/system/user/index.vue`
  - 使用 el-container 实现左右分栏布局
  - 左侧：使用 el-tree 实现部门树
    - 从 API 获取部门树数据
    - 支持节点点击筛选用户
    - 支持搜索过滤节点
  - 右侧：使用 ConfigurableForm + ConfigurableTable
    - 配置查询表单字段（用户账号、昵称、手机号、状态）
    - 配置表格列（账号、昵称、部门、手机、状态、时间、操作）
    - 配置工具栏按钮（新增、批量删除、导出、导入、刷新）
    - 配置操作列按钮（编辑、重置密码、删除）
  - 使用 useTable 工具管理表格状态
  - 实现权限控制（hasAuth）
  - _需求: 1.1-1.6, 2.1-2.8, 13.1-13.6_

- [x] 6. 实现用户新增/编辑功能
  - 在 index.vue 中添加 DialogForm 组件
  - 配置表单 sections（基础信息）
  - 配置表单字段：
    - nickName, deptId, phonenumber, email
    - userName (新增时显示，编辑时只读)
    - password (仅新增时显示)
    - sex, status (使用 radio-group)
    - postIds, roleIds (使用 select 多选)
    - remark (textarea)
  - 部门选择使用 el-tree-select
  - 岗位和角色选项从 API 获取
  - 实现表单验证规则
  - 实现新增/编辑提交逻辑
  - _需求: 3.1-3.13, 4.1-4.5, 10.1-10.8_

- [x] 7. 实现密码重置功能
  - 在 index.vue 中添加密码重置 DialogForm
  - 配置表单字段：userName (只读), newPassword, confirmPassword
  - 实现密码一致性验证
  - 实现提交逻辑（调用重置密码 API）
  - _需求: 6.1-6.5_

- [x] 8. 实现用户状态切换功能
  - 在表格状态列使用 StatusSwitch 组件
  - 实现状态切换确认对话框
  - 超级管理员（userId=1）的状态开关禁用
  - 调用更新状态 API
  - 切换成功后刷新列表
  - _需求: 7.1-7.5_

- [x] 9. 实现用户删除功能
  - 实现单条删除（带二次确认）
  - 实现批量删除（带二次确认）
  - 超级管理员（userId=1）不可删除
  - 删除成功后刷新列表
  - _需求: 5.1-5.5_

### 阶段四：功能完善

- [x] 10. 实现导入导出功能
  - 实现导出用户功能（调用导出 API）
  - 实现导入用户功能（上传 Excel）
  - 实现下载导入模板功能
  - _需求: 8.1-8.5_

- [x] 11. 检查点 - 功能验证
  - 验证用户列表加载和分页
  - 验证搜索和筛选功能
  - 验证部门树筛选功能
  - 验证新增用户功能
  - 验证编辑用户功能
  - 验证删除用户功能
  - 验证重置密码功能
  - 验证状态切换功能
  - 验证权限控制功能
  - 确保所有功能正常，如有问题请询问用户

## 功能检查清单

### 用户列表
- [x] 左右分栏布局（部门树 + 列表）
- [x] ConfigurableTable 显示：账号、昵称、部门、手机、状态、时间
- [x] 表格多选功能
- [x] 分页功能
- [x] 状态开关组件（StatusSwitch）

### 搜索筛选
- [x] ConfigurableForm 查询表单
- [x] 用户账号搜索
- [x] 用户昵称搜索
- [x] 手机号搜索
- [x] 状态筛选
- [x] 部门树筛选（el-tree）
- [x] 查询和重置按钮

### 用户操作
- [x] DialogForm 新增用户
- [x] DialogForm 编辑用户
- [x] 删除用户（单条/批量）
- [x] DialogForm 重置密码
- [x] StatusSwitch 状态切换

### 权限控制
- [x] 新增按钮权限（hasAuth）
- [x] 编辑按钮权限
- [x] 删除按钮权限
- [x] 重置密码按钮权限
- [x] 导出按钮权限
- [x] 导入按钮权限

### 数据验证
- [x] 必填字段验证
- [x] 手机号格式验证
- [x] 邮箱格式验证
- [x] 密码规则验证
- [x] 确认密码一致性验证

### 组件使用
- [x] ConfigurableForm（查询表单）
- [x] ConfigurableTable（数据表格）
- [x] DialogForm（新增/编辑/重置密码）
- [x] StatusSwitch（状态切换）
- [x] el-tree（部门树）
- [x] el-tree-select（部门选择）
- [x] useTable（表格工具）

## 注意事项

1. **超级管理员保护**: userId=1 的用户不可删除、不可禁用
2. **API 对接**: 当前使用 Mock 数据，后续需对接真实 API
3. **字典数据**: 性别和状态使用字典，需确保字典数据已配置
4. **权限数据**: 权限控制依赖 Auth Store 中的权限列表
5. **组件复用**: 充分利用项目已有的基础组件（DialogForm、ConfigurableForm、ConfigurableTable、SelectTable）
6. **表单验证**: 使用 Element Plus 的表单验证，确保用户体验
7. **错误处理**: 所有 API 调用需处理错误并给出友好提示
8. **useTable 工具**: 使用项目已有的 useTable.js 简化表格逻辑
