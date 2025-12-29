# 设计文档: 字典管理模块

## 概述

本文档描述字典管理模块的技术设计，包括组件架构、数据流、API 设计和实现细节。字典管理是系统管理模块的核心功能之一，负责管理系统中的字典类型和字典数据。系统采用左右分栏布局，左侧展示字典类型列表，右侧展示选中字典类型下的字典数据。

本项目使用 Vue 3 + TypeScript + Element Plus 技术栈，并封装了 ConfigurableTable（可配置表格）、ConfigurableForm（可配置表单）、DialogForm（对话框表单）等基础组件，确保与用户管理、角色管理、菜单管理等模块保持一致的用户体验。

## 架构

### 整体架构

字典管理系统采用分层架构：

```
┌─────────────────────────────────────────┐
│         视图层 (View Layer)              │
│  - 字典管理页面 (dict/index.vue)         │
│  - DialogForm (字典操作对话框)           │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│       组件层 (Component Layer)           │
│  - ConfigurableTable (表格组件)         │
│  - ConfigurableForm (表单组件)          │
│  - StatusSwitch (状态开关)              │
└─────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────┐
│         服务层 (Service Layer)           │
│  - dict.ts (字典类型 API 服务)          │
│  - dict-data.ts (字典数据 API 服务)     │
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

### 1. 字典管理主页面 (dict/index.vue)

**职责：**
- 以树形表格展示字典类型和字典数据的层级关系
- 字典类型作为父节点，字典数据作为子节点
- 提供搜索和筛选功能
- 管理字典类型和字典数据的增删改查操作
- 支持缓存刷新和数据导出
- 支持展开/折叠节点

**主要状态：**
```typescript
interface DictPageState {
  // 树形数据（字典类型 + 字典数据）
  dictTreeData: DictTreeNode[]
  
  // 搜索表单
  searchForm: {
    dictName?: string      // 字典名称
    dictType?: string      // 字典类型
    status?: string        // 状态
  }
  
  // 操作对话框
  dialogVisible: boolean
  dialogType: 'add-type' | 'edit-type' | 'add-data' | 'edit-data'
  dialogTitle: string
  
  // 当前操作的数据
  currentDictType: DictType | null  // 当前操作的字典类型
  editingData: DictType | DictData | null
  
  // 加载状态
  loading: boolean
  
  // 展开状态
  expandedKeys: string[]
  isExpandAll: boolean
}

// 树形节点类型
interface DictTreeNode {
  id: string                    // 唯一标识
  type: 'dict-type' | 'dict-data'  // 节点类型
  data: DictType | DictData     // 节点数据
  children?: DictTreeNode[]     // 子节点（字典类型的子节点是字典数据）
}
```

**主要方法：**
```typescript
// 数据加载
async loadDictTree(): Promise<void>
buildDictTree(dictTypes: DictType[], dictDataMap: Map<string, DictData[]>): DictTreeNode[]

// 搜索
handleSearch(): void
handleReset(): void

// 字典类型操作
handleAddDictType(): void
handleEditDictType(dictType: DictType): void
async handleDeleteDictType(dictType: DictType): Promise<void>

// 字典数据操作
handleAddDictData(parentDictType: DictType): void
handleEditDictData(dictData: DictData): void
async handleDeleteDictData(dictData: DictData): Promise<void>

// 其他操作
async handleRefreshCache(): Promise<void>
async handleExport(): Promise<void>
handleExpandAll(): void
handleCollapseAll(): void

// 刷新
refresh(): void
```

### 2. 页面布局设计

采用单栏树形表格布局：

```
+------------------------------------------------------------------+
|                         字典管理                                   |
+------------------------------------------------------------------+
|  ConfigurableForm (查询表单)                                       |
|  字典名称 [    ] 字典类型 [    ] 状态 [下拉] [查询] [重置]         |
+------------------------------------------------------------------+
|  ConfigurableTable (树形表格)                                      |
|  [新增字典类型] [刷新缓存] [导出] [展开/折叠] [刷新]                |
+------------------------------------------------------------------+
|  名称/标签 | 类型/键值 | 排序 | 样式 | 状态 | 创建时间 | 操作      |
|  ▼ 用户性别 (字典类型)                                             |
|     dictType: sys_user_sex                                       |
|     状态: [正常]  创建时间: 2024-01-01                             |
|     [新增数据][编辑][删除]                                         |
|    ├─ 男 (字典数据)                                               |
|       键值: 0  排序: 1  样式: primary  状态: [正常]               |
|       [编辑][删除]                                                |
|    ├─ 女 (字典数据)                                               |
|       键值: 1  排序: 2  样式: danger  状态: [正常]                |
|       [编辑][删除]                                                |
|    └─ 未知 (字典数据)                                             |
|       键值: 2  排序: 3  样式: info  状态: [正常]                  |
|       [编辑][删除]                                                |
|  ▼ 菜单状态 (字典类型)                                             |
|     dictType: sys_show_hide                                      |
|     状态: [正常]  创建时间: 2024-01-01                             |
|     [新增数据][编辑][删除]                                         |
|    ├─ 显示 (字典数据)                                             |
|    └─ 隐藏 (字典数据)                                             |
+------------------------------------------------------------------+
```

### 3. 树形表格 (ConfigurableTable)

**使用 ConfigurableTable 组件实现树形结构：**

**列配置示例：**
```typescript
const treeTableColumns = [
  {
    prop: 'name',
    label: '名称/标签',
    align: 'left',
    width: 200,
    cellSlot: 'name' // 自定义渲染，区分字典类型和字典数据
  },
  {
    prop: 'typeOrValue',
    label: '类型/键值',
    align: 'center',
    width: 150,
    cellSlot: 'typeOrValue'
  },
  {
    prop: 'sort',
    label: '排序',
    align: 'center',
    width: 80,
    cellSlot: 'sort' // 仅字典数据显示
  },
  {
    prop: 'listClass',
    label: '样式',
    align: 'center',
    width: 100,
    cellSlot: 'listClass' // 仅字典数据显示
  },
  {
    prop: 'status',
    label: '状态',
    align: 'center',
    width: 100,
    cellSlot: 'status'
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
    width: 250,
    fixed: 'right',
    cellSlot: 'actions' // 根据节点类型显示不同操作
  }
]
```

**工具栏配置：**
```typescript
const toolbars = [
  {
    label: '新增字典类型',
    type: 'primary',
    icon: Plus,
    click: () => handleAddDictType()
  },
  {
    label: '刷新缓存',
    type: 'warning',
    icon: Refresh,
    click: () => handleRefreshCache()
  },
  {
    label: '导出',
    type: 'success',
    icon: Download,
    click: () => handleExport()
  },
  {
    label: isExpandAll.value ? '折叠' : '展开',
    icon: isExpandAll.value ? Fold : Expand,
    click: () => handleToggleExpand()
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
  :data="dictTreeData"
  :columns="treeTableColumns"
  :toolbars="toolbars"
  :loading="loading"
  row-key="id"
  :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
  :default-expand-all="isExpandAll"
>
  <!-- 名称列插槽 -->
  <template #name="{ row }">
    <span v-if="row.type === 'dict-type'" class="dict-type-name">
      {{ row.data.dictName }}
    </span>
    <span v-else class="dict-data-label">
      {{ row.data.dictLabel }}
    </span>
  </template>
  
  <!-- 类型/键值列插槽 -->
  <template #typeOrValue="{ row }">
    <span v-if="row.type === 'dict-type'">
      {{ row.data.dictType }}
    </span>
    <span v-else>
      {{ row.data.dictValue }}
    </span>
  </template>
  
  <!-- 排序列插槽 -->
  <template #sort="{ row }">
    <span v-if="row.type === 'dict-data'">
      {{ row.data.dictSort }}
    </span>
  </template>
  
  <!-- 样式列插槽 -->
  <template #listClass="{ row }">
    <el-tag v-if="row.type === 'dict-data'" :type="row.data.listClass">
      {{ row.data.listClass }}
    </el-tag>
  </template>
  
  <!-- 状态列插槽 -->
  <template #status="{ row }">
    <el-tag :type="row.data.status === '0' ? 'success' : 'danger'">
      {{ row.data.status === '0' ? '正常' : '停用' }}
    </el-tag>
  </template>
  
  <!-- 操作列插槽 -->
  <template #actions="{ row }">
    <!-- 字典类型操作 -->
    <template v-if="row.type === 'dict-type'">
      <el-button link type="primary" @click="handleAddDictData(row.data)">
        新增数据
      </el-button>
      <el-button link type="primary" @click="handleEditDictType(row.data)">
        编辑
      </el-button>
      <el-button link type="danger" @click="handleDeleteDictType(row.data)">
        删除
      </el-button>
    </template>
    
    <!-- 字典数据操作 -->
    <template v-else>
      <el-button link type="primary" @click="handleEditDictData(row.data)">
        编辑
      </el-button>
      <el-button link type="danger" @click="handleDeleteDictData(row.data)">
        删除
      </el-button>
    </template>
  </template>
</ConfigurableTable>
```

### 4. 搜索表单 (ConfigurableForm)

**职责：**
- 提供字典名称、字典类型和状态搜索
- 支持重置搜索条件
- 搜索结果在树形表格中展示

**配置示例：**
```typescript
const queryFields: FormFieldConfig[] = [
  {
    prop: 'dictName',
    label: '字典名称',
    component: 'input',
    span: 6,
    placeholder: '请输入字典名称'
  },
  {
    prop: 'dictType',
    label: '字典类型',
    component: 'input',
    span: 6,
    placeholder: '请输入字典类型'
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
  v-model="searchForm"
  :fields="queryFields"
  query
  label-width="80px"
  @on-query="handleSearch"
  @on-reset="handleReset"
/>
```

### 5. 字典类型操作对话框 (DialogForm)

**使用 DialogForm 组件实现字典类型新增/编辑：**

**表单配置：**
```typescript
const dictTypeDialogForm = ref<DictTypeOperateParams>({
  dictId: undefined,
  dictName: '',
  dictType: '',
  remark: ''
})

const dictTypeDialogRules = {
  dictName: [
    { required: true, message: '请输入字典名称', trigger: 'blur' },
    { min: 2, max: 50, message: '字典名称长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  dictType: [
    { required: true, message: '请输入字典类型', trigger: 'blur' },
    { min: 2, max: 50, message: '字典类型长度在 2 到 50 个字符', trigger: 'blur' },
    { pattern: /^[a-z_]+$/, message: '字典类型只能包含小写字母和下划线', trigger: 'blur' }
  ]
}

const dictTypeDialogSections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      {
        prop: 'dictName',
        label: '字典名称',
        component: 'input',
        span: 12,
        placeholder: '请输入字典名称'
      },
      {
        prop: 'dictType',
        label: '字典类型',
        component: 'input',
        span: 12,
        placeholder: '请输入字典类型',
        disabled: () => dictTypeOperateType.value === 'edit' // 编辑时禁用
      },
      {
        prop: 'remark',
        label: '备注',
        component: 'input',
        type: 'textarea',
        span: 24,
        placeholder: '请输入备注',
        rows: 3
      }
    ]
  }
])
```

**使用方式：**
```vue
<DialogForm
  v-model="dictTypeDialogVisible"
  v-model:formData="dictTypeDialogForm"
  :title="dictTypeDialogTitle"
  :sections="dictTypeDialogSections"
  :rules="dictTypeDialogRules"
  :confirm-loading="dictTypeDialogLoading"
  @confirm="handleDictTypeDialogConfirm"
  @cancel="handleDictTypeDialogCancel"
/>
```

### 6. 字典数据操作对话框 (DialogForm)

**使用 DialogForm 组件实现字典数据新增/编辑：**

**表单配置：**
```typescript
const dictDataDialogForm = ref<DictDataOperateParams>({
  dictCode: undefined,
  dictType: '',
  dictLabel: '',
  dictValue: '',
  dictSort: 0,
  listClass: 'default',
  cssClass: '',
  isDefault: 'N',
  status: '0',
  remark: ''
})

const dictDataDialogRules = {
  dictLabel: [
    { required: true, message: '请输入字典标签', trigger: 'blur' },
    { min: 1, max: 50, message: '字典标签长度在 1 到 50 个字符', trigger: 'blur' }
  ],
  dictValue: [
    { required: true, message: '请输入字典键值', trigger: 'blur' },
    { max: 100, message: '字典键值长度不能超过 100 个字符', trigger: 'blur' }
  ],
  dictSort: [
    { required: true, message: '请输入字典排序', trigger: 'blur' },
    { type: 'number', min: 0, message: '字典排序必须为非负整数', trigger: 'blur' }
  ]
}

// 回显样式选项
const listClassOptions = [
  { label: 'Primary', value: 'primary' },
  { label: 'Success', value: 'success' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Default', value: 'default' }
]

const dictDataDialogSections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      {
        prop: 'dictType',
        label: '字典类型',
        component: 'input',
        span: 12,
        disabled: true // 自动填充，不可编辑
      },
      {
        prop: 'dictLabel',
        label: '字典标签',
        component: 'input',
        span: 12,
        placeholder: '请输入字典标签'
      },
      {
        prop: 'dictValue',
        label: '字典键值',
        component: 'input',
        span: 12,
        placeholder: '请输入字典键值'
      },
      {
        prop: 'dictSort',
        label: '字典排序',
        component: 'input-number',
        span: 12,
        min: 0,
        placeholder: '请输入字典排序'
      },
      {
        prop: 'listClass',
        label: '回显样式',
        component: 'select',
        span: 12,
        options: listClassOptions,
        placeholder: '请选择回显样式'
      },
      {
        prop: 'cssClass',
        label: 'CSS样式',
        component: 'input',
        span: 12,
        placeholder: '请输入CSS样式类名'
      },
      {
        prop: 'status',
        label: '状态',
        component: 'radio-group',
        span: 12,
        options: [
          { label: '正常', value: '0' },
          { label: '停用', value: '1' }
        ]
      },
      {
        prop: 'isDefault',
        label: '是否默认',
        component: 'radio-group',
        span: 12,
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' }
        ]
      },
      {
        prop: 'remark',
        label: '备注',
        component: 'input',
        type: 'textarea',
        span: 24,
        placeholder: '请输入备注',
        rows: 3
      }
    ]
  }
])
```

**使用方式：**
```vue
<DialogForm
  v-model="dictDataDialogVisible"
  v-model:formData="dictDataDialogForm"
  :title="dictDataDialogTitle"
  :sections="dictDataDialogSections"
  :rules="dictDataDialogRules"
  :confirm-loading="dictDataDialogLoading"
  @confirm="handleDictDataDialogConfirm"
  @cancel="handleDictDataDialogCancel"
/>
```

## 数据模型

### 树形节点 (DictTreeNode)

```typescript
interface DictTreeNode {
  id: string                      // 唯一标识（字典类型: `type-${dictId}`, 字典数据: `data-${dictCode}`）
  type: 'dict-type' | 'dict-data' // 节点类型
  data: DictType | DictData       // 节点数据
  children?: DictTreeNode[]       // 子节点（仅字典类型有子节点）
  hasChildren?: boolean           // 是否有子节点
}
```

### 字典类型实体 (DictType)

```typescript
interface DictType {
  dictId: number              // 字典主键
  dictName: string            // 字典名称
  dictType: string            // 字典类型
  status: '0' | '1'           // 状态（0:正常 1:停用）
  remark?: string             // 备注
  createTime?: string         // 创建时间
  updateTime?: string         // 更新时间
}
```

### 字典类型搜索参数 (DictTypeSearchParams)

```typescript
interface DictTypeSearchParams extends PageQuery {
  dictName?: string           // 字典名称
  dictType?: string           // 字典类型
  status?: '0' | '1'          // 状态
}
```

### 字典类型操作参数 (DictTypeOperateParams)

```typescript
interface DictTypeOperateParams {
  dictId?: number             // 字典主键（编辑时必填）
  dictName: string            // 字典名称
  dictType: string            // 字典类型
  remark?: string             // 备注
}
```

### 字典数据实体 (DictData)

```typescript
interface DictData {
  dictCode: number            // 字典编码
  dictType: string            // 字典类型
  dictLabel: string           // 字典标签
  dictValue: string           // 字典键值
  dictSort: number            // 字典排序
  listClass: string           // 表格回显样式
  cssClass?: string           // CSS样式类名
  isDefault: 'Y' | 'N'        // 是否默认（Y:是 N:否）
  status: '0' | '1'           // 状态（0:正常 1:停用）
  remark?: string             // 备注
  createTime?: string         // 创建时间
  updateTime?: string         // 更新时间
}
```

### 字典数据搜索参数 (DictDataSearchParams)

```typescript
interface DictDataSearchParams extends PageQuery {
  dictType?: string           // 字典类型
  dictLabel?: string          // 字典标签
  status?: '0' | '1'          // 状态
}
```

### 字典数据操作参数 (DictDataOperateParams)

```typescript
interface DictDataOperateParams {
  dictCode?: number           // 字典编码（编辑时必填）
  dictType: string            // 字典类型
  dictLabel: string           // 字典标签
  dictValue: string           // 字典键值
  dictSort: number            // 字典排序
  listClass: string           // 表格回显样式
  cssClass?: string           // CSS样式类名
  isDefault?: 'Y' | 'N'       // 是否默认
  status: '0' | '1'           // 状态
  remark?: string             // 备注
}
```

## API 设计

### 数据加载策略

由于使用树形表格结构，需要同时加载字典类型和字典数据：

```typescript
/**
 * 加载完整的字典树数据
 */
async function loadDictTree(): Promise<DictTreeNode[]> {
  try {
    // 1. 获取所有字典类型
    const dictTypes = await fetchGetDictTypeList()
    
    // 2. 获取所有字典数据
    const allDictData: DictData[] = []
    for (const dictType of dictTypes.rows) {
      const dictData = await fetchGetDictDataByType(dictType.dictType)
      allDictData.push(...dictData)
    }
    
    // 3. 构建字典数据映射表
    const dictDataMap = new Map<string, DictData[]>()
    allDictData.forEach(data => {
      if (!dictDataMap.has(data.dictType)) {
        dictDataMap.set(data.dictType, [])
      }
      dictDataMap.get(data.dictType)!.push(data)
    })
    
    // 4. 构建树形结构
    return buildDictTree(dictTypes.rows, dictDataMap)
  } catch (error) {
    console.error('加载字典树失败:', error)
    throw error
  }
}

/**
 * 构建字典树形结构
 */
function buildDictTree(
  dictTypes: DictType[], 
  dictDataMap: Map<string, DictData[]>
): DictTreeNode[] {
  return dictTypes.map(dictType => {
    const dictDataList = dictDataMap.get(dictType.dictType) || []
    
    // 按排序值排序字典数据
    const sortedDictData = dictDataList.sort((a, b) => {
      if (a.dictSort !== b.dictSort) {
        return a.dictSort - b.dictSort
      }
      return new Date(a.createTime).getTime() - new Date(b.createTime).getTime()
    })
    
    return {
      id: `type-${dictType.dictId}`,
      type: 'dict-type',
      data: dictType,
      children: sortedDictData.map(dictData => ({
        id: `data-${dictData.dictCode}`,
        type: 'dict-data',
        data: dictData
      })),
      hasChildren: sortedDictData.length > 0
    }
  })
}
```

### 字典类型 API (src/service/api/system/dict.ts)

```typescript
/**
 * 获取字典类型选择框列表
 */
export function fetchGetDictTypeOptionSelect(): Promise<DictType[]> {
  return httpClient.get('/system/dict/type/optionselect')
}

/**
 * 获取字典类型列表（分页）
 */
export function fetchGetDictTypeList(params?: DictTypeSearchParams): Promise<PageResponse<DictType>> {
  return httpClient.get('/system/dict/type/list', { params })
}

/**
 * 新增字典类型
 */
export function fetchCreateDictType(data: DictTypeOperateParams): Promise<void> {
  return httpClient.post('/system/dict/type', data)
}

/**
 * 更新字典类型
 */
export function fetchUpdateDictType(data: DictTypeOperateParams): Promise<void> {
  return httpClient.put('/system/dict/type', data)
}

/**
 * 批量删除字典类型
 */
export function fetchBatchDeleteDictType(dictIds: number[]): Promise<void> {
  return httpClient.delete(`/system/dict/type/${dictIds.join(',')}`)
}

/**
 * 刷新字典缓存
 */
export function fetchRefreshDictCache(): Promise<void> {
  return httpClient.delete('/system/dict/type/refreshCache')
}

/**
 * 导出字典类型
 */
export function fetchExportDictType(params?: DictTypeSearchParams): Promise<Blob> {
  return httpClient.get('/system/dict/type/export', { 
    params,
    responseType: 'blob'
  })
}
```

### 字典数据 API (src/service/api/system/dict-data.ts)

```typescript
/**
 * 根据字典类型查询字典数据信息
 */
export function fetchGetDictDataByType(dictType: string): Promise<DictData[]> {
  return httpClient.get(`/system/dict/data/type/${dictType}`)
}

/**
 * 获取字典数据列表（分页）
 */
export function fetchGetDictDataList(params?: DictDataSearchParams): Promise<PageResponse<DictData>> {
  return httpClient.get('/system/dict/data/list', { params })
}

/**
 * 新增字典数据
 */
export function fetchCreateDictData(data: DictDataOperateParams): Promise<void> {
  return httpClient.post('/system/dict/data', data)
}

/**
 * 更新字典数据
 */
export function fetchUpdateDictData(data: DictDataOperateParams): Promise<void> {
  return httpClient.put('/system/dict/data', data)
}

/**
 * 批量删除字典数据
 */
export function fetchBatchDeleteDictData(dictCodes: number[]): Promise<void> {
  return httpClient.delete(`/system/dict/data/${dictCodes.join(',')}`)
}

/**
 * 导出字典数据
 */
export function fetchExportDictData(params?: DictDataSearchParams): Promise<Blob> {
  return httpClient.get('/system/dict/data/export', { 
    params,
    responseType: 'blob'
  })
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 搜索和筛选属性

**属性 1: 字典类型搜索结果匹配**
*对于任意* 搜索关键词，返回的所有字典类型的字典名称或字典类型字段都应该包含该搜索关键词
**验证需求: 1.2**

**属性 2: 字典数据搜索结果匹配**
*对于任意* 字典标签搜索词，返回的所有字典数据的字典标签都应该包含该搜索词
**验证需求: 7.2**

### 表单验证属性

**属性 3: 必填字段验证**
*对于任意* 缺少必填字段的表单数据（字典类型的dictName/dictType，或字典数据的dictLabel/dictValue/dictSort），提交时应该被拒绝并显示验证错误
**验证需求: 2.2, 3.2, 8.3, 9.2**

**属性 4: 空白字符验证**
*对于任意* 仅包含空白字符的必填字段，提交时应该被拒绝并显示验证错误信息
**验证需求: 2.3, 8.4**

**属性 5: 排序值类型验证**
*对于任意* 非数字类型的排序值输入，验证应该失败并提示错误
**验证需求: 13.2**

### CRUD 操作属性

**属性 6: 字典类型创建后可查询**
*对于任意* 有效的字典类型数据，创建成功后应该能在字典类型列表中查询到该字典类型
**验证需求: 2.4**

**属性 7: 字典类型编辑数据填充一致性**
*对于任意* 字典类型，点击编辑按钮后，表单中填充的数据应该与该字典类型的所有字段值完全一致
**验证需求: 3.1**

**属性 8: 字典类型更新后数据变更**
*对于任意* 有效的字典类型修改，提交成功后，字典类型列表中该字典类型的数据应该反映最新的修改
**验证需求: 3.3**

**属性 9: 字典类型删除后不可查询**
*对于任意* 字典类型，删除成功后，该字典类型不应该再出现在字典类型列表中
**验证需求: 4.2, 4.3**

**属性 10: 字典数据创建后可查询**
*对于任意* 有效的字典数据，创建成功后应该能在对应字典类型的字典数据列表中查询到该字典数据
**验证需求: 8.5**

**属性 11: 字典数据编辑数据填充一致性**
*对于任意* 字典数据，点击编辑按钮后，表单中填充的数据应该与该字典数据的所有字段值完全一致
**验证需求: 9.1**

**属性 12: 字典数据更新后数据变更**
*对于任意* 有效的字典数据修改，提交成功后，字典数据列表中该字典数据应该反映最新的修改
**验证需求: 9.3**

**属性 13: 批量删除后所有字典数据不可查询**
*对于任意* 选中的字典数据集合，批量删除成功后，这些字典数据都不应该再出现在字典数据列表中
**验证需求: 10.3, 10.4**

### 字典类型选择和数据加载属性

**属性 14: 树形结构正确性**
*对于任意* 字典类型和字典数据集合，构建的树形结构应该满足：字典类型作为父节点，其对应的字典数据作为子节点
**验证需求: 7.1**

**属性 15: 新增字典数据时自动填充字典类型**
*对于任意* 字典类型节点，点击"新增数据"按钮时，表单中的字典类型字段应该自动填充为该字典类型且不可编辑
**验证需求: 8.2**

### 列表显示属性

**属性 16: 字典类型列表字段完整性**
*对于任意* 字典类型列表，渲染后应该包含字典名称、字典类型、状态、备注和创建时间等所有必需字段
**验证需求: 1.3**

**属性 17: 字典数据列表字段完整性**
*对于任意* 字典数据列表，渲染后应该包含字典标签、字典键值、字典排序、是否默认、标签样式、CSS样式、状态、备注和创建时间等所有必需字段
**验证需求: 7.3**

### 样式和排序属性

**属性 18: 回显样式正确显示**
*对于任意* 设置了回显样式的字典数据，在列表中应该按照选定的样式（primary/success/info/warning/error/default）显示字典标签
**验证需求: 12.3**

**属性 19: 字典数据排序正确性**
*对于任意* 字典数据列表，显示时应该按照字典排序值（dictSort）升序排列
**验证需求: 13.3**

**属性 20: 相同排序值按创建时间排序**
*对于任意* 排序值相同的字典数据，应该按照创建时间进行排序
**验证需求: 13.4**

### 状态管理属性

**属性 21: 状态过滤正确性**
*对于任意* 字典数据，当状态为启用时应该在字典选择器中显示，当状态为禁用时应该在字典选择器中隐藏
**验证需求: 14.2, 14.3**

**属性 22: 状态显示样式区分**
*对于任意* 字典数据，列表中应该以不同的样式标识启用和禁用状态
**验证需求: 14.4**

### 按钮状态属性

**属性 23: 新增数据按钮位置正确性**
*对于任意* 字典类型节点，操作列应该显示"新增数据"按钮
**验证需求: 7.5**

### API 接口属性

**属性 24: 字典类型选择器接口返回格式**
*对于任意* 字典类型选择器接口调用，应该返回包含所有字典类型的数组
**验证需求: 15.2**

**属性 25: 字典类型选择器数据一致性**
*对于任意* 字典类型数据变更，选择器接口应该返回最新的字典类型数据
**验证需求: 15.3**

**属性 26: 根据类型查询字典数据过滤正确性**
*对于任意* 字典类型，调用查询接口时应该返回该类型下所有启用状态的字典数据
**验证需求: 16.2**

**属性 27: 字典数据查询接口数据一致性**
*对于任意* 字典数据变更，查询接口应该返回最新的字典数据
**验证需求: 16.4**

## 错误处理

### API 错误处理

所有 API 调用都应该包含错误处理逻辑：

```typescript
try {
  const response = await fetchGetDictTypeList(params)
  dictTypeList.value = response.rows
  dictTypeTotal.value = response.total
} catch (error) {
  console.error('获取字典类型列表失败:', error)
  ElMessage.error('获取字典类型列表失败，请稍后重试')
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

**删除包含字典数据的字典类型：**
```typescript
if (dictType.children && dictType.children.length > 0) {
  ElMessage.warning('该字典类型下存在字典数据，请先删除字典数据')
  return
}
```

**字典类型已被使用无法删除：**
```typescript
catch (error) {
  if (error.code === 'DICT_TYPE_IN_USE') {
    ElMessage.error('该字典类型正在使用中，无法删除')
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

字典管理系统采用单元测试和基于属性的测试相结合的方法：

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
describe('DictManagement', () => {
  it('应该在点击新增字典类型按钮时打开对话框', () => {
    const wrapper = mount(DictIndex)
    
    wrapper.find('[data-test="add-dict-type-btn"]').trigger('click')
    
    expect(wrapper.vm.dialogVisible).toBe(true)
    expect(wrapper.vm.dialogType).toBe('add-type')
  })
  
  it('应该正确构建树形结构', () => {
    const dictTypes = [
      { dictId: 1, dictName: '用户性别', dictType: 'sys_user_sex' }
    ]
    const dictDataMap = new Map([
      ['sys_user_sex', [
        { dictCode: 1, dictLabel: '男', dictValue: '0', dictSort: 1, dictType: 'sys_user_sex' },
        { dictCode: 2, dictLabel: '女', dictValue: '1', dictSort: 2, dictType: 'sys_user_sex' }
      ]]
    ])
    
    const tree = buildDictTree(dictTypes, dictDataMap)
    
    expect(tree).toHaveLength(1)
    expect(tree[0].type).toBe('dict-type')
    expect(tree[0].children).toHaveLength(2)
    expect(tree[0].children[0].type).toBe('dict-data')
  })
  
  it('应该验证字典类型格式', () => {
    const result1 = validateDictTypeForm({ dictType: 'user_sex' })
    expect(result1.valid).toBe(true)
    
    const result2 = validateDictTypeForm({ dictType: 'UserSex' })
    expect(result2.valid).toBe(false)
    expect(result2.errors).toContain('字典类型只能包含小写字母和下划线')
  })
  
  it('应该阻止删除包含字典数据的字典类型', () => {
    const dictType = {
      dictId: 1,
      dictName: '用户性别',
      dictType: 'sys_user_sex',
      children: [{ dictCode: 1, dictLabel: '男' }]
    }
    
    handleDeleteDictType(dictType)
    
    expect(ElMessage.warning).toHaveBeenCalledWith('该字典类型下存在字典数据，请先删除字典数据')
  })
})
```

### 基于属性的测试

使用 **fast-check** 库进行基于属性的测试。

**配置要求：**
- 每个属性测试至少运行 100 次迭代
- 每个测试必须引用其设计文档属性
- 标签格式：**Feature: dict-management, Property {number}: {property_text}**

**示例：**

```typescript
import fc from 'fast-check'

describe('Property Tests - Dict Management', () => {
  /**
   * Feature: dict-management, Property 1: 字典类型搜索结果匹配
   * 对于任意搜索关键词，返回的所有字典类型的字典名称或字典类型字段都应该包含该搜索关键词
   */
  it('属性 1: 字典类型搜索应该返回所有匹配的结果', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          dictId: fc.integer({ min: 1, max: 1000 }),
          dictName: fc.string({ minLength: 2, maxLength: 20 }),
          dictType: fc.string({ minLength: 2, maxLength: 20 }),
          status: fc.constantFrom('0', '1')
        })),
        fc.string({ minLength: 1, maxLength: 5 }),
        (dictTypes, keyword) => {
          const searchResult = searchDictTypes(dictTypes, keyword)
          
          // 验证所有结果都包含关键词
          searchResult.forEach(dict => {
            const hasMatch = dict.dictName.includes(keyword) || 
                           dict.dictType.includes(keyword)
            expect(hasMatch).toBe(true)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dict-management, Property 3: 必填字段验证
   * 对于任意缺少必填字段的表单数据，提交时应该被拒绝并显示验证错误
   */
  it('属性 3: 表单验证应该拒绝缺少必填字段的数据', () => {
    fc.assert(
      fc.property(
        fc.record({
          dictName: fc.option(fc.string({ minLength: 2, maxLength: 20 }), { nil: null }),
          dictType: fc.option(fc.string({ minLength: 2, maxLength: 20 }), { nil: null }),
          remark: fc.string({ maxLength: 200 })
        }),
        (formData) => {
          const result = validateDictTypeForm(formData as any)
          
          // 如果任一必填字段为空，验证应该失败
          const hasEmptyRequired = !formData.dictName || !formData.dictType
          
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
   * Feature: dict-management, Property 4: 空白字符验证
   * 对于任意仅包含空白字符的必填字段，提交时应该被拒绝
   */
  it('属性 4: 表单验证应该拒绝仅包含空白字符的字段', () => {
    fc.assert(
      fc.property(
        fc.stringOf(fc.constantFrom(' ', '\t', '\n')),
        (whitespaceString) => {
          const formData = {
            dictName: whitespaceString,
            dictType: 'test_type',
            remark: ''
          }
          
          const result = validateDictTypeForm(formData)
          
          if (whitespaceString.trim() === '') {
            expect(result.valid).toBe(false)
            expect(result.errors).toContain('请输入字典名称')
          }
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dict-management, Property 19: 字典数据排序正确性
   * 对于任意字典数据列表，显示时应该按照字典排序值升序排列
   */
  it('属性 19: 字典数据应该按排序值正确排序', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          dictCode: fc.integer({ min: 1, max: 1000 }),
          dictLabel: fc.string({ minLength: 1, maxLength: 20 }),
          dictValue: fc.string({ minLength: 1, maxLength: 20 }),
          dictSort: fc.integer({ min: 0, max: 999 }),
          dictType: fc.constant('test_type')
        }), { minLength: 2 }),
        (dictDataList) => {
          const sorted = sortDictData(dictDataList)
          
          // 验证排序正确性
          for (let i = 0; i < sorted.length - 1; i++) {
            expect(sorted[i].dictSort).toBeLessThanOrEqual(sorted[i + 1].dictSort)
          }
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dict-management, Property 21: 状态过滤正确性
   * 对于任意字典数据，当状态为启用时应该在字典选择器中显示，
   * 当状态为禁用时应该在字典选择器中隐藏
   */
  it('属性 21: 字典选择器应该正确过滤禁用状态的数据', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          dictCode: fc.integer({ min: 1, max: 1000 }),
          dictLabel: fc.string({ minLength: 1, maxLength: 20 }),
          dictValue: fc.string({ minLength: 1, maxLength: 20 }),
          dictSort: fc.integer({ min: 0, max: 999 }),
          dictType: fc.constant('test_type'),
          status: fc.constantFrom('0', '1')
        })),
        (dictDataList) => {
          const filtered = filterDictDataForSelector(dictDataList)
          
          // 验证所有返回的数据状态都是启用
          filtered.forEach(dict => {
            expect(dict.status).toBe('0')
          })
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dict-management, Property 14: 树形结构正确性
   * 对于任意字典类型和字典数据集合，构建的树形结构应该满足：
   * 字典类型作为父节点，其对应的字典数据作为子节点
   */
  it('属性 14: buildDictTree 应该正确构建树形结构', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          dictId: fc.integer({ min: 1, max: 1000 }),
          dictName: fc.string({ minLength: 2, maxLength: 20 }),
          dictType: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz_'.split('')), { minLength: 2, maxLength: 20 }),
          status: fc.constantFrom('0', '1')
        })),
        (dictTypes) => {
          // 为每个字典类型生成随机字典数据
          const dictDataMap = new Map<string, DictData[]>()
          dictTypes.forEach(dictType => {
            const dataCount = Math.floor(Math.random() * 5)
            const dictDataList = Array.from({ length: dataCount }, (_, i) => ({
              dictCode: i + 1,
              dictLabel: `Label ${i}`,
              dictValue: `${i}`,
              dictSort: i,
              dictType: dictType.dictType,
              status: '0'
            }))
            dictDataMap.set(dictType.dictType, dictDataList)
          })
          
          const tree = buildDictTree(dictTypes, dictDataMap)
          
          // 验证树形结构
          tree.forEach((node, index) => {
            // 验证父节点是字典类型
            expect(node.type).toBe('dict-type')
            expect(node.data).toEqual(dictTypes[index])
            
            // 验证子节点是字典数据
            if (node.children) {
              node.children.forEach(child => {
                expect(child.type).toBe('dict-data')
                expect(child.data.dictType).toBe(dictTypes[index].dictType)
              })
            }
          })
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dict-management, Property 23: 批量删除按钮状态正确性
   * 对于任意字典数据选择状态，按钮状态应该正确反映选择情况
   */
  it('属性 23: 批量删除按钮状态应该根据选择情况正确变化', () => {
})
```

### 测试覆盖目标

- **单元测试覆盖率**：核心业务逻辑 > 80%
- **属性测试覆盖**：所有 27 个正确性属性都应该有对应的属性测试
- **集成测试**：关键用户流程（新增字典类型、新增字典数据、搜索、删除）

### 测试数据生成器

为属性测试创建智能生成器：

```typescript
// 生成有效的字典类型对象
const dictTypeArbitrary = fc.record({
  dictId: fc.integer({ min: 1, max: 1000 }),
  dictName: fc.string({ minLength: 2, maxLength: 50 }),
  dictType: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz_'.split('')), { minLength: 2, maxLength: 50 }),
  status: fc.constantFrom('0', '1'),
  remark: fc.string({ maxLength: 200 })
})

// 生成有效的字典数据对象
const dictDataArbitrary = fc.record({
  dictCode: fc.integer({ min: 1, max: 1000 }),
  dictType: fc.stringOf(fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz_'.split('')), { minLength: 2, maxLength: 50 }),
  dictLabel: fc.string({ minLength: 1, maxLength: 50 }),
  dictValue: fc.string({ minLength: 1, maxLength: 100 }),
  dictSort: fc.integer({ min: 0, max: 999 }),
  listClass: fc.constantFrom('primary', 'success', 'info', 'warning', 'error', 'default'),
  cssClass: fc.string({ maxLength: 100 }),
  isDefault: fc.constantFrom('Y', 'N'),
  status: fc.constantFrom('0', '1'),
  remark: fc.string({ maxLength: 200 })
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

1. **树形表格结构**: 使用 Element Plus 的 el-table 的 tree-props 属性实现树形结构，字典类型作为父节点，字典数据作为子节点

2. **数据加载策略**: 页面初始化时需要同时加载所有字典类型和字典数据，然后构建树形结构。可以考虑使用 Promise.all 并行加载以提高性能

3. **节点唯一标识**: 使用 `type-${dictId}` 作为字典类型节点的 id，使用 `data-${dictCode}` 作为字典数据节点的 id，确保每个节点有唯一标识

4. **字典类型字段约束**: 字典类型字段只能包含小写字母和下划线，需要在表单验证中添加正则表达式验证

5. **字典数据自动填充**: 点击字典类型节点的"新增数据"按钮时，需要将该字典类型传递给对话框，并自动填充字典类型字段且设置为禁用状态

6. **回显样式**: 字典数据的 listClass 字段用于控制标签显示样式，需要在列表中使用 el-tag 组件并根据 listClass 值设置不同的 type

7. **排序规则**: 构建树形结构时，字典数据需要按照 dictSort 升序排列，相同排序值时按创建时间排序

8. **状态过滤**: 在其他模块调用字典数据接口时，应该只返回状态为启用（'0'）的数据

9. **删除保护**: 删除字典类型前需要检查是否有子节点（字典数据），如果有则阻止删除并提示用户

10. **缓存刷新**: 刷新缓存功能调用后端接口，成功后显示提示信息即可，不需要刷新前端列表

11. **导出功能**: 导出接口返回 Blob 类型数据，需要创建下载链接触发浏览器下载。导出时包含所有字典类型和字典数据

12. **展开/折叠**: 提供展开所有节点和折叠所有节点的功能，通过控制 default-expand-all 属性实现

13. **表单验证**: 使用 Element Plus 的表单验证规则，确保数据有效性

14. **加载状态**: 所有异步操作需显示 loading 状态

15. **错误处理**: API 错误需友好提示用户

16. **数据刷新**: 操作成功后自动刷新树形数据

17. **权限控制**: 使用 `hasAuth` 函数控制按钮和操作的可见性（如果项目有权限系统）

18. **性能优化**: 如果字典类型和字典数据数量较多，考虑使用虚拟滚动或懒加载优化性能
