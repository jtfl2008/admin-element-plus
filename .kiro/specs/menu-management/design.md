# 菜单管理系统设计文档

## 概述

菜单管理系统是一个基于 Vue 3 + TypeScript + Element Plus 的前端管理模块，负责管理系统的菜单结构、路由配置和权限控制。系统采用树形结构组织菜单，支持目录、菜单页面和按钮权限三种类型，并与角色权限系统深度集成。

本设计遵循现有项目的架构模式，使用 ConfigurableTable、ConfigurableForm、DialogForm 等可复用组件，确保与用户管理、角色管理等模块保持一致的用户体验。

## 架构

### 整体架构

菜单管理系统采用分层架构：

```
┌─────────────────────────────────────────┐
│         视图层 (View Layer)              │
│  - 菜单列表页面 (menu/index.vue)         │
│  - DialogForm (菜单操作对话框)           │
│  - 按钮权限表格                          │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       组件层 (Component Layer)           │
│  - ConfigurableTable (表格组件)         │
│  - ConfigurableForm (表单组件)          │
│  - MenuTree (菜单树组件)                │
│  - IconSelector (图标选择器)            │
│  - StatusSwitch (状态开关)              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         服务层 (Service Layer)           │
│  - menu.ts (菜单 API 服务)              │
│  - request.ts (HTTP 客户端)             │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         数据层 (Data Layer)              │
│  - 类型定义 (system.d.ts)               │
│  - 状态管理 (Pinia Store)               │
└─────────────────────────────────────────┘
```

### 数据流

```
用户操作 → 视图组件 → API 服务 → HTTP 请求 → 后端接口
                ↓
         更新本地状态
                ↓
         刷新视图显示
```

## 组件和接口

### 1. 菜单列表页面 (menu/index.vue)

**职责：**
- 展示菜单树形结构
- 提供搜索和筛选功能
- 管理菜单的增删改查操作
- 展示和管理按钮权限

**主要状态：**
```typescript
interface MenuPageState {
  // 菜单树数据
  menuTreeData: MenuTreeNode[]
  // 当前选中的菜单
  currentMenu: Menu | null
  // 按钮权限列表
  btnData: Menu[]
  // 搜索关键词
  searchKeyword: string
  // 操作对话框状态
  dialogVisible: boolean
  // 操作类型
  operateType: 'add' | 'edit'
  // 编辑数据
  editingData: Menu | null
}
```

**主要方法：**
```typescript
// 获取菜单树
async getMeunTree(): Promise<void>

// 获取按钮权限列表
async getBtnMenuList(parentId: number): Promise<void>

// 处理树节点点击
handleClickTree(node: MenuTreeNode): void

// 新增菜单
handleAddMenu(parentMenu?: Menu): void

// 编辑菜单
handleUpdateMenu(menu: Menu): void

// 删除菜单
async handleDeleteMenu(menu: Menu): Promise<void>

// 搜索菜单
handleSearch(keyword: string): void
```

### 2. 菜单操作对话框 (使用 DialogForm 组件)

**职责：**
- 提供菜单新增和编辑表单
- 根据菜单类型动态显示表单项
- 处理图标选择
- 验证表单数据

**使用 DialogForm 组件：**
```vue
<DialogForm
  v-model="dialogVisible"
  v-model:formData="dialogForm"
  :title="dialogTitle"
  :sections="dialogSections"
  :rules="dialogRules"
  :confirm-loading="dialogLoading"
  @confirm="handleDialogConfirm"
  @cancel="handleDialogCancel"
/>
```

**表单配置：**
```typescript
interface MenuFormConfig {
  // 基础信息
  menuName: string          // 菜单名称
  parentId: number          // 父菜单ID
  menuType: 'M' | 'C' | 'F' // 菜单类型
  orderNum: number          // 显示顺序
  
  // 图标配置（目录和菜单）
  iconType: '1' | '2'       // 图标类型
  icon: string              // 图标名称
  
  // 路由配置（菜单）
  path: string              // 路由地址
  component: string         // 组件路径
  queryParam: string        // 路由参数
  isFrame: '0' | '1' | '2'  // 是否外链
  isCache: '0' | '1'        // 是否缓存
  
  // 权限配置（菜单和按钮）
  perms: string             // 权限标识
  
  // 状态配置
  visible: '0' | '1'        // 显示状态
  status: '0' | '1'         // 菜单状态
  
  // 备注
  remark: string            // 备注信息
}
```

**动态表单项规则：**
- 目录（M）：显示菜单名称、图标、排序、状态
- 菜单（C）：显示所有配置项
- 按钮（F）：显示按钮名称、父菜单、权限标识、排序、状态

### 3. 图标选择器 (IconSelector)

**职责：**
- 支持 Iconify 图标和本地图标两种类型
- 提供图标实时预览
- 管理本地图标列表

**接口：**
```typescript
interface IconSelectorProps {
  modelValue: string        // 图标名称
  iconType: '1' | '2'       // 图标类型
}

interface IconSelectorEmits {
  'update:modelValue': (value: string) => void
  'update:iconType': (value: '1' | '2') => void
}

// 获取本地图标列表
function getLocalMenuIcons(): string[]

// 渲染图标
function renderIcon(icon: string, iconType: '1' | '2'): VNode
```

### 4. 菜单树组件 (MenuTree)

**职责：**
- 展示菜单树形结构
- 支持复选框选择
- 支持父子联动
- 用于角色权限分配

**接口：**
```typescript
interface MenuTreeProps {
  modelValue: number[]      // 选中的菜单ID
  roleId?: number           // 角色ID（编辑模式）
  checkStrictly?: boolean   // 是否父子联动
}

interface MenuTreeEmits {
  'update:modelValue': (value: number[]) => void
}

// 获取选中的菜单ID（包含半选）
function getCheckedMenuIds(): number[]

// 设置选中的菜单ID
function setCheckedKeys(keys: number[]): void
```

### 5. API 服务层 (menu.ts)

**接口定义：**
```typescript
// 获取菜单列表
function fetchGetMenuList(
  params?: MenuSearchParams,
  signal?: AbortSignal
): Promise<Menu[]>

// 新增菜单
function fetchCreateMenu(
  data: MenuOperateParams
): Promise<void>

// 更新菜单
function fetchUpdateMenu(
  data: MenuOperateParams
): Promise<void>

// 删除菜单
function fetchDeleteMenu(
  menuId: number
): Promise<void>

// 获取菜单树（用于选择父菜单）
function fetchGetMenuTreeSelect(): Promise<MenuTreeNode[]>

// 获取角色菜单树（用于角色权限分配）
function fetchGetRoleMenuTreeSelect(
  roleId: number
): Promise<RoleMenuTree>

// 获取租户套餐菜单树
function fetchGetTenantPackageMenuTreeSelect(
  packageId: number
): Promise<MenuTreeNode[]>
```

## 数据模型

### 菜单实体 (Menu)

```typescript
interface Menu {
  menuId: number              // 菜单ID
  parentId: number            // 父菜单ID
  menuName: string            // 菜单名称
  orderNum: number            // 显示顺序
  path: string                // 路由地址
  component: string           // 组件路径
  queryParam: string          // 路由参数
  isFrame: '0' | '1' | '2'    // 是否外链（0:是 1:否 2:iframe）
  isCache: '0' | '1'          // 是否缓存（0:缓存 1:不缓存）
  menuType: 'M' | 'C' | 'F'   // 菜单类型（M:目录 C:菜单 F:按钮）
  visible: '0' | '1'          // 显示状态（0:显示 1:隐藏）
  status: '0' | '1'           // 菜单状态（0:正常 1:停用）
  perms: string               // 权限标识
  icon: string                // 菜单图标
  iconType: '1' | '2'         // 图标类型（1:Iconify 2:本地）
  children?: Menu[]           // 子菜单列表
  createTime?: string         // 创建时间
  updateTime?: string         // 更新时间
  remark?: string             // 备注
}
```

### 菜单搜索参数 (MenuSearchParams)

```typescript
interface MenuSearchParams {
  menuName?: string           // 菜单名称
  menuType?: 'M' | 'C' | 'F'  // 菜单类型
  status?: '0' | '1'          // 菜单状态
  visible?: '0' | '1'         // 显示状态
}
```

### 菜单操作参数 (MenuOperateParams)

```typescript
interface MenuOperateParams {
  menuId?: number             // 菜单ID（编辑时必填）
  parentId: number            // 父菜单ID
  menuName: string            // 菜单名称
  orderNum: number            // 显示顺序
  path?: string               // 路由地址
  component?: string          // 组件路径
  queryParam?: string         // 路由参数
  isFrame?: '0' | '1' | '2'   // 是否外链
  isCache?: '0' | '1'         // 是否缓存
  menuType: 'M' | 'C' | 'F'   // 菜单类型
  visible: '0' | '1'          // 显示状态
  status: '0' | '1'           // 菜单状态
  perms?: string              // 权限标识
  icon?: string               // 菜单图标
  iconType?: '1' | '2'        // 图标类型
  remark?: string             // 备注
}
```

### 菜单树节点 (MenuTreeNode)

```typescript
interface MenuTreeNode {
  id: number                  // 节点ID
  label: string               // 节点标签
  icon?: string               // 节点图标
  iconType?: '1' | '2'        // 图标类型
  children?: MenuTreeNode[]   // 子节点
}
```

### 角色菜单树 (RoleMenuTree)

```typescript
interface RoleMenuTree {
  menus: MenuTreeNode[]       // 菜单树
  checkedKeys: number[]       // 已选中的菜单ID
}
```

## 工具函数

### handleTree - 树形数据转换

```typescript
/**
 * 将扁平数组转换为树形结构
 * @param data 扁平数组
 * @param id ID字段名
 * @param parentId 父ID字段名
 * @param children 子节点字段名
 * @returns 树形结构数组
 */
function handleTree<T extends Record<string, any>>(
  data: T[],
  id: string = 'id',
  parentId: string = 'parentId',
  children: string = 'children'
): T[]
```

**实现逻辑：**
1. 创建一个 Map 存储所有节点
2. 遍历数据，将每个节点添加到 Map 中
3. 再次遍历，将每个节点添加到其父节点的 children 数组
4. 返回根节点数组（parentId 为 0 或 null 的节点）

### filterMenuTree - 菜单树过滤

```typescript
/**
 * 根据菜单类型过滤菜单树
 * @param tree 菜单树
 * @param excludeTypes 要排除的菜单类型
 * @returns 过滤后的菜单树
 */
function filterMenuTree(
  tree: Menu[],
  excludeTypes: Array<'M' | 'C' | 'F'>
): Menu[]
```

**实现逻辑：**
1. 递归遍历菜单树
2. 过滤掉指定类型的菜单
3. 对子菜单递归应用相同的过滤逻辑

### validateMenuForm - 表单验证

```typescript
/**
 * 验证菜单表单数据
 * @param form 表单数据
 * @returns 验证结果
 */
function validateMenuForm(
  form: MenuOperateParams
): { valid: boolean; errors: string[] }
```

**验证规则：**
1. 菜单名称不能为空
2. 菜单类型为菜单（C）时，路由地址和组件路径不能为空
3. 菜单类型为按钮（F）时，权限标识不能为空
4. 显示顺序必须为非负整数
5. 外链菜单的路由地址必须为有效的 URL 格式

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1：树形数据转换的正确性

*对于任意*扁平菜单数组，通过 handleTree 函数转换后，所有子菜单应该正确地嵌套在其父菜单的 children 数组中，且根节点的 parentId 应该为 0 或 null。

**验证：需求 1.2**

### 属性 2：菜单树过滤的完整性

*对于任意*菜单树和排除类型列表，过滤后的树不应包含任何被排除类型的菜单项。

**验证：需求 1.5**

### 属性 3：搜索功能的准确性

*对于任意*搜索关键词和菜单列表，搜索结果应该包含且仅包含菜单名称中包含该关键词的所有菜单项。

**验证：需求 2.1**

### 属性 4：搜索重置的完整性

*对于任意*菜单列表，清空搜索条件后显示的菜单数量应该等于原始菜单列表的数量。

**验证：需求 2.3**

### 属性 5：菜单类型支持的完整性

*对于任意*有效的菜单类型（M、C、F），系统应该能够成功创建该类型的菜单。

**验证：需求 3.2**

### 属性 6：菜单创建 API 调用的正确性

*对于任意*有效的菜单表单数据，提交时应该正确调用 fetchCreateMenu API 并传递完整的表单数据。

**验证：需求 3.6**

### 属性 7：菜单编辑数据填充的正确性

*对于任意*菜单项，点击编辑时，表单中填充的数据应该与该菜单项的所有字段值完全一致。

**验证：需求 4.1**

### 属性 8：菜单字段可编辑性

*对于任意*可编辑字段，在编辑表单中应该能够修改其值，且修改后的值能够正确保存。

**验证：需求 4.2**

### 属性 9：菜单类型切换的动态性

*对于任意*菜单类型切换操作，表单显示的配置项应该与新选择的菜单类型所需的配置项完全匹配。

**验证：需求 4.3**

### 属性 10：菜单更新 API 调用的正确性

*对于任意*有效的菜单编辑数据，提交时应该正确调用 fetchUpdateMenu API 并传递完整的更新数据。

**验证：需求 4.4**

### 属性 11：菜单删除 API 调用的正确性

*对于任意*菜单 ID，确认删除时应该正确调用 fetchDeleteMenu API 并传递该 menuId。

**验证：需求 5.2**

### 属性 12：子菜单删除保护

*对于任意*包含子菜单的菜单项，删除操作应该被阻止，且应该提示用户先删除子菜单。

**验证：需求 5.5**

### 属性 13：图标预览的正确性

*对于任意*有效的 Iconify 图标名称或本地图标名称，图标选择器应该能够通过 SvgIcon 组件正确预览该图标。

**验证：需求 6.3, 6.5**

### 属性 14：图标类型判断的正确性

*对于任意*图标名称，如果以 "local-icon-" 开头，则应该被识别为本地图标；否则应该被识别为 Iconify 图标。

**验证：需求 6.7**

### 属性 15：菜单类型路由验证

*对于任意*菜单类型为菜单（C）的表单，如果路由地址或组件路径为空，则验证应该失败。

**验证：需求 7.1, 7.2**

### 属性 16：外链 URL 验证

*对于任意*配置为外链的菜单，如果路由地址不是有效的 URL 格式，则验证应该失败。

**验证：需求 7.6**

### 属性 17：权限标识格式验证

*对于任意*输入的权限标识，应该验证其格式符合权限标识规范（如：system:menu:add）。

**验证：需求 8.2**

### 属性 18：隐藏菜单的访问性

*对于任意*显示状态为隐藏（visible='1'）的菜单，该菜单不应该出现在导航菜单树中，但应该可以通过 URL 直接访问。

**验证：需求 9.3**

### 属性 19：停用菜单的不可访问性

*对于任意*启用状态为停用（status='1'）的菜单，该菜单不应该出现在导航菜单树中，且不应该能够通过 URL 访问。

**验证：需求 9.4**

### 属性 20：按钮权限加载的正确性

*对于任意*选中的菜单，系统应该调用 getBtnMenuList 方法并传递该菜单的 menuId，返回的按钮列表应该只包含 parentId 等于该 menuId 且 menuType 为 'F' 的菜单项。

**验证：需求 10.1**

### 属性 21：按钮父菜单关联的正确性

*对于任意*新增或编辑的按钮权限，其 parentId 应该自动设置为当前选中菜单的 menuId。

**验证：需求 10.5**

### 属性 22：菜单排序的正确性

*对于任意*菜单列表，渲染后的菜单顺序应该按照 orderNum 从小到大排序；当 orderNum 相同时，应该按照 createTime 排序。

**验证：需求 11.2, 11.3**

### 属性 23：循环引用防护

*对于任意*正在编辑的菜单，在父菜单选择器中，该菜单本身及其所有子菜单都不应该出现在可选列表中。

**验证：需求 12.3**

### 属性 24：角色菜单权限获取的正确性

*对于任意*角色 ID，调用 getCheckedMenuIds 方法应该返回所有被勾选的菜单 ID；如果启用父子联动，还应该包含半选状态的父级菜单 ID。

**验证：需求 13.5, 13.6**

### 属性 25：必填字段验证

*对于任意*菜单表单，如果任何必填字段为空，则验证应该失败且不应该提交表单。

**验证：需求 15.1, 15.7**

### 属性 26：按钮类型权限验证

*对于任意*菜单类型为按钮（F）的表单，如果权限标识为空，则验证应该失败。

**验证：需求 15.3**

### 属性 27：显示顺序验证

*对于任意*输入的 orderNum 值，如果不是非负整数，则验证应该失败。

**验证：需求 15.4**

### 属性 28：租户菜单过滤的正确性

*对于任意*租户用户，登录后可访问的菜单应该只包含其租户套餐中配置的菜单，不应该包含套餐外的任何菜单。

**验证：需求 16.4**



## 错误处理

### API 错误处理

所有 API 调用都应该包含错误处理逻辑：

```typescript
try {
  const response = await fetchGetMenuList(params)
  // 处理成功响应
} catch (error) {
  console.error('获取菜单列表失败:', error)
  ElMessage.error('获取菜单列表失败，请稍后重试')
  // 可选：使用测试数据作为降级方案
}
```

### 表单验证错误

表单验证失败时，应该：
1. 阻止表单提交
2. 在对应字段下方显示错误提示
3. 聚焦到第一个错误字段

```typescript
const validateForm = async () => {
  try {
    await formRef.value?.validate()
    return true
  } catch (error) {
    ElMessage.warning('请检查表单填写是否正确')
    return false
  }
}
```

### 业务逻辑错误

特定业务场景的错误处理：

**删除包含子菜单的菜单：**
```typescript
if (menu.children && menu.children.length > 0) {
  ElMessage.warning('该菜单包含子菜单，请先删除子菜单')
  return
}
```

**循环引用检测：**
```typescript
const isCircularReference = (menuId: number, parentId: number): boolean => {
  // 检查 parentId 是否是 menuId 的子孙节点
  // 如果是，则存在循环引用
}
```

**权限不足：**
```typescript
if (!hasAuth.value('system:menu:add')) {
  ElMessage.warning('您没有权限执行此操作')
  return
}
```

### 网络错误处理

```typescript
// 在 HTTP 客户端中统一处理
httpClient.interceptors.response.use(
  response => response,
  error => {
    if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请检查网络连接')
    } else if (error.response?.status === 401) {
      ElMessage.error('登录已过期，请重新登录')
      // 跳转到登录页
    } else if (error.response?.status === 403) {
      ElMessage.error('没有权限访问该资源')
    } else if (error.response?.status === 500) {
      ElMessage.error('服务器错误，请稍后重试')
    }
    return Promise.reject(error)
  }
)
```

## 测试策略

### 双重测试方法

菜单管理系统采用单元测试和基于属性的测试相结合的方法：

- **单元测试**：验证特定示例、边缘情况和错误条件
- **属性测试**：验证跨所有输入的通用属性
- 两者互补，共同确保全面覆盖

### 单元测试

单元测试专注于：
- 特定示例，演示正确行为
- 组件之间的集成点
- 边缘情况和错误条件

**示例：**
```typescript
describe('MenuOperateDrawer', () => {
  it('应该在选择目录类型时显示目录配置项', () => {
    const wrapper = mount(MenuOperateDrawer, {
      props: { modelValue: true, operateType: 'add' }
    })
    
    wrapper.vm.formData.menuType = 'M'
    await wrapper.vm.$nextTick()
    
    expect(wrapper.find('[data-field="menuName"]').exists()).toBe(true)
    expect(wrapper.find('[data-field="icon"]').exists()).toBe(true)
    expect(wrapper.find('[data-field="path"]').exists()).toBe(false)
  })
  
  it('应该阻止删除包含子菜单的菜单', async () => {
    const menu = { menuId: 1, menuName: '系统管理', children: [{ menuId: 2 }] }
    
    await handleDeleteMenu(menu)
    
    expect(ElMessage.warning).toHaveBeenCalledWith('该菜单包含子菜单，请先删除子菜单')
  })
})
```

### 基于属性的测试

使用 **fast-check** 库进行基于属性的测试。

**配置要求：**
- 每个属性测试至少运行 100 次迭代
- 每个测试必须引用其设计文档属性
- 标签格式：**Feature: menu-management, Property {number}: {property_text}**

**示例：**

```typescript
import fc from 'fast-check'

describe('Property Tests - Menu Management', () => {
  /**
   * Feature: menu-management, Property 1: 树形数据转换的正确性
   * 对于任意扁平菜单数组，通过 handleTree 函数转换后，
   * 所有子菜单应该正确地嵌套在其父菜单的 children 数组中
   */
  it('属性 1: handleTree 应该正确转换扁平数组为树形结构', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          menuId: fc.integer({ min: 1, max: 1000 }),
          parentId: fc.integer({ min: 0, max: 100 }),
          menuName: fc.string({ minLength: 1, maxLength: 20 }),
          menuType: fc.constantFrom('M', 'C', 'F')
        })),
        (flatMenus) => {
          const tree = handleTree(flatMenus, 'menuId', 'parentId', 'children')
          
          // 验证所有根节点的 parentId 为 0
          tree.forEach(root => {
            expect(root.parentId).toBe(0)
          })
          
          // 验证所有子节点都在正确的父节点下
          const verifyChildren = (node: any) => {
            if (node.children) {
              node.children.forEach((child: any) => {
                expect(child.parentId).toBe(node.menuId)
                verifyChildren(child)
              })
            }
          }
          
          tree.forEach(verifyChildren)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: menu-management, Property 2: 菜单树过滤的完整性
   * 对于任意菜单树和排除类型列表，过滤后的树不应包含任何被排除类型的菜单项
   */
  it('属性 2: filterMenuTree 应该完全排除指定类型的菜单', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          menuId: fc.integer({ min: 1, max: 1000 }),
          parentId: fc.integer({ min: 0, max: 100 }),
          menuName: fc.string({ minLength: 1, maxLength: 20 }),
          menuType: fc.constantFrom('M', 'C', 'F')
        })),
        fc.array(fc.constantFrom('M', 'C', 'F'), { minLength: 1, maxLength: 2 }),
        (flatMenus, excludeTypes) => {
          const tree = handleTree(flatMenus, 'menuId', 'parentId', 'children')
          const filtered = filterMenuTree(tree, excludeTypes)
          
          // 验证过滤后的树不包含被排除的类型
          const verifyNoExcludedTypes = (nodes: any[]) => {
            nodes.forEach(node => {
              expect(excludeTypes).not.toContain(node.menuType)
              if (node.children) {
                verifyNoExcludedTypes(node.children)
              }
            })
          }
          
          verifyNoExcludedTypes(filtered)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: menu-management, Property 12: 子菜单删除保护
   * 对于任意包含子菜单的菜单项，删除操作应该被阻止
   */
  it('属性 12: 包含子菜单的菜单不应该被删除', () => {
    fc.assert(
      fc.property(
        fc.record({
          menuId: fc.integer({ min: 1, max: 1000 }),
          menuName: fc.string({ minLength: 1, maxLength: 20 }),
          children: fc.array(fc.record({
            menuId: fc.integer({ min: 1, max: 1000 }),
            menuName: fc.string({ minLength: 1, maxLength: 20 })
          }), { minLength: 1 })
        }),
        async (menu) => {
          const result = await canDeleteMenu(menu)
          expect(result).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: menu-management, Property 22: 菜单排序的正确性
   * 对于任意菜单列表，渲染后的菜单顺序应该按照 orderNum 从小到大排序
   */
  it('属性 22: 菜单应该按 orderNum 正确排序', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          menuId: fc.integer({ min: 1, max: 1000 }),
          menuName: fc.string({ minLength: 1, maxLength: 20 }),
          orderNum: fc.integer({ min: 0, max: 100 }),
          createTime: fc.date()
        }), { minLength: 2 }),
        (menus) => {
          const sorted = sortMenus(menus)
          
          // 验证排序正确性
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i]
            const next = sorted[i + 1]
            
            if (current.orderNum === next.orderNum) {
              // orderNum 相同时，按创建时间排序
              expect(current.createTime.getTime()).toBeLessThanOrEqual(next.createTime.getTime())
            } else {
              // orderNum 不同时，按 orderNum 排序
              expect(current.orderNum).toBeLessThan(next.orderNum)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### 测试覆盖目标

- **单元测试覆盖率**：核心业务逻辑 > 80%
- **属性测试覆盖**：所有 28 个正确性属性都应该有对应的属性测试
- **集成测试**：关键用户流程（新增菜单、编辑菜单、删除菜单、权限分配）

### 测试数据生成器

为属性测试创建智能生成器：

```typescript
// 生成有效的菜单对象
const menuArbitrary = fc.record({
  menuId: fc.integer({ min: 1, max: 1000 }),
  parentId: fc.integer({ min: 0, max: 100 }),
  menuName: fc.string({ minLength: 1, maxLength: 50 }),
  menuType: fc.constantFrom('M', 'C', 'F'),
  orderNum: fc.integer({ min: 0, max: 999 }),
  status: fc.constantFrom('0', '1'),
  visible: fc.constantFrom('0', '1'),
  icon: fc.oneof(
    fc.string({ minLength: 1, maxLength: 50 }), // Iconify 图标
    fc.string({ minLength: 1, maxLength: 50 }).map(s => `local-icon-${s}`) // 本地图标
  ),
  path: fc.string({ minLength: 1, maxLength: 100 }),
  component: fc.string({ minLength: 1, maxLength: 100 }),
  perms: fc.string({ minLength: 1, maxLength: 100 })
})

// 生成有效的菜单树
const menuTreeArbitrary = fc.array(menuArbitrary).chain(menus => {
  // 确保 parentId 引用存在的 menuId
  const menuIds = menus.map(m => m.menuId)
  return fc.constant(menus.map(m => ({
    ...m,
    parentId: fc.sample(fc.constantFrom(0, ...menuIds), 1)[0]
  })))
})
```

### 测试环境

- **框架**：Vitest
- **属性测试库**：fast-check
- **组件测试**：@vue/test-utils
- **Mock 库**：vitest/mock

### 持续集成

所有测试应该在 CI/CD 流程中自动运行：
- 提交前：运行单元测试
- Pull Request：运行所有测试（单元测试 + 属性测试）
- 部署前：运行完整测试套件 + 集成测试
