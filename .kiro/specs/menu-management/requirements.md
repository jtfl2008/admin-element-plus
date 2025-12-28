# 菜单管理需求文档

## 简介

菜单管理系统是后台管理系统的核心模块之一，负责管理系统的菜单结构、路由配置和权限控制。系统支持树形结构的菜单组织，包括目录、菜单页面和按钮权限三种类型，并与角色权限系统深度集成，实现细粒度的权限控制。

## 术语表

- **Menu_System**: 菜单管理系统
- **Menu_Tree**: 菜单树形结构
- **Menu_Item**: 菜单项（包括目录、菜单、按钮）
- **Permission_String**: 权限标识字符串
- **Role_System**: 角色管理系统
- **Icon_Selector**: 图标选择器
- **Route_Config**: 路由配置

## 需求

### 需求 1：菜单列表展示

**用户故事：** 作为系统管理员，我希望以树形结构查看所有菜单，以便直观地了解系统的菜单层级关系。

#### 验收标准

1. WHEN 管理员访问菜单管理页面 THEN THE Menu_System SHALL 以树形结构展示所有菜单和目录
2. WHEN 菜单数据加载完成 THEN THE Menu_System SHALL 通过 handleTree 工具函数将扁平数据转换为树形结构
3. WHEN 管理员点击树形菜单节点 THEN THE Menu_System SHALL 更新当前选中菜单并加载其关联的按钮权限列表
4. THE Menu_Tree SHALL 显示每个菜单的名称、图标、类型和状态信息
5. THE Menu_System SHALL 过滤掉类型为 'F' 的按钮权限，仅在树形结构中显示目录和菜单

### 需求 2：菜单搜索与筛选

**用户故事：** 作为系统管理员，我希望能够搜索和筛选菜单，以便快速定位到特定的菜单项。

#### 验收标准

1. WHEN 管理员输入搜索关键词 THEN THE Menu_System SHALL 根据菜单名称进行模糊匹配
2. WHEN 搜索结果返回 THEN THE Menu_System SHALL 高亮显示匹配的菜单项
3. WHEN 管理员清空搜索条件 THEN THE Menu_System SHALL 恢复显示完整的菜单树

### 需求 3：新增菜单

**用户故事：** 作为系统管理员，我希望能够新增菜单项，以便扩展系统功能。

#### 验收标准

1. WHEN 管理员点击"新增"按钮 THEN THE Menu_System SHALL 打开菜单操作对话框
2. THE Menu_System SHALL 支持添加三种菜单类型：目录（M）、菜单（C）和按钮（F）
3. WHEN 管理员选择菜单类型为目录 THEN THE Menu_System SHALL 显示目录相关的配置项（菜单名称、图标、排序、状态）
4. WHEN 管理员选择菜单类型为菜单 THEN THE Menu_System SHALL 显示菜单相关的配置项（菜单名称、父菜单、图标、路由地址、组件路径、权限标识、是否外链、是否缓存、显示状态、排序）
5. WHEN 管理员选择菜单类型为按钮 THEN THE Menu_System SHALL 显示按钮相关的配置项（按钮名称、父菜单、权限标识、排序、状态）
6. WHEN 管理员提交新增表单 THEN THE Menu_System SHALL 调用 fetchCreateMenu API 创建菜单
7. WHEN 菜单创建成功 THEN THE Menu_System SHALL 关闭对话框并刷新菜单列表
8. WHEN 菜单创建失败 THEN THE Menu_System SHALL 显示错误提示信息

### 需求 4：编辑菜单

**用户故事：** 作为系统管理员，我希望能够修改现有菜单的属性，以便调整系统功能。

#### 验收标准

1. WHEN 管理员点击菜单的"编辑"按钮 THEN THE Menu_System SHALL 打开菜单操作对话框并填充当前菜单数据
2. THE Menu_System SHALL 允许修改菜单的所有可编辑字段
3. WHEN 管理员修改菜单类型 THEN THE Menu_System SHALL 动态调整显示的配置项
4. WHEN 管理员提交编辑表单 THEN THE Menu_System SHALL 调用 fetchUpdateMenu API 更新菜单
5. WHEN 菜单更新成功 THEN THE Menu_System SHALL 关闭对话框并刷新菜单列表
6. WHEN 菜单更新失败 THEN THE Menu_System SHALL 显示错误提示信息

### 需求 5：删除菜单

**用户故事：** 作为系统管理员，我希望能够删除不需要的菜单，以便保持系统整洁。

#### 验收标准

1. WHEN 管理员点击菜单的"删除"按钮 THEN THE Menu_System SHALL 显示确认对话框
2. WHEN 管理员确认删除 THEN THE Menu_System SHALL 调用 fetchDeleteMenu API 根据 menuId 删除菜单
3. WHEN 菜单删除成功 THEN THE Menu_System SHALL 刷新菜单列表并显示成功提示
4. WHEN 菜单删除失败 THEN THE Menu_System SHALL 显示错误提示信息
5. IF 菜单包含子菜单 THEN THE Menu_System SHALL 阻止删除操作并提示用户先删除子菜单

### 需求 6：图标选择功能

**用户故事：** 作为系统管理员，我希望能够为菜单选择合适的图标，以便提升用户界面的可视化效果。

#### 验收标准

1. THE Icon_Selector SHALL 支持两种图标类型：Iconify 图标和本地图标
2. WHEN 管理员选择 Iconify 图标类型 THEN THE Icon_Selector SHALL 显示文本输入框供用户输入 Iconify 图标名称
3. WHEN 管理员输入 Iconify 图标名称 THEN THE Icon_Selector SHALL 通过 SvgIcon 组件实时预览图标
4. WHEN 管理员选择本地图标类型 THEN THE Icon_Selector SHALL 显示下拉选择框，包含预定义的本地图标列表
5. WHEN 管理员选择本地图标 THEN THE Icon_Selector SHALL 通过 SvgIcon 组件预览图标
6. THE Icon_Selector SHALL 通过 getLocalMenuIcons 函数获取本地图标列表
7. WHEN 菜单树渲染图标 THEN THE Menu_Tree SHALL 根据图标名称前缀（local-icon-）判断图标类型并正确渲染

### 需求 7：路由配置管理

**用户故事：** 作为系统管理员，我希望能够配置菜单的路由信息，以便控制页面跳转和组件加载。

#### 验收标准

1. WHEN 菜单类型为菜单（C）THEN THE Menu_System SHALL 要求配置路由地址（path）
2. WHEN 菜单类型为菜单（C）THEN THE Menu_System SHALL 要求配置组件路径（component）
3. THE Menu_System SHALL 支持配置路由参数（queryParam）
4. THE Menu_System SHALL 支持配置是否为外链（isFrame：'0' 是, '1' 否, '2' iframe）
5. THE Menu_System SHALL 支持配置是否缓存（isCache：'0' 缓存, '1' 不缓存）
6. WHEN 管理员配置外链菜单 THEN THE Menu_System SHALL 验证路由地址为有效的 URL 格式

### 需求 8：权限标识配置

**用户故事：** 作为系统管理员，我希望能够为菜单和按钮配置权限标识，以便实现细粒度的权限控制。

#### 验收标准

1. THE Menu_System SHALL 允许为菜单类型为菜单（C）和按钮（F）的项配置权限标识（perms）
2. WHEN 管理员输入权限标识 THEN THE Menu_System SHALL 验证权限标识格式的合法性
3. THE Permission_String SHALL 用于与角色权限系统集成，控制用户对特定操作的访问权限
4. WHEN 权限标识为空 THEN THE Menu_System SHALL 允许保存但提示该菜单或按钮无权限控制

### 需求 9：菜单状态控制

**用户故事：** 作为系统管理员，我希望能够控制菜单的显示和启用状态，以便灵活管理系统功能的可见性。

#### 验收标准

1. THE Menu_System SHALL 支持配置菜单的显示状态（visible：'0' 显示, '1' 隐藏）
2. THE Menu_System SHALL 支持配置菜单的启用状态（status：'0' 正常, '1' 停用）
3. WHEN 菜单设置为隐藏 THEN THE Menu_System SHALL 在前端路由中不显示该菜单，但仍可通过 URL 直接访问
4. WHEN 菜单设置为停用 THEN THE Menu_System SHALL 在前端路由中禁用该菜单，无法访问
5. THE Menu_System SHALL 在菜单列表中通过不同的视觉样式区分不同状态的菜单

### 需求 10：按钮权限管理

**用户故事：** 作为系统管理员，我希望能够管理菜单下的按钮权限，以便控制页面内的操作权限。

#### 验收标准

1. WHEN 管理员选中一个菜单 THEN THE Menu_System SHALL 调用 getBtnMenuList 方法获取该菜单下的按钮权限列表
2. THE Menu_System SHALL 以表格形式展示按钮权限，包括按钮名称、权限标识、排序和状态
3. THE Menu_System SHALL 支持为选中的菜单新增按钮权限
4. THE Menu_System SHALL 支持编辑和删除按钮权限
5. WHEN 按钮权限创建或更新 THEN THE Menu_System SHALL 自动关联到当前选中的父菜单

### 需求 11：菜单排序

**用户故事：** 作为系统管理员，我希望能够调整菜单的显示顺序，以便优化用户体验。

#### 验收标准

1. THE Menu_System SHALL 支持为每个菜单配置显示顺序（orderNum）
2. WHEN 菜单列表渲染 THEN THE Menu_System SHALL 根据 orderNum 从小到大排序显示
3. WHEN 同级菜单的 orderNum 相同 THEN THE Menu_System SHALL 按照创建时间排序
4. THE Menu_System SHALL 允许管理员通过编辑菜单修改 orderNum 值

### 需求 12：菜单树选择器

**用户故事：** 作为系统管理员，在新增或编辑菜单时，我希望能够通过树形选择器选择父菜单，以便建立菜单层级关系。

#### 验收标准

1. WHEN 管理员新增或编辑菜单 THEN THE Menu_System SHALL 提供菜单树选择器用于选择父菜单
2. THE Menu_System SHALL 调用 fetchGetMenuTreeSelect API 获取菜单树数据
3. THE Menu_System SHALL 在树形选择器中排除当前编辑的菜单及其子菜单，防止循环引用
4. WHEN 管理员选择父菜单 THEN THE Menu_System SHALL 更新 parentId 字段
5. WHEN 管理员不选择父菜单 THEN THE Menu_System SHALL 将该菜单作为根菜单（parentId 为 0 或 null）

### 需求 13：角色菜单权限关联

**用户故事：** 作为系统管理员，我希望能够为角色分配菜单权限，以便控制不同角色用户的功能访问范围。

#### 验收标准

1. WHEN 管理员编辑角色 THEN THE Role_System SHALL 调用 fetchGetRoleMenuTreeSelect API 获取该角色已有的菜单权限
2. THE Role_System SHALL 在角色操作对话框中显示菜单权限树，包含所有菜单和按钮权限
3. THE Role_System SHALL 支持勾选和取消勾选菜单和按钮权限
4. THE Role_System SHALL 支持配置菜单树的父子联动关系（menuCheckStrictly）
5. WHEN 管理员提交角色表单 THEN THE Role_System SHALL 通过 getCheckedMenuIds 方法获取所有被勾选的菜单 ID
6. WHEN 启用父子联动 THEN THE Role_System SHALL 包含半选状态的父级菜单 ID
7. WHEN 角色权限保存成功 THEN THE Role_System SHALL 更新角色的菜单权限关联关系

### 需求 14：国际化支持

**用户故事：** 作为系统管理员，我希望菜单管理界面支持多语言，以便适应不同地区的用户。

#### 验收标准

1. THE Menu_System SHALL 通过 i18n 键管理所有界面文本
2. THE Menu_System SHALL 支持菜单名称、提示信息、表单标签的国际化
3. WHEN 用户切换系统语言 THEN THE Menu_System SHALL 自动更新界面文本为对应语言
4. THE Menu_System SHALL 使用统一的国际化键命名规范（如 page.system.menu.menuName）

### 需求 15：数据验证

**用户故事：** 作为系统管理员，在创建或编辑菜单时，我希望系统能够验证输入数据的合法性，以便避免错误配置。

#### 验收标准

1. WHEN 管理员提交菜单表单 THEN THE Menu_System SHALL 验证必填字段不能为空
2. WHEN 菜单类型为菜单（C）THEN THE Menu_System SHALL 验证路由地址和组件路径不能为空
3. WHEN 菜单类型为按钮（F）THEN THE Menu_System SHALL 验证权限标识不能为空
4. THE Menu_System SHALL 验证显示顺序（orderNum）为非负整数
5. WHEN 配置外链菜单 THEN THE Menu_System SHALL 验证路由地址为有效的 URL 格式
6. WHEN 验证失败 THEN THE Menu_System SHALL 在对应字段下方显示错误提示信息
7. WHEN 验证失败 THEN THE Menu_System SHALL 阻止表单提交

### 需求 16：租户套餐菜单关联

**用户故事：** 作为系统管理员，在多租户系统中，我希望能够为租户套餐配置可用的菜单，以便实现不同套餐的功能差异化。

#### 验收标准

1. THE Menu_System SHALL 提供 fetchGetTenantPackageMenuTreeSelect API 用于获取租户套餐关联的菜单
2. WHEN 管理员配置租户套餐 THEN THE Menu_System SHALL 显示菜单树供选择可用菜单
3. WHEN 租户套餐菜单配置保存 THEN THE Menu_System SHALL 更新套餐与菜单的关联关系
4. WHEN 租户用户登录 THEN THE Menu_System SHALL 根据租户套餐过滤可访问的菜单
