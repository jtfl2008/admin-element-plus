# 需求文档 - 角色管理

## 简介

角色管理模块是系统权限管理的核心功能之一，提供角色的增删改查、菜单权限分配、数据权限配置等功能。通过角色管理，系统管理员可以灵活地为不同角色配置不同的访问权限和数据范围，实现细粒度的权限控制。

## 术语表

- **System**: 角色管理系统
- **Role**: 角色，代表一组权限的集合
- **Menu_Permission**: 菜单权限，控制角色可以访问哪些菜单和功能
- **Data_Scope**: 数据权限范围，控制角色可以访问的数据范围
- **Status**: 角色状态，包括正常（启用）和停用两种状态
- **Role_Key**: 权限字符，用于后端权限控制的唯一标识符
- **Administrator**: 系统管理员，具有角色管理权限的用户

## 需求

### 需求 1：角色列表查询

**用户故事：** 作为系统管理员，我想要查看和搜索角色列表，以便了解系统中所有角色的信息。

#### 验收标准

1. WHEN 管理员访问角色管理页面 THEN THE System SHALL 显示角色列表，包含角色名称、权限字符、显示顺序、数据范围、状态和创建时间
2. WHEN 管理员输入角色名称进行搜索 THEN THE System SHALL 返回名称匹配的角色列表
3. WHEN 管理员输入权限字符进行搜索 THEN THE System SHALL 返回权限字符匹配的角色列表
4. WHEN 管理员选择角色状态进行筛选 THEN THE System SHALL 返回指定状态的角色列表
5. WHEN 管理员选择创建时间范围进行筛选 THEN THE System SHALL 返回该时间范围内创建的角色列表
6. THE System SHALL 支持分页显示角色列表
7. THE System SHALL 在表格中显示每个角色的序号、选择框和操作按钮

### 需求 2：创建角色

**用户故事：** 作为系统管理员，我想要创建新角色，以便为不同的用户群体分配不同的权限。

#### 验收标准

1. WHEN 管理员点击新增按钮 THEN THE System SHALL 打开角色操作抽屉表单
2. THE System SHALL 要求管理员输入角色名称（必填）
3. THE System SHALL 要求管理员输入权限字符（必填）
4. THE System SHALL 允许管理员输入显示顺序
5. THE System SHALL 要求管理员选择角色状态（必填），选项包括正常和停用
6. THE System SHALL 允许管理员通过菜单树选择菜单权限
7. THE System SHALL 允许管理员输入备注信息
8. WHEN 管理员提交表单且所有必填项已填写 THEN THE System SHALL 创建新角色并刷新角色列表
9. WHEN 管理员提交表单但必填项未填写 THEN THE System SHALL 显示验证错误信息并阻止提交

### 需求 3：编辑角色

**用户故事：** 作为系统管理员，我想要编辑现有角色的信息，以便调整角色的权限配置。

#### 验收标准

1. WHEN 管理员点击角色行的编辑按钮 THEN THE System SHALL 打开角色操作抽屉并填充该角色的现有数据
2. THE System SHALL 允许管理员修改角色名称、权限字符、显示顺序、状态、菜单权限和备注
3. THE System SHALL 显示该角色已选中的菜单权限
4. WHEN 管理员提交修改且所有必填项已填写 THEN THE System SHALL 更新角色信息并刷新角色列表
5. WHEN 管理员提交修改但必填项未填写 THEN THE System SHALL 显示验证错误信息并阻止提交

### 需求 4：删除角色

**用户故事：** 作为系统管理员，我想要删除不再需要的角色，以便保持系统角色列表的整洁。

#### 验收标准

1. WHEN 管理员点击角色行的删除按钮 THEN THE System SHALL 显示确认对话框
2. WHEN 管理员确认删除 THEN THE System SHALL 删除该角色并刷新角色列表
3. WHEN 管理员取消删除 THEN THE System SHALL 关闭确认对话框且不删除角色
4. WHEN 管理员选中多个角色并点击批量删除按钮 THEN THE System SHALL 显示确认对话框
5. WHEN 管理员确认批量删除 THEN THE System SHALL 删除所有选中的角色并刷新角色列表

### 需求 5：修改角色状态

**用户故事：** 作为系统管理员，我想要快速启用或停用角色，以便临时控制角色的可用性。

#### 验收标准

1. THE System SHALL 在角色列表的状态列显示状态开关组件
2. WHEN 管理员点击状态开关 THEN THE System SHALL 切换角色的启用/停用状态
3. WHEN 状态切换成功 THEN THE System SHALL 显示成功提示信息
4. WHEN 状态切换失败 THEN THE System SHALL 显示错误提示信息并恢复原状态

### 需求 6：配置数据权限

**用户故事：** 作为系统管理员，我想要为角色配置数据权限范围，以便控制角色可以访问的数据范围。

#### 验收标准

1. WHEN 管理员点击角色行的数据范围权限按钮 THEN THE System SHALL 打开数据权限配置抽屉
2. THE System SHALL 提供以下数据范围选项：全部数据权限、自定义数据权限、本部门数据权限、本部门及以下数据权限、仅本人数据权限
3. WHEN 管理员选择全部数据权限 THEN THE System SHALL 允许该角色访问所有数据
4. WHEN 管理员选择自定义数据权限 THEN THE System SHALL 显示部门树供管理员选择具体部门
5. WHEN 管理员选择本部门数据权限 THEN THE System SHALL 限制该角色只能访问本部门数据
6. WHEN 管理员选择本部门及以下数据权限 THEN THE System SHALL 限制该角色只能访问本部门及下级部门数据
7. WHEN 管理员选择仅本人数据权限 THEN THE System SHALL 限制该角色只能访问本人创建的数据
8. WHEN 管理员提交数据权限配置 THEN THE System SHALL 保存配置并刷新角色列表

### 需求 7：分配用户

**用户故事：** 作为系统管理员，我想要为角色分配用户，以便将角色权限授予特定用户。

#### 验收标准

1. WHEN 管理员点击角色行的分配用户按钮 THEN THE System SHALL 打开用户分配抽屉
2. THE System SHALL 显示该角色已分配的用户列表
3. THE System SHALL 允许管理员添加新用户到该角色
4. THE System SHALL 允许管理员从该角色移除用户
5. WHEN 管理员提交用户分配 THEN THE System SHALL 保存分配关系

### 需求 8：导出角色数据

**用户故事：** 作为系统管理员，我想要导出角色数据，以便进行数据备份或分析。

#### 验收标准

1. WHEN 管理员点击导出按钮 THEN THE System SHALL 导出当前筛选条件下的角色数据
2. THE System SHALL 以 Excel 格式导出数据
3. THE System SHALL 在导出文件中包含角色名称、权限字符、显示顺序、数据范围、状态和创建时间等字段

### 需求 9：表格操作

**用户故事：** 作为系统管理员，我想要对角色列表进行各种操作，以便高效管理角色数据。

#### 验收标准

1. THE System SHALL 支持选择单个或多个角色
2. THE System SHALL 在表格顶部显示操作按钮：新增、批量删除、导出、刷新
3. WHEN 没有选中任何角色 THEN THE System SHALL 禁用批量删除按钮
4. WHEN 选中一个或多个角色 THEN THE System SHALL 启用批量删除按钮
5. WHEN 管理员点击刷新按钮 THEN THE System SHALL 重新加载角色列表数据

### 需求 10：表单验证

**用户故事：** 作为系统管理员，我想要系统对输入数据进行验证，以便确保数据的完整性和正确性。

#### 验收标准

1. WHEN 管理员提交角色表单 THEN THE System SHALL 验证角色名称不为空
2. WHEN 管理员提交角色表单 THEN THE System SHALL 验证权限字符不为空
3. WHEN 管理员提交角色表单 THEN THE System SHALL 验证角色状态已选择
4. WHEN 验证失败 THEN THE System SHALL 在对应字段下方显示错误提示信息
5. WHEN 验证失败 THEN THE System SHALL 阻止表单提交

### 需求 11：国际化支持（暂不实现）

**用户故事：** 作为系统管理员，我想要系统支持多语言，以便不同语言的用户都能使用。

#### 验收标准

1. THE System SHALL 支持中文和英文两种语言
2. THE System SHALL 对所有界面文本、字段标签、提示信息和验证消息提供国际化支持
3. WHEN 用户切换语言 THEN THE System SHALL 立即更新所有文本为选定语言

**注意：** 此需求保留在文档中，但在当前阶段不会实现。

### 需求 12：菜单权限树

**用户故事：** 作为系统管理员，我想要通过树形结构选择菜单权限，以便直观地配置角色的功能访问权限。

#### 验收标准

1. WHEN 管理员在角色操作表单中配置菜单权限 THEN THE System SHALL 显示菜单树组件
2. THE System SHALL 以树形结构展示所有可用菜单
3. THE System SHALL 支持展开和折叠菜单节点
4. THE System SHALL 支持勾选和取消勾选菜单节点
5. WHEN 管理员勾选父节点 THEN THE System SHALL 自动勾选所有子节点
6. WHEN 管理员取消勾选父节点 THEN THE System SHALL 自动取消勾选所有子节点
7. WHEN 编辑角色时 THEN THE System SHALL 显示该角色已选中的菜单权限

### 需求 13：部门权限树

**用户故事：** 作为系统管理员，我想要通过树形结构选择部门权限，以便为角色配置自定义数据权限范围。

#### 验收标准

1. WHEN 管理员在数据权限配置中选择自定义数据权限 THEN THE System SHALL 显示部门树组件
2. THE System SHALL 以树形结构展示所有部门
3. THE System SHALL 支持展开和折叠部门节点
4. THE System SHALL 支持勾选和取消勾选部门节点
5. WHEN 管理员勾选父部门 THEN THE System SHALL 自动勾选所有子部门
6. WHEN 管理员取消勾选父部门 THEN THE System SHALL 自动取消勾选所有子部门
7. WHEN 编辑角色数据权限时 THEN THE System SHALL 显示该角色已选中的部门
