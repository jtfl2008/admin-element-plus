# 设计文档: 公司管理模块

## 概述

本文档描述公司管理模块的技术设计，包括组件架构、数据流、API 设计和实现细节。公司管理是企业权限管理系统的核心基础功能，负责管理多级公司组织架构。系统采用树形结构组织公司，支持公司的增删改查、状态管理、层级路径维护和权限控制。

本项目使用 Vue 3 + TypeScript + Element Plus 技术栈，并封装了 ConfigurableTable（可配置表格）、ConfigurableForm（可配置表单）、DialogForm（对话框表单）等基础组件，确保与部门管理、岗位管理、用户管理等模块保持一致的用户体验。

核心设计特点：
- **层级路径管理**：自动维护公司层级路径，优化查询性能和权限控制
- **循环引用防护**：编辑时排除当前公司及子公司，防止层级关系错误
- **级联检查**：删除前检查子公司、部门和用户，确保数据完整性
- **树形展示**：支持展开/折叠、搜索过滤、排序等树形操作

## 架构

### 整体架构

公司管理系统采用分层架构：

```
┌─────────────────────────────────────────┐
│         视图层 (View Layer)              │
│  - 公司列表页面 (company/index.vue)      │
│  - DialogForm (公司操作对话框)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       组件层 (Component Layer)           │
│  - ConfigurableTable (表格组件)         │
│  - ConfigurableForm (表单组件)          │
│  - CompanyTree (公司树选择器)           │
│  - StatusSwitch (状态开关)              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         服务层 (Service Layer)           │
│  - company.ts (公司 API 服务)           │
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

### 1. 公司列表页面 (company/index.vue)

**职责：**
- 展示公司树形结构
- 提供搜索和筛选功能
- 管理公司的增删改查操作
- 支持展开/折叠所有节点
- 支持数据导出

**主要状态：**
```typescript
interface CompanyPageState {
  // 公司树数据
  companyTreeData: Company[]
  // 搜索关键词
  searchKeyword: string
  // 状态筛选
  statusFilter: string
  // 操作对话框状态
  dialogVisible: boolean
  // 操作类型
  operateType: 'add' | 'edit'
  // 编辑数据
  editingData: Company | null
  // 展开状态
  isExpandAll: boolean
  // 加载状态
  loading: boolean
}
```

**主要方法：**
```typescript
// 获取公司树
async getCompanyTree(): Promise<void>

// 处理搜索
handleSearch(keyword: string, status?: string): void

// 重置搜索
handleReset(): void

// 新增公司
handleAddCompany(parentCompany?: Company): void

// 编辑公司
handleUpdateCompany(company: Company): void

// 删除公司
async handleDeleteCompany(company: Company): Promise<void>

// 展开/折叠所有节点
handleExpandAll(): void

// 导出公司数据
handleExport(): void

// 刷新列表
refresh(): void
```


### 2. 公司操作对话框 (使用 DialogForm 组件)

**职责：**
- 提供公司新增和编辑表单
- 支持上级公司树形选择
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
interface CompanyFormConfig {
  // 基础信息
  companyId?: number        // 公司ID（编辑时）
  parentId: number          // 上级公司ID
  companyCode: string       // 公司编码
  companyName: string       // 公司名称
  shortName?: string        // 公司简称
  orderNum: number          // 显示顺序
  
  // 联系信息
  leader?: string           // 负责人
  phone?: string            // 联系电话
  email?: string            // 邮箱
  address?: string          // 详细地址
  
  // 状态配置
  status: '0' | '1'         // 公司状态（0:正常 1:停用）
  
  // 备注
  remark?: string           // 备注信息
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
        label: '上级公司',
        component: 'tree-select',
        span: 24,
        data: parentCompanyOptions.value,
        props: {
          label: 'label',
          value: 'id',
          checkStrictly: true
        },
        placeholder: '请选择上级公司'
      },
      {
        prop: 'companyCode',
        label: '公司编码',
        component: 'input',
        span: 12,
        placeholder: '请输入公司编码'
      },
      {
        prop: 'companyName',
        label: '公司名称',
        component: 'input',
        span: 12,
        placeholder: '请输入公司名称'
      },
      {
        prop: 'shortName',
        label: '公司简称',
        component: 'input',
        span: 12,
        placeholder: '请输入公司简称'
      },
      {
        prop: 'orderNum',
        label: '显示顺序',
        component: 'input-number',
        span: 12,
        min: 0,
        placeholder: '请输入显示顺序'
      }
    ]
  },
  {
    type: 'form',
    key: 'contactInfo',
    title: '联系信息',
    fields: [
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
        prop: 'address',
        label: '详细地址',
        component: 'input',
        span: 24,
        placeholder: '请输入详细地址'
      }
    ]
  },
  {
    type: 'form',
    key: 'statusInfo',
    title: '状态配置',
    fields: [
      {
        prop: 'status',
        label: '公司状态',
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
    { required: true, message: '请选择上级公司', trigger: 'change' }
  ],
  companyCode: [
    { required: true, message: '请输入公司编码', trigger: 'blur' },
    { min: 2, max: 32, message: '公司编码长度在 2 到 32 个字符', trigger: 'blur' }
  ],
  companyName: [
    { required: true, message: '请输入公司名称', trigger: 'blur' },
    { min: 2, max: 90, message: '公司名称长度在 2 到 90 个字符', trigger: 'blur' }
  ],
  shortName: [
    { max: 30, message: '公司简称长度不超过 30 个字符', trigger: 'blur' }
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

### 3. 公司树表格 (ConfigurableTable)

**职责：**
- 以树形结构展示公司列表
- 支持展开/折叠节点
- 提供操作按钮（新增、编辑、删除）
- 显示公司状态

**列配置示例：**
```typescript
const tableColumns = [
  {
    prop: 'companyName',
    label: '公司名称',
    align: 'left',
    width: 260
  },
  {
    prop: 'companyCode',
    label: '公司编码',
    align: 'center',
    width: 150
  },
  {
    prop: 'shortName',
    label: '简称',
    align: 'center',
    width: 150
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
        click: ({ row }) => handleAddCompany(row)
      },
      {
        label: '编辑',
        type: 'primary',
        icon: Edit,
        link: true,
        click: ({ row }) => handleUpdateCompany(row)
      },
      {
        label: '删除',
        type: 'danger',
        icon: Delete,
        link: true,
        click: ({ row }) => handleDeleteCompany(row)
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
    click: () => handleAddCompany(),
    auth: 'system:company:add'
  },
  {
    label: isExpandAll.value ? '折叠' : '展开',
    icon: isExpandAll.value ? Fold : Expand,
    click: () => handleExpandAll()
  },
  {
    label: '导出',
    icon: Download,
    click: () => handleExport(),
    auth: 'system:company:export'
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
  :data="companyTreeData"
  :columns="tableColumns"
  :toolbars="toolbars"
  :loading="loading"
  row-key="companyId"
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
- 提供公司名称搜索
- 提供公司编码搜索
- 提供状态筛选
- 支持重置搜索条件

**配置示例：**
```typescript
const queryFields: FormFieldConfig[] = [
  {
    prop: 'companyName',
    label: '公司名称',
    component: 'input',
    span: 6,
    placeholder: '请输入公司名称'
  },
  {
    prop: 'companyCode',
    label: '公司编码',
    component: 'input',
    span: 6,
    placeholder: '请输入公司编码'
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


### 5. 公司树选择器 (el-tree-select)

**职责：**
- 在新增/编辑时选择上级公司
- 以树形结构展示公司层级
- 编辑时排除当前公司及其子公司

**使用方式：**
```vue
<el-tree-select
  v-model="formData.parentId"
  :data="parentCompanyOptions"
  :props="{ label: 'label', value: 'id' }"
  check-strictly
  :render-after-expand="false"
  placeholder="请选择上级公司"
/>
```

**数据处理：**
```typescript
// 获取上级公司选项（排除当前公司及其子公司）
const getParentCompanyOptions = (excludeCompanyId?: number) => {
  if (!excludeCompanyId) {
    // 新增模式：返回所有公司
    return convertToTreeSelect(companyTreeData.value)
  }
  
  // 编辑模式：排除当前公司及其子公司
  const filterCompany = (companies: Company[]): Company[] => {
    return companies
      .filter(company => company.companyId !== excludeCompanyId)
      .map(company => ({
        ...company,
        children: company.children ? filterCompany(company.children) : undefined
      }))
  }
  
  return convertToTreeSelect(filterCompany(companyTreeData.value))
}

// 转换为树形选择器数据格式
const convertToTreeSelect = (companies: Company[]): TreeSelectNode[] => {
  return companies.map(company => ({
    id: company.companyId,
    label: company.companyName,
    children: company.children ? convertToTreeSelect(company.children) : undefined
  }))
}
```

### 6. API 服务层 (company.ts)

**接口定义：**
```typescript
// 获取公司列表
export function fetchGetCompanyList(
  params?: CompanySearchParams
): Promise<Company[]> {
  return request.get('/system/company/list', { params })
}

// 获取排除公司列表（用于编辑时选择上级公司）
export function fetchGetExcludeCompanyList(
  companyId: number
): Promise<Company[]> {
  return request.get(`/system/company/list/exclude/${companyId}`)
}

// 新增公司
export function fetchCreateCompany(
  data: CompanyOperateParams
): Promise<void> {
  return request.post('/system/company', data)
}

// 更新公司
export function fetchUpdateCompany(
  data: CompanyOperateParams
): Promise<void> {
  return request.put('/system/company', data)
}

// 删除公司
export function fetchDeleteCompany(
  companyId: number
): Promise<void> {
  return request.delete(`/system/company/${companyId}`)
}

// 批量删除公司
export function fetchBatchDeleteCompany(
  companyIds: number[]
): Promise<void> {
  return request.delete(`/system/company/${companyIds.join(',')}`)
}

// 获取公司选择框列表（用于其他模块）
export function fetchGetCompanySelect(): Promise<CompanyTree[]> {
  return request.get('/system/company/optionselect')
}

// 导出公司数据
export function fetchExportCompany(
  params?: CompanySearchParams
): Promise<Blob> {
  return request.get('/system/company/export', { 
    params,
    responseType: 'blob'
  })
}
```


## 数据模型

### 公司实体 (Company)

```typescript
interface Company {
  companyId: number           // 公司ID
  parentId: number            // 父公司ID
  companyCode: string         // 公司编码
  companyName: string         // 公司名称
  shortName?: string          // 公司简称
  path: string                // 层级路径（如 "001.001001.001001001"）
  orderNum: number            // 显示顺序
  leader?: string             // 负责人
  phone?: string              // 联系电话
  email?: string              // 邮箱
  address?: string            // 详细地址
  status: '0' | '1'           // 公司状态（0:正常 1:停用）
  children?: Company[]        // 子公司列表
  createTime?: string         // 创建时间
  updateTime?: string         // 更新时间
  remark?: string             // 备注
}
```

### 公司搜索参数 (CompanySearchParams)

```typescript
interface CompanySearchParams {
  companyName?: string        // 公司名称
  companyCode?: string        // 公司编码
  status?: '0' | '1'          // 公司状态
}
```

### 公司操作参数 (CompanyOperateParams)

```typescript
interface CompanyOperateParams {
  companyId?: number          // 公司ID（编辑时必填）
  parentId: number            // 父公司ID
  companyCode: string         // 公司编码
  companyName: string         // 公司名称
  shortName?: string          // 公司简称
  orderNum: number            // 显示顺序
  leader?: string             // 负责人
  phone?: string              // 联系电话
  email?: string              // 邮箱
  address?: string            // 详细地址
  status: '0' | '1'           // 公司状态
  remark?: string             // 备注
}
```

### 公司树节点 (CompanyTree)

```typescript
interface CompanyTree {
  id: number                  // 节点ID
  label: string               // 节点标签
  children?: CompanyTree[]    // 子节点
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
const flatCompanies = await fetchGetCompanyList()

// 转换为树形结构
const companyTree = handleTree(flatCompanies, 'companyId', 'parentId', 'children')
```

### filterCompanyTree - 公司树过滤

```typescript
/**
 * 过滤公司树（排除指定公司及其子公司）
 * @param tree 公司树
 * @param excludeCompanyId 要排除的公司ID
 * @returns 过滤后的公司树
 */
function filterCompanyTree(
  tree: Company[],
  excludeCompanyId: number
): Company[] {
  return tree
    .filter(company => company.companyId !== excludeCompanyId)
    .map(company => ({
      ...company,
      children: company.children ? filterCompanyTree(company.children, excludeCompanyId) : undefined
    }))
}
```

### searchCompanyTree - 公司树搜索

```typescript
/**
 * 在公司树中搜索
 * @param tree 公司树
 * @param keyword 搜索关键词
 * @returns 匹配的公司列表（包含父级路径）
 */
function searchCompanyTree(
  tree: Company[],
  keyword: string
): Company[] {
  if (!keyword) return tree
  
  const result: Company[] = []
  
  const search = (companies: Company[], parentMatched: boolean = false): Company[] => {
    const matched: Company[] = []
    
    companies.forEach(company => {
      const isMatch = company.companyName.includes(keyword) || company.companyCode.includes(keyword)
      const childrenMatched = company.children ? search(company.children, isMatch) : []
      
      if (isMatch || childrenMatched.length > 0 || parentMatched) {
        matched.push({
          ...company,
          children: childrenMatched.length > 0 ? childrenMatched : undefined
        })
      }
    })
    
    return matched
  }
  
  return search(tree)
}
```

### validateCompanyForm - 表单验证

```typescript
/**
 * 验证公司表单数据
 * @param form 表单数据
 * @returns 验证结果
 */
function validateCompanyForm(
  form: CompanyOperateParams
): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // 验证必填字段
  if (!form.parentId && form.parentId !== 0) {
    errors.push('请选择上级公司')
  }
  
  if (!form.companyCode || form.companyCode.trim() === '') {
    errors.push('请输入公司编码')
  }
  
  if (form.companyCode && (form.companyCode.length < 2 || form.companyCode.length > 32)) {
    errors.push('公司编码长度在 2 到 32 个字符')
  }
  
  if (!form.companyName || form.companyName.trim() === '') {
    errors.push('请输入公司名称')
  }
  
  if (form.companyName && (form.companyName.length < 2 || form.companyName.length > 90)) {
    errors.push('公司名称长度在 2 到 90 个字符')
  }
  
  if (form.shortName && form.shortName.length > 30) {
    errors.push('公司简称长度不超过 30 个字符')
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
 * @param companyId 当前公司ID
 * @param parentId 要设置的父公司ID
 * @param companyTree 公司树
 * @returns 是否存在循环引用
 */
function checkCircularReference(
  companyId: number,
  parentId: number,
  companyTree: Company[]
): boolean {
  // 如果父公司ID为0，不存在循环引用
  if (parentId === 0) return false
  
  // 查找父公司
  const findCompany = (companies: Company[], id: number): Company | null => {
    for (const company of companies) {
      if (company.companyId === id) return company
      if (company.children) {
        const found = findCompany(company.children, id)
        if (found) return found
      }
    }
    return null
  }
  
  // 检查父公司是否是当前公司的子孙公司
  const isDescendant = (company: Company, ancestorId: number): boolean => {
    if (company.companyId === ancestorId) return true
    if (company.children) {
      return company.children.some(child => isDescendant(child, ancestorId))
    }
    return false
  }
  
  const currentCompany = findCompany(companyTree, companyId)
  if (!currentCompany) return false
  
  return isDescendant(currentCompany, parentId)
}
```

### generateCompanyPath - 生成公司层级路径

```typescript
/**
 * 生成公司层级路径
 * @param parentPath 父公司路径
 * @param companyCode 公司编码
 * @returns 完整的层级路径
 */
function generateCompanyPath(
  parentPath: string,
  companyCode: string
): string {
  if (!parentPath || parentPath === '0') {
    // 根公司，直接使用编码
    return companyCode.padStart(6, '0')
  }
  
  // 子公司，拼接父路径和编码
  return `${parentPath}.${companyCode.padStart(6, '0')}`
}
```

### updateCompanyPaths - 更新公司及子公司路径

```typescript
/**
 * 更新公司及其所有子公司的路径
 * @param companyId 公司ID
 * @param newPath 新路径
 * @param companyTree 公司树
 * @returns 更新后的公司树
 */
function updateCompanyPaths(
  companyId: number,
  newPath: string,
  companyTree: Company[]
): Company[] {
  const updatePaths = (companies: Company[]): Company[] => {
    return companies.map(company => {
      if (company.companyId === companyId) {
        // 找到目标公司，更新路径
        const updatedCompany = { ...company, path: newPath }
        
        // 递归更新子公司路径
        if (updatedCompany.children) {
          updatedCompany.children = updatedCompany.children.map(child => ({
            ...child,
            path: generateCompanyPath(newPath, child.companyCode)
          }))
        }
        
        return updatedCompany
      }
      
      // 递归处理子公司
      if (company.children) {
        return {
          ...company,
          children: updatePaths(company.children)
        }
      }
      
      return company
    })
  }
  
  return updatePaths(companyTree)
}
```


## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

基于需求分析和prework分析，以下是系统必须满足的核心正确性属性：

### 属性 1：树形数据结构的正确性

*对于任意*扁平公司数组，通过 handleTree 函数转换后，所有子公司应该正确地嵌套在其父公司的 children 数组中，且根节点的 parentId 应该为 0 或 null。

**验证：需求 1.1**

### 属性 2：表格列显示的完整性

*对于任意*公司数据，渲染后的表格应该包含公司编码、公司名称、简称、排序号、负责人、联系电话、状态等所有关键字段。

**验证：需求 1.2**

### 属性 3：公司排序的正确性

*对于任意*同级公司列表，渲染后的公司顺序应该按照 orderNum 从小到大排序。

**验证：需求 1.5**

### 属性 4：公司名称搜索的准确性

*对于任意*搜索关键词和公司树，搜索结果应该包含且仅包含公司名称中包含该关键词的所有公司项（包含其父级路径）。

**验证：需求 2.1**

### 属性 5：公司编码搜索的准确性

*对于任意*搜索关键词和公司树，搜索结果应该包含且仅包含公司编码中包含该关键词的所有公司项（包含其父级路径）。

**验证：需求 2.2**

### 属性 6：状态筛选的准确性

*对于任意*状态值和公司树，筛选结果应该包含且仅包含状态匹配的所有公司项。

**验证：需求 2.3**

### 属性 7：必填字段验证的正确性

*对于任意*公司表单数据，如果上级公司、公司编码、公司名称或排序号任一字段为空，则验证应该失败。

**验证：需求 3.2, 10.1, 10.2, 10.3, 10.4**

### 属性 8：公司路径生成的正确性

*对于任意*父公司路径和公司编码，生成的公司路径应该遵循格式 "父路径.编码"，且编码部分应该补齐到6位。

**验证：需求 3.4, 8.1**

### 属性 9：公司编码唯一性验证

*对于任意*公司列表和新公司编码，如果编码已存在，则创建操作应该被拒绝。

**验证：需求 3.10**

### 属性 10：循环引用防护的正确性

*对于任意*正在编辑的公司，在上级公司选择器中，该公司本身及其所有子公司都不应该出现在可选列表中。

**验证：需求 4.5, 7.4**

### 属性 11：公司路径更新的正确性

*对于任意*公司及其子公司，当修改上级公司时，该公司及所有子公司的路径都应该被重新计算并更新。

**验证：需求 4.6, 8.2**

### 属性 12：子公司删除保护

*对于任意*包含子公司的公司项，删除操作应该被阻止，且应该提示用户先删除子公司。

**验证：需求 5.4**

### 属性 13：正常状态显示的正确性

*对于任意*状态为 '0' 的公司，列表中应该显示"正常"标签或使用 success 类型的标签。

**验证：需求 6.1**

### 属性 14：停用状态显示的正确性

*对于任意*状态为 '1' 的公司，列表中应该显示"停用"标签或使用 danger 类型的标签。

**验证：需求 6.2**

### 属性 15：电话号码格式验证的正确性

*对于任意*输入的电话号码，如果不符合手机号码格式（1开头的11位数字），则验证应该失败。

**验证：需求 10.5**

### 属性 16：邮箱格式验证的正确性

*对于任意*输入的邮箱地址，如果不符合邮箱格式（包含@和域名），则验证应该失败。

**验证：需求 10.6**


## 错误处理

### API 错误处理

所有 API 调用都应该包含错误处理逻辑：

```typescript
try {
  const response = await fetchGetCompanyList(params)
  // 处理成功响应
  companyTreeData.value = handleTree(response, 'companyId', 'parentId', 'children')
} catch (error) {
  console.error('获取公司列表失败:', error)
  ElMessage.error('获取公司列表失败，请稍后重试')
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

**删除包含子公司的公司：**
```typescript
if (company.children && company.children.length > 0) {
  ElMessage.warning('该公司包含子公司，请先删除子公司')
  return
}
```

**删除包含部门的公司：**
```typescript
// 后端返回错误时的处理
catch (error) {
  if (error.code === 'COMPANY_HAS_DEPTS') {
    ElMessage.error('该公司下存在部门，无法删除')
  } else if (error.code === 'COMPANY_HAS_USERS') {
    ElMessage.error('该公司下存在用户，无法删除')
  } else {
    ElMessage.error('删除失败，请稍后重试')
  }
}
```

**循环引用检测：**
```typescript
const isCircularReference = (companyId: number, parentId: number): boolean => {
  // 检查 parentId 是否是 companyId 的子孙节点
  // 如果是，则存在循环引用
  if (checkCircularReference(companyId, parentId, companyTreeData.value)) {
    ElMessage.warning('不能选择当前公司或其子公司作为上级公司')
    return true
  }
  return false
}
```

**公司编码重复：**
```typescript
catch (error) {
  if (error.code === 'COMPANY_CODE_DUPLICATE') {
    ElMessage.error('公司编码已存在，请使用其他编码')
  } else {
    ElMessage.error('操作失败，请稍后重试')
  }
}
```

**权限不足：**
```typescript
if (!hasAuth.value('system:company:add')) {
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

公司管理系统采用单元测试和基于属性的测试相结合的方法：

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
describe('CompanyManagement', () => {
  it('应该在点击新增按钮时打开对话框', () => {
    const wrapper = mount(CompanyIndex)
    
    wrapper.find('[data-test="add-btn"]').trigger('click')
    
    expect(wrapper.vm.dialogVisible).toBe(true)
    expect(wrapper.vm.operateType).toBe('add')
  })
  
  it('应该阻止删除包含子公司的公司', async () => {
    const company = {
      companyId: 1,
      companyName: '总公司',
      children: [{ companyId: 2, companyName: '分公司' }]
    }
    
    await handleDeleteCompany(company)
    
    expect(ElMessage.warning).toHaveBeenCalledWith('该公司包含子公司，请先删除子公司')
  })
  
  it('应该验证电话号码格式', () => {
    const result1 = validateCompanyForm({ phone: '13800138000' })
    expect(result1.valid).toBe(true)
    
    const result2 = validateCompanyForm({ phone: '12345' })
    expect(result2.valid).toBe(false)
    expect(result2.errors).toContain('请输入正确的手机号码')
  })
  
  it('应该生成正确的公司路径', () => {
    const path1 = generateCompanyPath('', '001')
    expect(path1).toBe('000001')
    
    const path2 = generateCompanyPath('000001', '002')
    expect(path2).toBe('000001.000002')
  })
})
```

### 基于属性的测试

使用 **fast-check** 库进行基于属性的测试。

**配置要求：**
- 每个属性测试至少运行 100 次迭代
- 每个测试必须引用其设计文档属性
- 标签格式：**Feature: company-organization, Property {number}: {property_text}**

**示例：**

```typescript
import fc from 'fast-check'

describe('Property Tests - Company Management', () => {
  /**
   * Feature: company-organization, Property 1: 树形数据结构的正确性
   * 对于任意扁平公司数组，通过 handleTree 函数转换后，
   * 所有子公司应该正确地嵌套在其父公司的 children 数组中
   */
  it('属性 1: handleTree 应该正确转换扁平数组为树形结构', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          companyId: fc.integer({ min: 1, max: 1000 }),
          parentId: fc.integer({ min: 0, max: 100 }),
          companyName: fc.string({ minLength: 2, maxLength: 20 }),
          companyCode: fc.string({ minLength: 2, maxLength: 32 }),
          orderNum: fc.integer({ min: 0, max: 999 }),
          status: fc.constantFrom('0', '1')
        })),
        (flatCompanies) => {
          const tree = handleTree(flatCompanies, 'companyId', 'parentId', 'children')
          
          // 验证所有根节点的 parentId 为 0
          tree.forEach(root => {
            expect(root.parentId).toBe(0)
          })
          
          // 验证所有子节点都在正确的父节点下
          const verifyChildren = (node: any) => {
            if (node.children) {
              node.children.forEach((child: any) => {
                expect(child.parentId).toBe(node.companyId)
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
   * Feature: company-organization, Property 4: 公司名称搜索的准确性
   * 对于任意搜索关键词和公司树，搜索结果应该包含且仅包含
   * 公司名称中包含该关键词的所有公司项
   */
  it('属性 4: searchCompanyTree 应该返回所有名称匹配的公司', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          companyId: fc.integer({ min: 1, max: 1000 }),
          parentId: fc.integer({ min: 0, max: 100 }),
          companyName: fc.string({ minLength: 2, maxLength: 20 }),
          companyCode: fc.string({ minLength: 2, maxLength: 32 }),
          orderNum: fc.integer({ min: 0, max: 999 }),
          status: fc.constantFrom('0', '1')
        })),
        fc.string({ minLength: 1, maxLength: 5 }),
        (flatCompanies, keyword) => {
          const tree = handleTree(flatCompanies, 'companyId', 'parentId', 'children')
          const searchResult = searchCompanyTree(tree, keyword)
          
          // 验证所有结果都包含关键词
          const verifyMatch = (nodes: any[]) => {
            nodes.forEach(node => {
              // 节点本身或其子节点应该包含关键词
              const hasMatch = node.companyName.includes(keyword) ||
                node.companyCode.includes(keyword) ||
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
   * Feature: company-organization, Property 7: 必填字段验证的正确性
   * 对于任意公司表单数据，如果上级公司、公司编码、公司名称或排序号任一字段为空，
   * 则验证应该失败
   */
  it('属性 7: validateCompanyForm 应该验证必填字段', () => {
    fc.assert(
      fc.property(
        fc.record({
          parentId: fc.option(fc.integer({ min: 0, max: 100 }), { nil: null }),
          companyCode: fc.option(fc.string({ minLength: 2, maxLength: 32 }), { nil: null }),
          companyName: fc.option(fc.string({ minLength: 2, maxLength: 90 }), { nil: null }),
          orderNum: fc.option(fc.integer({ min: 0, max: 999 }), { nil: null }),
          status: fc.constantFrom('0', '1')
        }),
        (formData) => {
          const result = validateCompanyForm(formData as any)
          
          // 如果任一必填字段为空，验证应该失败
          const hasEmptyRequired = 
            formData.parentId === null ||
            !formData.companyCode ||
            !formData.companyName ||
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
   * Feature: company-organization, Property 8: 公司路径生成的正确性
   * 对于任意父公司路径和公司编码，生成的公司路径应该遵循格式 "父路径.编码"
   */
  it('属性 8: generateCompanyPath 应该生成正确的路径格式', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 0, maxLength: 50 }),
        fc.string({ minLength: 1, maxLength: 6 }),
        (parentPath, companyCode) => {
          const path = generateCompanyPath(parentPath, companyCode)
          
          if (!parentPath || parentPath === '0') {
            // 根公司，路径应该是补齐到6位的编码
            expect(path).toBe(companyCode.padStart(6, '0'))
          } else {
            // 子公司，路径应该是 "父路径.编码"
            expect(path).toBe(`${parentPath}.${companyCode.padStart(6, '0')}`)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: company-organization, Property 10: 循环引用防护的正确性
   * 对于任意正在编辑的公司，在上级公司选择器中，
   * 该公司本身及其所有子公司都不应该出现在可选列表中
   */
  it('属性 10: filterCompanyTree 应该排除当前公司及其子公司', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          companyId: fc.integer({ min: 1, max: 1000 }),
          parentId: fc.integer({ min: 0, max: 100 }),
          companyName: fc.string({ minLength: 2, maxLength: 20 }),
          companyCode: fc.string({ minLength: 2, maxLength: 32 }),
          orderNum: fc.integer({ min: 0, max: 999 }),
          status: fc.constantFrom('0', '1')
        })),
        fc.integer({ min: 1, max: 1000 }),
        (flatCompanies, excludeCompanyId) => {
          const tree = handleTree(flatCompanies, 'companyId', 'parentId', 'children')
          const filtered = filterCompanyTree(tree, excludeCompanyId)
          
          // 验证过滤后的树不包含被排除的公司
          const verifyExcluded = (nodes: any[]) => {
            nodes.forEach(node => {
              expect(node.companyId).not.toBe(excludeCompanyId)
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
   * Feature: company-organization, Property 12: 子公司删除保护
   * 对于任意包含子公司的公司项，删除操作应该被阻止
   */
  it('属性 12: 包含子公司的公司不应该被删除', () => {
    fc.assert(
      fc.property(
        fc.record({
          companyId: fc.integer({ min: 1, max: 1000 }),
          companyName: fc.string({ minLength: 2, maxLength: 20 }),
          children: fc.array(fc.record({
            companyId: fc.integer({ min: 1, max: 1000 }),
            companyName: fc.string({ minLength: 2, maxLength: 20 })
          }), { minLength: 1 })
        }),
        async (company) => {
          const canDelete = await canDeleteCompany(company)
          expect(canDelete).toBe(false)
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: company-organization, Property 15: 电话号码格式验证的正确性
   * 对于任意输入的电话号码，如果不符合手机号码格式，则验证应该失败
   */
  it('属性 15: validateCompanyForm 应该验证电话号码格式', () => {
    fc.assert(
      fc.property(
        fc.string(),
        (phone) => {
          const formData = {
            parentId: 0,
            companyCode: '001',
            companyName: '测试公司',
            orderNum: 1,
            phone,
            status: '0'
          }
          
          const result = validateCompanyForm(formData as any)
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
})
```

### 测试覆盖目标

- **单元测试覆盖率**：核心业务逻辑 > 80%
- **属性测试覆盖**：所有 16 个正确性属性都应该有对应的属性测试
- **集成测试**：关键用户流程（新增公司、编辑公司、删除公司、搜索公司）

### 测试数据生成器

为属性测试创建智能生成器：

```typescript
// 生成有效的公司对象
const companyArbitrary = fc.record({
  companyId: fc.integer({ min: 1, max: 1000 }),
  parentId: fc.integer({ min: 0, max: 100 }),
  companyCode: fc.string({ minLength: 2, maxLength: 32 }),
  companyName: fc.string({ minLength: 2, maxLength: 90 }),
  shortName: fc.option(fc.string({ minLength: 1, maxLength: 30 })),
  orderNum: fc.integer({ min: 0, max: 999 }),
  leader: fc.option(fc.string({ minLength: 2, maxLength: 20 })),
  phone: fc.oneof(
    fc.constant(''),
    fc.string({ minLength: 11, maxLength: 11 }).filter(s => /^1[3-9]\d{9}$/.test(s))
  ),
  email: fc.oneof(
    fc.constant(''),
    fc.emailAddress()
  ),
  status: fc.constantFrom('0', '1'),
  remark: fc.option(fc.string({ maxLength: 200 }))
})

// 生成有效的公司树
const companyTreeArbitrary = fc.array(companyArbitrary).chain(companies => {
  // 确保 parentId 引用存在的 companyId
  const companyIds = companies.map(c => c.companyId)
  return fc.constant(companies.map(c => ({
    ...c,
    parentId: fc.sample(fc.constantFrom(0, ...companyIds), 1)[0]
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
2. **循环引用防护**: 编辑公司时，必须排除当前公司及其所有子公司，防止循环引用
3. **删除保护**: 删除前检查是否有子公司、部门或用户，如果有则阻止删除
4. **层级路径管理**: 创建和编辑公司时自动维护层级路径，优化查询性能
5. **表单验证**: 使用 Element Plus 的表单验证规则，确保数据有效性
6. **权限控制**: 使用 `hasAuth` 函数控制按钮和操作的可见性
7. **加载状态**: 所有异步操作需显示 loading 状态
8. **错误处理**: API 错误需友好提示用户
9. **数据刷新**: 操作成功后自动刷新列表数据
10. **编码唯一性**: 创建和编辑时验证公司编码的唯一性
