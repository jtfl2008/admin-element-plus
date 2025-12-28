# 设计文档: 部门管理模块

## 概述

本文档描述部门管理模块的技术设计，包括组件架构、数据流、API 设计和实现细节。部门管理是系统管理模块的核心功能之一，负责管理企业组织架构中的部门信息。系统采用树形结构组织部门，支持部门的增删改查、状态管理和权限控制。

本项目使用 Vue 3 + TypeScript + Element Plus 技术栈，并封装了 ConfigurableTable（可配置表格）、ConfigurableForm（可配置表单）、DialogForm（对话框表单）等基础组件，确保与用户管理、角色管理、菜单管理等模块保持一致的用户体验。

## 架构

### 整体架构

部门管理系统采用分层架构：

```
┌─────────────────────────────────────────┐
│         视图层 (View Layer)              │
│  - 部门列表页面 (dept/index.vue)         │
│  - DialogForm (部门操作对话框)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       组件层 (Component Layer)           │
│  - ConfigurableTable (表格组件)         │
│  - ConfigurableForm (表单组件)          │
│  - DeptTree (部门树选择器)              │
│  - StatusSwitch (状态开关)              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         服务层 (Service Layer)           │
│  - dept.ts (部门 API 服务)              │
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

### 1. 部门列表页面 (dept/index.vue)

**职责：**
- 展示部门树形结构
- 提供搜索和筛选功能
- 管理部门的增删改查操作
- 支持展开/折叠所有节点

**主要状态：**
```typescript
interface DeptPageState {
  // 部门树数据
  deptTreeData: Dept[]
  // 搜索关键词
  searchKeyword: string
  // 状态筛选
  statusFilter: string
  // 操作对话框状态
  dialogVisible: boolean
  // 操作类型
  operateType: 'add' | 'edit'
  // 编辑数据
  editingData: Dept | null
  // 展开状态
  isExpandAll: boolean
  // 加载状态
  loading: boolean
}
```

**主要方法：**
```typescript
// 获取部门树
async getDeptTree(): Promise<void>

// 处理搜索
handleSearch(keyword: string, status?: string): void

// 重置搜索
handleReset(): void

// 新增部门
handleAddDept(parentDept?: Dept): void

// 编辑部门
handleUpdateDept(dept: Dept): void

// 删除部门
async handleDeleteDept(dept: Dept): Promise<void>

// 展开/折叠所有节点
handleExpandAll(): void

// 刷新列表
refresh(): void
```

### 2. 部门操作对话框 (使用 DialogForm 组件)

**职责：**
- 提供部门新增和编辑表单
- 支持上级部门树形选择
- 验证表单数据
- 处理表单提交

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
interface DeptFormConfig {
  // 基础信息
  deptId?: number           // 部门ID（编辑时）
  parentId: number          // 上级部门ID
  deptName: string          // 部门名称
  orderNum: number          // 显示顺序
  
  // 联系信息
  leader: string            // 负责人
  phone: string             // 联系电话
  email: string             // 邮箱
  
  // 状态配置
  status: '0' | '1'         // 部门状态（0:正常 1:停用）
  
  // 备注
  remark: string            // 备注信息
}
```

**表单项配置示例：**
```typescript
const dialogSections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      {
        prop: 'parentId',
        label: '上级部门',
        component: 'tree-select',
        span: 24,
        data: parentDeptOptions.value,
        props: {
          label: 'label',
          value: 'id',
          checkStrictly: true
        },
        placeholder: '请选择上级部门'
      },
      {
        prop: 'deptName',
        label: '部门名称',
        component: 'input',
        span: 12,
        placeholder: '请输入部门名称'
      },
      {
        prop: 'orderNum',
        label: '显示顺序',
        component: 'input-number',
        span: 12,
        min: 0,
        placeholder: '请输入显示顺序'
      },
      {
        prop: 'leader',
        label: '负责人',
        component: 'input',
        span: 12,
        placeholder: '请输入负责人'
      },
      {
        prop: 'phone',
        label: '联系电话',
        component: 'input',
        span: 12,
        placeholder: '请输入联系电话'
      },
      {
        prop: 'email',
        label: '邮箱',
        component: 'input',
        span: 12,
        placeholder: '请输入邮箱'
      },
      {
        prop: 'status',
        label: '部门状态',
        component: 'radio-group',
        span: 12,
        options: [
          { label: '正常', value: '0' },
          { label: '停用', value: '1' }
        ]
      },
      {
        prop: 'remark',
        label: '备注',
        component: 'input',
        type: 'textarea',
        span: 24,
        placeholder: '请输入备注'
      }
    ]
  }
])
```

**表单验证规则：**
```typescript
const dialogRules = {
  parentId: [
    { required: true, message: '请选择上级部门', trigger: 'change' }
  ],
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '部门名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '请输入显示顺序', trigger: 'blur' },
    { type: 'number', min: 0, message: '显示顺序必须为非负整数', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
}
```

### 3. 部门树表格 (ConfigurableTable)

**职责：**
- 以树形结构展示部门列表
- 支持展开/折叠节点
- 提供操作按钮（新增、编辑、删除）
- 显示部门状态

**列配置示例：**
```typescript
const tableColumns = [
  {
    prop: 'deptName',
    label: '部门名称',
    align: 'left',
    width: 260
  },
  {
    prop: 'orderNum',
    label: '排序',
    align: 'center',
    width: 100
  },
  {
    prop: 'status',
    label: '状态',
    align: 'center',
    width: 100,
    cellSlot: 'status'
  },
  {
    prop: 'leader',
    label: '负责人',
    align: 'center',
    width: 120
  },
  {
    prop: 'phone',
    label: '联系电话',
    align: 'center',
    width: 150
  },
  {
    prop: 'email',
    label: '邮箱',
    align: 'center',
    width: 200
  },
  {
    prop: 'createTime',
    label: '创建时间',
    align: 'center',
    width: 180
  },
  {
    label: '操作',
    align: 'center',
    width: 200,
    fixed: 'right',
    buttons: [
      {
        label: '新增',
        type: 'primary',
        icon: Plus,
        link: true,
        click: ({ row }) => handleAddDept(row)
      },
      {
        label: '编辑',
        type: 'primary',
        icon: Edit,
        link: true,
        click: ({ row }) => handleUpdateDept(row)
      },
      {
        label: '删除',
        type: 'danger',
        icon: Delete,
        link: true,
        click: ({ row }) => handleDeleteDept(row)
      }
    ]
  }
]
```

**工具栏配置：**
```typescript
const toolbars = [
  {
    label: '新增',
    type: 'primary',
    icon: Plus,
    click: () => handleAddDept(),
    auth: 'system:dept:add'
  },
  {
    label: isExpandAll.value ? '折叠' : '展开',
    icon: isExpandAll.value ? Fold : Expand,
    click: () => handleExpandAll()
  },
  {
    label: '刷新',
    icon: Refresh,
    click: () => refresh()
  }
]
```

**使用方式：**
```vue
<ConfigurableTable
  :data="deptTreeData"
  :columns="tableColumns"
  :toolbars="toolbars"
  :loading="loading"
  row-key="deptId"
  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
  :default-expand-all="isExpandAll"
>
  <!-- 状态列插槽 -->
  <template #status="{ row }">
    <el-tag :type="row.status === '0' ? 'success' : 'danger'">
      {{ row.status === '0' ? '正常' : '停用' }}
    </el-tag>
  </template>
</ConfigurableTable>
```

### 4. 搜索表单 (ConfigurableForm)

**职责：**
- 提供部门名称搜索
- 提供状态筛选
- 支持重置搜索条件

**配置示例：**
```typescript
const queryFields: FormFieldConfig[] = [
  {
    prop: 'deptName',
    label: '部门名称',
    component: 'input',
    span: 6,
    placeholder: '请输入部门名称'
  },
  {
    prop: 'status',
    label: '状态',
    component: 'select',
    span: 6,
    placeholder: '请选择状态',
    options: [
      { label: '正常', value: '0' },
      { label: '停用', value: '1' }
    ]
  }
]
```

**使用方式：**
```vue
<ConfigurableForm
  v-model="queryForm"
  :fields="queryFields"
  query
  label-width="80px"
  @on-query="handleQuery"
  @on-reset="handleReset"
/>
```

### 5. 部门树选择器 (el-tree-select)

**职责：**
- 在新增/编辑时选择上级部门
- 以树形结构展示部门层级
- 编辑时排除当前部门及其子部门

**使用方式：**
```vue
<el-tree-select
  v-model="formData.parentId"
  :data="parentDeptOptions"
  :props="{ label: 'label', value: 'id' }"
  check-strictly
  :render-after-expand="false"
  placeholder="请选择上级部门"
/>
```

**数据处理：**
```typescript
// 获取上级部门选项（排除当前部门及其子部门）
const getParentDeptOptions = (excludeDeptId?: number) => {
  if (!excludeDeptId) {
    // 新增模式：返回所有部门
    return convertToTreeSelect(deptTreeData.value)
  }
  
  // 编辑模式：排除当前部门及其子部门
  const filterDept = (depts: Dept[]): Dept[] => {
    return depts
      .filter(dept => dept.deptId !== excludeDeptId)
      .map(dept => ({
        ...dept,
        children: dept.children ? filterDept(dept.children) : undefined
      }))
  }
  
  return convertToTreeSelect(filterDept(deptTreeData.value))
}

// 转换为树形选择器数据格式
const convertToTreeSelect = (depts: Dept[]): TreeSelectNode[] => {
  return depts.map(dept => ({
    id: dept.deptId,
    label: dept.deptName,
    children: dept.children ? convertToTreeSelect(dept.children) : undefined
  }))
}
```

### 6. API 服务层 (dept.ts)

**接口定义：**
```typescript
// 获取部门列表
export function fetchGetDeptList(
  params?: DeptSearchParams
): Promise<Dept[]> {
  return request.get('/system/dept/list', { params })
}

// 获取排除部门列表（用于编辑时选择上级部门）
export function fetchGetExcludeDeptList(
  deptId: number
): Promise<Dept[]> {
  return request.get(`/system/dept/list/exclude/${deptId}`)
}

// 新增部门
export function fetchCreateDept(
  data: DeptOperateParams
): Promise<void> {
  return request.post('/system/dept', data)
}

// 更新部门
export function fetchUpdateDept(
  data: DeptOperateParams
): Promise<void> {
  return request.put('/system/dept', data)
}

// 删除部门
export function fetchDeleteDept(
  deptId: number
): Promise<void> {
  return request.delete(`/system/dept/${deptId}`)
}

// 批量删除部门
export function fetchBatchDeleteDept(
  deptIds: number[]
): Promise<void> {
  return request.delete(`/system/dept/${deptIds.join(',')}`)
}

// 获取部门选择框列表（用于其他模块）
export function fetchGetDeptSelect(): Promise<DeptTree[]> {
  return request.get('/system/dept/optionselect')
}
```

## 数据模型

### 部门实体 (Dept)

```typescript
interface Dept {
  deptId: number              // 部门ID
  parentId: number            // 父部门ID
  deptName: string            // 部门名称
  orderNum: number            // 显示顺序
  leader: string              // 负责人
  phone: string               // 联系电话
  email: string               // 邮箱
  status: '0' | '1'           // 部门状态（0:正常 1:停用）
  children?: Dept[]           // 子部门列表
  createTime?: string         // 创建时间
  updateTime?: string         // 更新时间
  remark?: string             // 备注
}
```

### 部门搜索参数 (DeptSearchParams)

```typescript
interface DeptSearchParams {
  deptName?: string           // 部门名称
  status?: '0' | '1'          // 部门状态
}
```

### 部门操作参数 (DeptOperateParams)

```typescript
interface DeptOperateParams {
  deptId?: number             // 部门ID（编辑时必填）
  parentId: number            // 父部门ID
  deptName: string            // 部门名称
  orderNum: number            // 显示顺序
  leader?: string             // 负责人
  phone?: string              // 联系电话
  email?: string              // 邮箱
  status: '0' | '1'           // 部门状态
  remark?: string             // 备注
}
```

### 部门树节点 (DeptTree)

```typescript
interface DeptTree {
  id: number                  // 节点ID
  label: string               // 节点标签
  children?: DeptTree[]       // 子节点
}
```

### 树形选择器节点 (TreeSelectNode)

```typescript
interface TreeSelectNode {
  id: number                  // 节点ID
  label: string               // 节点标签
  children?: TreeSelectNode[] // 子节点
}
```

## 工具函数

### handleTree - 树形数据转换

项目已有 `src/utils/tree.ts` 中的 `handleTree` 函数，用于将扁平数组转换为树形结构：

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

**使用示例：**
```typescript
// 后端返回扁平数组
const flatDepts = await fetchGetDeptList()

// 转换为树形结构
const deptTree = handleTree(flatDepts, 'deptId', 'parentId', 'children')
```

### filterDeptTree - 部门树过滤

```typescript
/**
 * 过滤部门树（排除指定部门及其子部门）
 * @param tree 部门树
 * @param excludeDeptId 要排除的部门ID
 * @returns 过滤后的部门树
 */
function filterDeptTree(
  tree: Dept[],
  excludeDeptId: number
): Dept[] {
  return tree
    .filter(dept => dept.deptId !== excludeDeptId)
    .map(dept => ({
      ...dept,
      children: dept.children ? filterDeptTree(dept.children, excludeDeptId) : undefined
    }))
}
```

### searchDeptTree - 部门树搜索

```typescript
/**
 * 在部门树中搜索
 * @param tree 部门树
 * @param keyword 搜索关键词
 * @returns 匹配的部门列表（包含父级路径）
 */
function searchDeptTree(
  tree: Dept[],
  keyword: string
): Dept[] {
  if (!keyword) return tree
  
  const result: Dept[] = []
  
  const search = (depts: Dept[], parentMatched: boolean = false): Dept[] => {
    const matched: Dept[] = []
    
    depts.forEach(dept => {
      const isMatch = dept.deptName.includes(keyword)
      const childrenMatched = dept.children ? search(dept.children, isMatch) : []
      
      if (isMatch || childrenMatched.length > 0 || parentMatched) {
        matched.push({
          ...dept,
          children: childrenMatched.length > 0 ? childrenMatched : undefined
        })
      }
    })
    
    return matched
  }
  
  return search(tree)
}
```

### validateDeptForm - 表单验证

```typescript
/**
 * 验证部门表单数据
 * @param form 表单数据
 * @returns 验证结果
 */
function validateDeptForm(
  form: DeptOperateParams
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 验证必填字段
  if (!form.parentId && form.parentId !== 0) {
    errors.push('请选择上级部门')
  }
  
  if (!form.deptName || form.deptName.trim() === '') {
    errors.push('请输入部门名称')
  }
  
  if (form.deptName && (form.deptName.length < 2 || form.deptName.length > 50)) {
    errors.push('部门名称长度在 2 到 50 个字符')
  }
  
  if (form.orderNum === undefined || form.orderNum === null) {
    errors.push('请输入显示顺序')
  }
  
  if (form.orderNum !== undefined && form.orderNum < 0) {
    errors.push('显示顺序必须为非负整数')
  }
  
  // 验证联系电话格式
  if (form.phone && !/^1[3-9]\d{9}$/.test(form.phone)) {
    errors.push('请输入正确的手机号码')
  }
  
  // 验证邮箱格式
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.push('请输入正确的邮箱地址')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}
```

### checkCircularReference - 循环引用检测

```typescript
/**
 * 检测是否存在循环引用
 * @param deptId 当前部门ID
 * @param parentId 要设置的父部门ID
 * @param deptTree 部门树
 * @returns 是否存在循环引用
 */
function checkCircularReference(
  deptId: number,
  parentId: number,
  deptTree: Dept[]
): boolean {
  // 如果父部门ID为0，不存在循环引用
  if (parentId === 0) return false
  
  // 查找父部门
  const findDept = (depts: Dept[], id: number): Dept | null => {
    for (const dept of depts) {
      if (dept.deptId === id) return dept
      if (dept.children) {
        const found = findDept(dept.children, id)
        if (found) return found
      }
    }
    return null
  }
  
  // 检查父部门是否是当前部门的子孙部门
  const isDescendant = (dept: Dept, ancestorId: number): boolean => {
    if (dept.deptId === ancestorId) return true
    if (dept.children) {
      return dept.children.some(child => isDescendant(child, ancestorId))
    }
    return false
  }
  
  const currentDept = findDept(deptTree, deptId)
  if (!currentDept) return false
  
  return isDescendant(currentDept, parentId)
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性 1：树形数据转换的正确性

*对于任意*扁平部门数组，通过 handleTree 函数转换后，所有子部门应该正确地嵌套在其父部门的 children 数组中，且根节点的 parentId 应该为 0 或 null。

**验证：需求 1.1**

### 属性 2：表格列显示的完整性

*对于任意*部门数据，渲染后的表格应该包含部门名称、排序号、负责人、联系电话、状态等所有关键字段。

**验证：需求 1.2**

### 属性 3：展开折叠操作的正确性

*对于任意*部门树，执行展开所有节点操作后，所有节点的展开状态应该为 true；执行折叠所有节点操作后，所有节点的展开状态应该为 false。

**验证：需求 1.3**

### 属性 4：部门排序的正确性

*对于任意*同级部门列表，渲染后的部门顺序应该按照 orderNum 从小到大排序。

**验证：需求 1.5**

### 属性 5：部门名称搜索的准确性

*对于任意*搜索关键词和部门树，搜索结果应该包含且仅包含部门名称中包含该关键词的所有部门项（包含其父级路径）。

**验证：需求 2.1**

### 属性 6：状态筛选的准确性

*对于任意*状态值和部门树，筛选结果应该包含且仅包含状态匹配的所有部门项。

**验证：需求 2.2**

### 属性 7：组合搜索的准确性

*对于任意*部门名称和状态值，搜索结果应该同时满足名称匹配和状态匹配两个条件。

**验证：需求 2.3**

### 属性 8：搜索重置的完整性

*对于任意*部门列表，清空搜索条件后显示的部门数量应该等于原始部门列表的数量。

**验证：需求 2.4**

### 属性 9：搜索结果树形结构的保持性

*对于任意*搜索结果，结果数据应该仍然是有效的树形结构，即所有子部门正确嵌套在父部门的 children 数组中。

**验证：需求 2.5**

### 属性 10：必填字段验证的正确性

*对于任意*部门表单数据，如果上级部门、部门名称或排序号任一字段为空，则验证应该失败。

**验证：需求 3.2, 9.1, 9.2, 9.3**

### 属性 11：电话号码格式验证的正确性

*对于任意*输入的电话号码，如果不符合手机号码格式（1开头的11位数字），则验证应该失败。

**验证：需求 3.5, 9.4**

### 属性 12：邮箱格式验证的正确性

*对于任意*输入的邮箱地址，如果不符合邮箱格式（包含@和域名），则验证应该失败。

**验证：需求 3.6, 9.5**

### 属性 13：部门创建 API 调用的正确性

*对于任意*有效的部门表单数据，提交时应该正确调用 fetchCreateDept API 并传递完整的表单数据。

**验证：需求 3.3**

### 属性 14：部门编辑数据填充的正确性

*对于任意*部门项，点击编辑时，表单中填充的数据应该与该部门项的所有字段值完全一致。

**验证：需求 4.1**

### 属性 15：部门更新 API 调用的正确性

*对于任意*有效的部门编辑数据，提交时应该正确调用 fetchUpdateDept API 并传递完整的更新数据。

**验证：需求 4.3**

### 属性 16：循环引用防护的正确性

*对于任意*正在编辑的部门，在上级部门选择器中，该部门本身及其所有子部门都不应该出现在可选列表中。

**验证：需求 4.5, 7.4**

### 属性 17：部门删除 API 调用的正确性

*对于任意*部门 ID，确认删除时应该正确调用 fetchDeleteDept API 并传递该 deptId。

**验证：需求 5.2**

### 属性 18：子部门删除保护

*对于任意*包含子部门的部门项，删除操作应该被阻止，且应该提示用户先删除子部门。

**验证：需求 5.4**

### 属性 19：批量删除 API 调用的正确性

*对于任意*部门 ID 数组，批量删除时应该正确调用 fetchBatchDeleteDept API 并传递所有 deptId。

**验证：需求 5.6**

### 属性 20：正常状态显示的正确性

*对于任意*状态为 '0' 的部门，列表中应该显示"正常"标签或使用 success 类型的标签。

**验证：需求 6.1**

### 属性 21：停用状态显示的正确性

*对于任意*状态为 '1' 的部门，列表中应该显示"停用"标签或使用 danger 类型的标签。

**验证：需求 6.2**

### 属性 22：状态更新 API 调用的正确性

*对于任意*部门状态修改操作，应该调用 fetchUpdateDept API 并传递新的状态值。

**验证：需求 6.3**

### 属性 23：停用部门的可见性

*对于任意*状态为停用的部门，在上级部门选择器中仍然应该显示该部门。

**验证：需求 6.4**

### 属性 24：上级部门选择器树形结构的正确性

*对于任意*上级部门选择器数据，数据应该是有效的树形结构，即所有子部门正确嵌套在父部门的 children 数组中。

**验证：需求 7.2**

### 属性 25：上级部门选择的正确性

*对于任意*在上级部门选择器中选择的部门，表单中的 parentId 字段应该被设置为该部门的 deptId。

**验证：需求 7.3**

### 属性 26：新增按钮权限控制的正确性

*对于任意*没有 system:dept:add 权限的用户，新增按钮应该被隐藏或禁用。

**验证：需求 8.1**

### 属性 27：编辑按钮权限控制的正确性

*对于任意*没有 system:dept:edit 权限的用户，编辑按钮应该被隐藏或禁用。

**验证：需求 8.2**

### 属性 28：删除按钮权限控制的正确性

*对于任意*没有 system:dept:remove 权限的用户，删除按钮应该被隐藏或禁用。

**验证：需求 8.3**

### 属性 29：排序号类型验证的正确性

*对于任意*输入的排序号，如果不是非负整数，则验证应该失败。

**验证：需求 9.3**

### 属性 30：验证失败时的错误提示

*对于任意*验证失败的表单，验证函数应该返回具体的错误提示信息数组。

**验证：需求 9.6**

### 属性 31：验证失败时的提交阻止

*对于任意*验证失败的表单，提交操作应该被阻止，不应该调用 API。

**验证：需求 9.7**

## 错误处理

### API 错误处理

所有 API 调用都应该包含错误处理逻辑：

```typescript
try {
  const response = await fetchGetDeptList(params)
  // 处理成功响应
  deptTreeData.value = handleTree(response, 'deptId', 'parentId', 'children')
} catch (error) {
  console.error('获取部门列表失败:', error)
  ElMessage.error('获取部门列表失败，请稍后重试')
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

**删除包含子部门的部门：**
```typescript
if (dept.children && dept.children.length > 0) {
  ElMessage.warning('该部门包含子部门，请先删除子部门')
  return
}
```

**循环引用检测：**
```typescript
const isCircularReference = (deptId: number, parentId: number): boolean => {
  // 检查 parentId 是否是 deptId 的子孙节点
  // 如果是，则存在循环引用
  if (checkCircularReference(deptId, parentId, deptTreeData.value)) {
    ElMessage.warning('不能选择当前部门或其子部门作为上级部门')
    return true
  }
  return false
}
```

**权限不足：**
```typescript
if (!hasAuth.value('system:dept:add')) {
  ElMessage.warning('您没有权限执行此操作')
  return
}
```

**删除部门下有用户：**
```typescript
// 后端返回错误时的处理
catch (error) {
  if (error.code === 'DEPT_HAS_USERS') {
    ElMessage.error('该部门下存在用户，无法删除')
  } else {
    ElMessage.error('删除失败，请稍后重试')
  }
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

部门管理系统采用单元测试和基于属性的测试相结合的方法：

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
describe('DeptManagement', () => {
  it('应该在点击新增按钮时打开对话框', () => {
    const wrapper = mount(DeptIndex)
    
    wrapper.find('[data-test="add-btn"]').trigger('click')
    
    expect(wrapper.vm.dialogVisible).toBe(true)
    expect(wrapper.vm.operateType).toBe('add')
  })
  
  it('应该阻止删除包含子部门的部门', async () => {
    const dept = {
      deptId: 1,
      deptName: '研发部',
      children: [{ deptId: 2, deptName: '前端组' }]
    }
    
    await handleDeleteDept(dept)
    
    expect(ElMessage.warning).toHaveBeenCalledWith('该部门包含子部门，请先删除子部门')
  })
  
  it('应该验证电话号码格式', () => {
    const result1 = validateDeptForm({ phone: '13800138000' })
    expect(result1.valid).toBe(true)
    
    const result2 = validateDeptForm({ phone: '12345' })
    expect(result2.valid).toBe(false)
    expect(result2.errors).toContain('请输入正确的手机号码')
  })
})
```

### 基于属性的测试

使用 **fast-check** 库进行基于属性的测试。

**配置要求：**
- 每个属性测试至少运行 100 次迭代
- 每个测试必须引用其设计文档属性
- 标签格式：**Feature: dept-management, Property {number}: {property_text}**

**示例：**

```typescript
import fc from 'fast-check'

describe('Property Tests - Dept Management', () => {
  /**
   * Feature: dept-management, Property 1: 树形数据转换的正确性
   * 对于任意扁平部门数组，通过 handleTree 函数转换后，
   * 所有子部门应该正确地嵌套在其父部门的 children 数组中
   */
  it('属性 1: handleTree 应该正确转换扁平数组为树形结构', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          deptId: fc.integer({ min: 1, max: 1000 }),
          parentId: fc.integer({ min: 0, max: 100 }),
          deptName: fc.string({ minLength: 2, maxLength: 20 }),
          orderNum: fc.integer({ min: 0, max: 999 }),
          status: fc.constantFrom('0', '1')
        })),
        (flatDepts) => {
          const tree = handleTree(flatDepts, 'deptId', 'parentId', 'children')
          
          // 验证所有根节点的 parentId 为 0
          tree.forEach(root => {
            expect(root.parentId).toBe(0)
          })
          
          // 验证所有子节点都在正确的父节点下
          const verifyChildren = (node: any) => {
            if (node.children) {
              node.children.forEach((child: any) => {
                expect(child.parentId).toBe(node.deptId)
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
   * Feature: dept-management, Property 5: 部门名称搜索的准确性
   * 对于任意搜索关键词和部门树，搜索结果应该包含且仅包含
   * 部门名称中包含该关键词的所有部门项
   */
  it('属性 5: searchDeptTree 应该返回所有名称匹配的部门', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          deptId: fc.integer({ min: 1, max: 1000 }),
          parentId: fc.integer({ min: 0, max: 100 }),
          deptName: fc.string({ minLength: 2, maxLength: 20 }),
          orderNum: fc.integer({ min: 0, max: 999 }),
          status: fc.constantFrom('0', '1')
        })),
        fc.string({ minLength: 1, maxLength: 5 }),
        (flatDepts, keyword) => {
          const tree = handleTree(flatDepts, 'deptId', 'parentId', 'children')
          const searchResult = searchDeptTree(tree, keyword)
          
          // 验证所有结果都包含关键词
          const verifyMatch = (nodes: any[]) => {
            nodes.forEach(node => {
              // 节点本身或其子节点应该包含关键词
              const hasMatch = node.deptName.includes(keyword) ||
                (node.children && node.children.length > 0)
              expect(hasMatch).toBe(true)
              
              if (node.children) {
                verifyMatch(node.children)
              }
            })
          }
          
          verifyMatch(searchResult)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dept-management, Property 10: 必填字段验证的正确性
   * 对于任意部门表单数据，如果上级部门、部门名称或排序号任一字段为空，
   * 则验证应该失败
   */
  it('属性 10: validateDeptForm 应该验证必填字段', () => {
    fc.assert(
      fc.property(
        fc.record({
          parentId: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
          deptName: fc.option(fc.string({ minLength: 2, maxLength: 20 }), { nil: null }),
          orderNum: fc.option(fc.integer({ min: 0, max: 999 }), { nil: null }),
          status: fc.constantFrom('0', '1')
        }),
        (formData) => {
          const result = validateDeptForm(formData as any)
          
          // 如果任一必填字段为空，验证应该失败
          const hasEmptyRequired = 
            formData.parentId === null ||
            !formData.deptName ||
            formData.orderNum === null
          
          if (hasEmptyRequired) {
            expect(result.valid).toBe(false)
            expect(result.errors.length).toBeGreaterThan(0)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dept-management, Property 11: 电话号码格式验证的正确性
   * 对于任意输入的电话号码，如果不符合手机号码格式，则验证应该失败
   */
  it('属性 11: validateDeptForm 应该验证电话号码格式', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (phone) => {
          const formData = {
            parentId: 0,
            deptName: '测试部门',
            orderNum: 1,
            phone,
            status: '0'
          }
          
          const result = validateDeptForm(formData as any)
          const isValidPhone = /^1[3-9]\d{9}$/.test(phone)
          
          if (phone && !isValidPhone) {
            expect(result.valid).toBe(false)
            expect(result.errors).toContain('请输入正确的手机号码')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dept-management, Property 16: 循环引用防护的正确性
   * 对于任意正在编辑的部门，在上级部门选择器中，
   * 该部门本身及其所有子部门都不应该出现在可选列表中
   */
  it('属性 16: filterDeptTree 应该排除当前部门及其子部门', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          deptId: fc.integer({ min: 1, max: 1000 }),
          parentId: fc.integer({ min: 0, max: 100 }),
          deptName: fc.string({ minLength: 2, maxLength: 20 }),
          orderNum: fc.integer({ min: 0, max: 999 }),
          status: fc.constantFrom('0', '1')
        })),
        fc.integer({ min: 1, max: 1000 }),
        (flatDepts, excludeDeptId) => {
          const tree = handleTree(flatDepts, 'deptId', 'parentId', 'children')
          const filtered = filterDeptTree(tree, excludeDeptId)
          
          // 验证过滤后的树不包含被排除的部门
          const verifyExcluded = (nodes: any[]) => {
            nodes.forEach(node => {
              expect(node.deptId).not.toBe(excludeDeptId)
              if (node.children) {
                verifyExcluded(node.children)
              }
            })
          }
          
          verifyExcluded(filtered)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dept-management, Property 18: 子部门删除保护
   * 对于任意包含子部门的部门项，删除操作应该被阻止
   */
  it('属性 18: 包含子部门的部门不应该被删除', () => {
    fc.assert(
      fc.property(
        fc.record({
          deptId: fc.integer({ min: 1, max: 1000 }),
          deptName: fc.string({ minLength: 2, maxLength: 20 }),
          children: fc.array(fc.record({
            deptId: fc.integer({ min: 1, max: 1000 }),
            deptName: fc.string({ minLength: 2, maxLength: 20 })
          }), { minLength: 1 })
        }),
        async (dept) => {
          const canDelete = await canDeleteDept(dept)
          expect(canDelete).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dept-management, Property 4: 部门排序的正确性
   * 对于任意同级部门列表，渲染后的部门顺序应该按照 orderNum 从小到大排序
   */
  it('属性 4: 部门应该按 orderNum 正确排序', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          deptId: fc.integer({ min: 1, max: 1000 }),
          deptName: fc.string({ minLength: 2, maxLength: 20 }),
          orderNum: fc.integer({ min: 0, max: 999 }),
          parentId: fc.constant(0) // 同级部门
        }), { minLength: 2 }),
        (depts) => {
          const sorted = sortMenus(depts, 'orderNum')
          
          // 验证排序正确性
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].orderNum).toBeLessThanOrEqual(sorted[i + 1].orderNum)
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
- **属性测试覆盖**：所有 31 个正确性属性都应该有对应的属性测试
- **集成测试**：关键用户流程（新增部门、编辑部门、删除部门、搜索部门）

### 测试数据生成器

为属性测试创建智能生成器：

```typescript
// 生成有效的部门对象
const deptArbitrary = fc.record({
  deptId: fc.integer({ min: 1, max: 1000 }),
  parentId: fc.integer({ min: 0, max: 100 }),
  deptName: fc.string({ minLength: 2, maxLength: 50 }),
  orderNum: fc.integer({ min: 0, max: 999 }),
  leader: fc.string({ minLength: 2, maxLength: 20 }),
  phone: fc.oneof(
    fc.constant(''),
    fc.string({ minLength: 11, maxLength: 11 }).filter(s => /^1[3-9]\d{9}$/.test(s))
  ),
  email: fc.oneof(
    fc.constant(''),
    fc.emailAddress()
  ),
  status: fc.constantFrom('0', '1'),
  remark: fc.string({ maxLength: 200 })
})

// 生成有效的部门树
const deptTreeArbitrary = fc.array(deptArbitrary).chain(depts => {
  // 确保 parentId 引用存在的 deptId
  const deptIds = depts.map(d => d.deptId)
  return fc.constant(depts.map(d => ({
    ...d,
    parentId: fc.sample(fc.constantFrom(0, ...deptIds), 1)[0]
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

## 实现注意事项

1. **树形数据处理**: 使用项目已有的 `handleTree` 工具函数转换扁平数组为树形结构
2. **循环引用防护**: 编辑部门时，必须排除当前部门及其所有子部门，防止循环引用
3. **删除保护**: 删除前检查是否有子部门，如果有则阻止删除
4. **表单验证**: 使用 Element Plus 的表单验证规则，确保数据有效性
5. **权限控制**: 使用 `hasAuth` 函数控制按钮和操作的可见性
6. **加载状态**: 所有异步操作需显示 loading 状态
7. **错误处理**: API 错误需友好提示用户
8. **数据刷新**: 操作成功后自动刷新列表数据
9. **国际化**: 所有文本使用 i18n 函数，支持多语言
10. **响应式设计**: 确保在不同屏幕尺寸下都能正常使用

## 性能优化建议

1. **虚拟滚动**: 当部门数量超过 100 时，考虑使用虚拟滚动技术
2. **懒加载**: 大型部门树可以考虑按需加载子节点
3. **缓存策略**: 缓存已加载的部门数据，减少重复请求
4. **防抖搜索**: 搜索输入使用防抖，避免频繁请求
5. **树形数据优化**: 使用 Map 存储节点，提高查找效率
