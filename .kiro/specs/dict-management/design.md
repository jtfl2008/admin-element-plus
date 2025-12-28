# 设计文档: 字典管理模块

## 概述

本文档描述字典管理模块的技术设计，包括组件架构、数据流、API 设计和实现细节。本项目使用 Vue 3 + TypeScript + Element Plus 技术栈，并封装了 DialogForm（对话框表单）、ConfigurableForm（可配置表单）、ConfigurableTable（可配置表格）等基础组件。

字典管理模块采用左右分栏布局，左侧为字典类型树，右侧为字典数据表格。该模块提供字典类型和字典数据的完整管理功能，包括增删改查、缓存刷新、数据导出等，是系统基础数据管理的核心模块之一。

## 组件架构

```
src/views/system/dict/
├── index.vue                           # 字典管理主页面（左右分栏布局）
└── modules/
    ├── dict-type-operate-drawer.vue    # 字典类型操作抽屉（待创建）
    └── dict-data-operate-drawer.vue    # 字典数据操作抽屉（待创建）

src/components/
├── DialogForm/                         # 对话框表单组件（已有）
├── ConfigurableForm/                   # 可配置表单组件（已有）
├── ConfigurableTable/                  # 可配置表格组件（已有）
└── StatusSwitch/                       # 状态切换组件（已有）

src/service/api/system/
├── dict.ts                             # 字典类型 API
└── dict-data.ts                        # 字典数据 API

src/utils/
└── useTable.js                         # 表格工具 Hook（已有）
```

## 页面布局设计

### 主页面布局 (index.vue)

采用左右分栏布局，左侧字典类型树，右侧字典数据表格：

```
+------------------------------------------------------------------+
|                         字典管理                                   |
+------------------------------------------------------------------+
|  +----------------+  +------------------------------------------+ |
|  | 字典类型        |  |  ConfigurableForm (查询表单)              | |
|  |                |  |  字典标签 [    ] 字典类型 [    ]          | |
|  | [搜索框]       |  |  [查询] [重置]                            | |
|  | [新增类型]     |  +------------------------------------------+ |
|  | [刷新缓存]     |  |  ConfigurableTable (数据表格)             | |
|  |                |  |  [新增] [批量删除] [导出] [刷新]          | |
|  | ☑ 用户性别     |  +------------------------------------------+ |
|  |   [编辑][删除] |  |  □ | 序号 | 标签 | 键值 | 排序 | 样式 | 状态 | 时间 | 操作 |
|  | ☐ 菜单状态     |  |  □ |  1   | 男   |  0  |  1  | 蓝色 | [开关] | 2024 | [编辑][删除] |
|  |   [编辑][删除] |  |  □ |  2   | 女   |  1  |  2  | 粉色 | [开关] | 2024 | [编辑][删除] |
|  | ☐ 系统状态     |  +------------------------------------------+ |
|  |   [编辑][删除] |  |  [分页组件]                                | |
|  |                |  +------------------------------------------+ |
|  +----------------+  |                                            |
+------------------------------------------------------------------+
```


### 字典类型操作抽屉 (dict-type-operate-drawer.vue)

使用 DialogForm 组件实现新增/编辑字典类型：

```
+------------------------------------------------------------------+
|  新增字典类型 / 编辑字典类型                              [×]       |
+------------------------------------------------------------------+
|  基础信息                                                          |
|  +-------------------------------------------------------------+  |
|  |  字典名称 [          ]    字典类型 [          ]              |  |
|  |  状态 ○正常 ○停用                                           |  |
|  |  备注 [                                                ]     |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|                                    [取消]  [确定]                  |
+------------------------------------------------------------------+
```

### 字典数据操作抽屉 (dict-data-operate-drawer.vue)

使用 DialogForm 组件实现新增/编辑字典数据：

```
+------------------------------------------------------------------+
|  新增字典数据 / 编辑字典数据                              [×]       |
+------------------------------------------------------------------+
|  基础信息                                                          |
|  +-------------------------------------------------------------+  |
|  |  字典类型 [          ] (自动填充，不可编辑)                   |  |
|  |  字典标签 [          ]    字典键值 [          ]              |  |
|  |  字典排序 [          ]    是否默认 ○是 ○否                   |  |
|  |  回显样式 [下拉选择]      CSS样式 [          ]               |  |
|  |  状态 ○正常 ○停用                                           |  |
|  |  备注 [                                                ]     |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|                                    [取消]  [确定]                  |
+------------------------------------------------------------------+
```

## 组件设计

### 1. 主页面组件 (index.vue)

**职责：**
- 管理左右分栏布局
- 协调字典类型和字典数据的交互
- 处理字典类型的选择和切换
- 管理字典类型和字典数据的操作抽屉

**主要状态：**
```typescript
interface DictPageState {
  // 字典类型相关
  dictTypeList: DictType[]
  selectedDictType: DictType | null
  dictTypeSearchKeyword: string
  dictTypeDrawerVisible: boolean
  dictTypeOperateType: 'add' | 'edit'
  
  // 字典数据相关
  dictDataList: DictData[]
  dictDataTotal: number
  dictDataPageNum: number
  dictDataPageSize: number
  dictDataDrawerVisible: boolean
  dictDataOperateType: 'add' | 'edit'
  
  // 查询表单
  queryForm: {
    dictLabel: string
    dictType: string
  }
}
```


**主要方法：**
```typescript
// 字典类型相关
async getDictTypeList(): Promise<void>
handleSelectDictType(dictType: DictType): void
handleAddDictType(): void
handleEditDictType(dictType: DictType): void
async handleDeleteDictType(dictType: DictType): Promise<void>
async handleRefreshCache(): Promise<void>
handleSearchDictType(keyword: string): void

// 字典数据相关
async getDictDataList(): Promise<void>
handleAddDictData(): void
handleEditDictData(dictData: DictData): void
async handleDeleteDictData(dictData: DictData): Promise<void>
async handleBatchDeleteDictData(): Promise<void>
handleQuery(): void
handleReset(): void
```

### 2. 字典类型查询表单

使用 el-input 实现简单的搜索框：

```vue
<el-input
  v-model="dictTypeSearchKeyword"
  placeholder="请输入字典名称"
  clearable
  @input="handleSearchDictType"
>
  <template #prefix>
    <el-icon><Search /></el-icon>
  </template>
</el-input>
```

### 3. 字典类型列表

使用 el-scrollbar 和自定义列表项实现：

```vue
<el-scrollbar height="calc(100vh - 200px)">
  <div
    v-for="item in filteredDictTypeList"
    :key="item.dictId"
    class="dict-type-item"
    :class="{ active: selectedDictType?.dictId === item.dictId }"
    @click="handleSelectDictType(item)"
  >
    <div class="dict-type-info">
      <div class="dict-name">{{ item.dictName }}</div>
      <div class="dict-type">{{ item.dictType }}</div>
    </div>
    <div class="dict-type-actions">
      <el-button
        link
        type="primary"
        :icon="Edit"
        @click.stop="handleEditDictType(item)"
      />
      <el-button
        link
        type="danger"
        :icon="Delete"
        @click.stop="handleDeleteDictType(item)"
      />
    </div>
  </div>
</el-scrollbar>
```

### 4. 字典数据查询表单 (ConfigurableForm)

使用项目已有的 ConfigurableForm 组件：

**配置示例:**
```typescript
const queryFields: FormFieldConfig[] = [
  { prop: 'dictLabel', label: '字典标签', component: 'input', span: 8 },
  { prop: 'dictType', label: '字典类型', component: 'input', span: 8, disabled: true }
]
```

**使用方式:**
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


### 5. 字典数据表格 (ConfigurableTable)

使用项目已有的 ConfigurableTable 组件：

**列配置示例:**
```typescript
const tableColumns = computed(() => [
  { prop: 'dictLabel', label: '字典标签', align: 'center' },
  { prop: 'dictValue', label: '字典键值', align: 'center' },
  { prop: 'dictSort', label: '字典排序', align: 'center' },
  { 
    prop: 'listClass', 
    label: '回显样式', 
    align: 'center',
    cellSlot: 'listClass' // 使用插槽渲染标签样式
  },
  { prop: 'cssClass', label: 'CSS样式', align: 'center' },
  { 
    prop: 'status', 
    label: '状态', 
    align: 'center',
    cellSlot: 'status' // 使用插槽渲染状态开关
  },
  { prop: 'createTime', label: '创建时间', align: 'center' },
  {
    label: '操作',
    align: 'center',
    buttons: [
      {
        label: '编辑',
        type: 'primary',
        icon: Edit,
        click: ({ row }) => handleEditDictData(row)
      },
      {
        label: '删除',
        type: 'danger',
        icon: Delete,
        click: ({ row }) => handleDeleteDictData(row)
      }
    ]
  }
])
```

**工具栏配置:**
```typescript
const toolbars = computed(() => [
  { 
    label: '新增', 
    type: 'primary', 
    icon: Plus,
    disabled: () => !selectedDictType.value,
    click: () => handleAddDictData() 
  },
  { 
    label: '批量删除', 
    type: 'danger', 
    icon: Delete,
    disabled: () => selectedRows.value.length === 0,
    click: () => handleBatchDeleteDictData() 
  },
  { 
    label: '导出', 
    type: 'warning', 
    icon: Download,
    disabled: () => !selectedDictType.value,
    click: () => handleExportDictData() 
  },
  { 
    label: '刷新', 
    icon: Refresh,
    click: () => refresh() 
  }
])
```

**使用方式:**
```vue
<ConfigurableTable
  :data="dictDataList"
  :columns="tableColumns"
  :toolbars="toolbars"
  :total="dictDataTotal"
  v-model:pageNum="dictDataPageNum"
  v-model:pageSize="dictDataPageSize"
  selection
  @current-change="handlePageChange"
  @size-change="handleSizeChange"
  @selection-change="handleSelectionChange"
>
  <!-- 回显样式列插槽 -->
  <template #listClass="{ row }">
    <el-tag :type="row.listClass">
      {{ row.dictLabel }}
    </el-tag>
  </template>
  
  <!-- 状态列插槽 -->
  <template #status="{ row }">
    <StatusSwitch
      v-model="row.status"
      @change="handleStatusChange(row)"
    />
  </template>
</ConfigurableTable>
```


### 6. 字典类型操作抽屉 (dict-type-operate-drawer.vue)

使用 DialogForm 组件实现字典类型新增/编辑：

**表单配置:**
```typescript
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref<'add' | 'edit'>('add')
const dialogLoading = ref(false)

const dialogForm = ref<DictTypeOperateParams>({
  dictId: undefined,
  dictName: '',
  dictType: '',
  status: '0',
  remark: ''
})

const dialogRules = {
  dictName: [{ required: true, message: '请输入字典名称', trigger: 'blur' }],
  dictType: [{ required: true, message: '请输入字典类型', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

const dialogSections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      { 
        prop: 'dictName', 
        label: '字典名称', 
        component: 'input', 
        span: 12 
      },
      { 
        prop: 'dictType', 
        label: '字典类型', 
        component: 'input', 
        span: 12,
        disabled: () => dialogType.value === 'edit' // 编辑时禁用
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
        prop: 'remark', 
        label: '备注', 
        component: 'input', 
        type: 'textarea',
        span: 24 
      }
    ]
  }
])
```

**使用方式:**
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

### 7. 字典数据操作抽屉 (dict-data-operate-drawer.vue)

使用 DialogForm 组件实现字典数据新增/编辑：

**表单配置:**
```typescript
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref<'add' | 'edit'>('add')
const dialogLoading = ref(false)

const dialogForm = ref<DictDataOperateParams>({
  dictCode: undefined,
  dictSort: 0,
  dictLabel: '',
  dictValue: '',
  dictType: '',
  cssClass: '',
  listClass: 'default',
  isDefault: 'N',
  status: '0',
  remark: ''
})

const dialogRules = {
  dictLabel: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  dictValue: [{ required: true, message: '请输入字典键值', trigger: 'blur' }],
  dictSort: [{ required: true, message: '请输入字典排序', trigger: 'blur' }]
}


const listClassOptions = [
  { label: 'Primary', value: 'primary' },
  { label: 'Success', value: 'success' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Default', value: 'default' }
]

const dialogSections = computed(() => [
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
        span: 12 
      },
      { 
        prop: 'dictValue', 
        label: '字典键值', 
        component: 'input', 
        span: 12 
      },
      { 
        prop: 'dictSort', 
        label: '字典排序', 
        component: 'input-number', 
        span: 12 
      },
      { 
        prop: 'listClass', 
        label: '回显样式', 
        component: 'select', 
        span: 12,
        options: listClassOptions
      },
      { 
        prop: 'cssClass', 
        label: 'CSS样式', 
        component: 'input', 
        span: 12 
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
        prop: 'remark', 
        label: '备注', 
        component: 'input', 
        type: 'textarea',
        span: 24 
      }
    ]
  }
])
```

**使用方式:**
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

## 数据流设计

### 字典类型数据流

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────┐
│  字典类型列表    │────>│   index.vue     │────>│  API Layer  │
│  (左侧面板)      │     │  (状态管理)      │     │  (请求后端)  │
└─────────────────┘     └─────────────────┘     └─────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  字典数据表格     │
                    │  (右侧面板)       │
                    └──────────────────┘
```

### 字典数据数据流

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────┐
│ ConfigurableForm│────>│   index.vue     │────>│  API Layer  │
│   (查询表单)     │     │  (状态管理)      │     │  (请求后端)  │
└─────────────────┘     └─────────────────┘     └─────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │ConfigurableTable │
                    │   (数据展示)      │
                    └──────────────────┘
```


### 字典操作数据流

```
┌─────────────┐     ┌─────────────────┐     ┌─────────────┐
│  操作按钮    │────>│   DialogForm    │────>│  API Layer  │
│  (触发操作)  │     │  (表单处理)      │     │  (提交数据)  │
└─────────────┘     └─────────────────┘     └─────────────┘
                                                   │
                                                   ▼
                                            ┌─────────────┐
                                            │  刷新列表    │
                                            └─────────────┘
```

### useTable 工具使用

项目已有 `useTable.js` 工具，封装了常用的表格逻辑：

```javascript
const {
  queryForm,       // 查询表单数据
  data,            // 表格数据
  total,           // 总条数
  pageNum,         // 当前页码
  pageSize,        // 每页条数
  onQuery,         // 查询方法
  onReset,         // 重置方法
  onCurrentChange, // 页码变化
  onSizeChange,    // 每页条数变化
  refresh          // 刷新数据
} = useTable({ 
  getTableData,    // 获取数据的方法
  immediate: false // 不立即加载，等待选择字典类型
})
```

## API 设计

### 字典类型接口 (src/service/api/system/dict.ts)

```typescript
// 获取字典类型选择框列表
export function fetchGetDictTypeOptionSelect() {
  return request.get<DictType[]>('/system/dict/type/optionselect')
}

// 获取字典类型列表（分页）
export function fetchGetDictTypeList(params?: DictTypeSearchParams) {
  return request.get<PageResult<DictType>>('/system/dict/type/list', { params })
}

// 新增字典类型
export function fetchCreateDictType(data: DictTypeOperateParams) {
  return request.post('/system/dict/type', data)
}

// 更新字典类型
export function fetchUpdateDictType(data: DictTypeOperateParams) {
  return request.put('/system/dict/type', data)
}

// 批量删除字典类型
export function fetchBatchDeleteDictType(dictIds: number[]) {
  return request.delete(`/system/dict/type/${dictIds.join(',')}`)
}

// 刷新字典缓存
export function fetchRefreshDictCache() {
  return request.delete('/system/dict/type/refreshCache')
}

// 导出字典类型
export function fetchExportDictType(params?: DictTypeSearchParams) {
  return request.download('/system/dict/type/export', { params })
}
```

### 字典数据接口 (src/service/api/system/dict-data.ts)

```typescript
// 根据字典类型查询字典数据信息
export function fetchGetDictDataByType(dictType: string) {
  return request.get<DictData[]>(`/system/dict/data/type/${dictType}`)
}

// 获取字典数据列表（分页）
export function fetchGetDictDataList(params?: DictDataSearchParams) {
  return request.get<PageResult<DictData>>('/system/dict/data/list', { params })
}

// 新增字典数据
export function fetchCreateDictData(data: DictDataOperateParams) {
  return request.post('/system/dict/data', data)
}

// 更新字典数据
export function fetchUpdateDictData(data: DictDataOperateParams) {
  return request.put('/system/dict/data', data)
}

// 批量删除字典数据
export function fetchBatchDeleteDictData(dictCodes: number[]) {
  return request.delete(`/system/dict/data/${dictCodes.join(',')}`)
}

// 导出字典数据
export function fetchExportDictData(params?: DictDataSearchParams) {
  return request.download('/system/dict/data/export', { params })
}
```


## 数据模型

### 字典类型相关类型 (src/typings/api/system.d.ts)

```typescript
declare namespace Api.System {
  // 字典类型搜索参数
  interface DictTypeSearchParams extends PageParams {
    dictName?: string
    dictType?: string
    status?: string
  }

  // 字典类型列表项
  interface DictType {
    dictId: number
    dictName: string
    dictType: string
    status: string
    createTime?: string
    remark?: string
  }

  // 字典类型操作参数
  interface DictTypeOperateParams {
    dictId?: number
    dictName: string
    dictType: string
    status: string
    remark?: string
  }

  // 字典数据搜索参数
  interface DictDataSearchParams extends PageParams {
    dictLabel?: string
    dictType?: string
    status?: string
  }

  // 字典数据列表项
  interface DictData {
    dictCode: number
    dictSort: number
    dictLabel: string
    dictValue: string
    dictType: string
    cssClass?: string
    listClass: NaiveUI.ThemeColor
    isDefault: string
    status: string
    createTime?: string
    remark?: string
  }

  // 字典数据操作参数
  interface DictDataOperateParams {
    dictCode?: number
    dictSort: number
    dictLabel: string
    dictValue: string
    dictType: string
    cssClass?: string
    listClass?: string
    isDefault?: string
    status: string
    remark?: string
  }
}
```

## 回显样式映射

```typescript
// 回显样式选项
const listClassOptions = [
  { label: 'Primary', value: 'primary' },
  { label: 'Success', value: 'success' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Error', value: 'error' },
  { label: 'Default', value: 'default' }
]

// 回显样式类型映射
type ListClassType = 'primary' | 'success' | 'info' | 'warning' | 'error' | 'default'
```


## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式声明。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1：搜索结果匹配

*对于任意*搜索关键词和数据列表（字典类型或字典数据），返回的所有结果都应该在相应字段（字典名称/字典类型/字典标签）中包含该关键词。

**验证：需求 1.2, 7.2**

### 属性 2：列表字段完整性

*对于任意*列表项（字典类型或字典数据），渲染后的内容应该包含所有必需的显示字段。

**验证：需求 1.3, 7.3**

### 属性 3：必填字段验证

*对于任意*表单提交（字典类型或字典数据），如果任何必填字段为空或仅包含空白字符，则验证应该失败且不应该提交表单。

**验证：需求 2.2, 2.3, 3.2, 8.3, 8.4, 9.2**

### 属性 4：创建后可查询

*对于任意*有效的数据（字典类型或字典数据），创建成功后应该能在相应列表中查询到该数据。

**验证：需求 2.4, 8.5**

### 属性 5：编辑数据一致性

*对于任意*数据项（字典类型或字典数据），点击编辑时，表单中填充的数据应该与该数据项的所有字段值完全一致。

**验证：需求 3.1, 9.1**

### 属性 6：更新后数据变更

*对于任意*有效的数据修改（字典类型或字典数据），提交成功后，列表中该数据应该反映最新的修改。

**验证：需求 3.3, 9.3**

### 属性 7：删除后不可查询

*对于任意*数据项（字典类型或字典数据），删除成功后，该数据不应该再出现在相应列表中。

**验证：需求 4.2, 10.3**

### 属性 8：字典数据类型关联

*对于任意*选中的字典类型，右侧显示的字典数据列表应该只包含 dictType 字段等于该字典类型的数据项。

**验证：需求 7.1**

### 属性 9：字典类型自动填充

*对于任意*选中的字典类型，新增字典数据时，表单中的字典类型字段应该自动填充为该字典类型且不可编辑。

**验证：需求 8.2**

### 属性 10：批量删除按钮状态

*对于任意*表格选择状态，当且仅当选中一个或多个数据项时，批量删除按钮应该被启用。

**验证：需求 10.1, 10.7**

### 属性 11：回显样式选项完整性

*对于任意*回显样式选择器，应该包含且仅包含以下样式选项：primary、success、info、warning、error、default。

**验证：需求 12.2**

### 属性 12：回显样式应用一致性

*对于任意*字典数据，保存时选择的回显样式应该与列表中显示的标签样式完全一致。

**验证：需求 12.3**

### 属性 13：排序值类型验证

*对于任意*输入的排序值，如果不是有效的数字类型，则验证应该失败。

**验证：需求 13.2**

### 属性 14：字典数据排序正确性

*对于任意*字典数据列表，渲染后的顺序应该按照 dictSort 升序排列；当 dictSort 相同时，应该按照 createTime 排序。

**验证：需求 13.3, 13.4**

### 属性 15：状态过滤规则

*对于任意*字典数据，当且仅当其状态为启用（status='0'）时，该数据应该出现在系统其他模块的字典选择器中。

**验证：需求 14.2, 14.3**

### 属性 16：数据变更后接口一致性

*对于任意*数据变更操作（新增、修改、删除），相关查询接口应该立即返回反映最新状态的数据。

**验证：需求 15.3, 16.4**

### 属性 17：字典数据类型过滤

*对于任意*字典类型，调用根据类型查询字典数据的接口时，返回的所有数据都应该满足：dictType 等于该字典类型且 status 为启用状态。

**验证：需求 16.2**


## 错误处理

### API 错误处理

所有 API 调用都应该包含错误处理逻辑：

```typescript
try {
  const response = await fetchGetDictTypeList(params)
  // 处理成功响应
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

**未选择字典类型时新增字典数据：**
```typescript
if (!selectedDictType.value) {
  ElMessage.warning('请先选择字典类型')
  return
}
```

**字典类型编辑时禁止修改字典类型字段：**
```typescript
// 在表单配置中设置 disabled
{ 
  prop: 'dictType', 
  label: '字典类型', 
  component: 'input', 
  disabled: () => dialogType.value === 'edit'
}
```

**空白字符验证：**
```typescript
const validateNotEmpty = (value: string): boolean => {
  return value && value.trim().length > 0
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

### 单元测试平衡

- 单元测试有助于特定示例和边缘情况
- 避免编写过多单元测试 - 基于属性的测试处理大量输入覆盖
- 单元测试应专注于：
  - 演示正确行为的特定示例
  - 组件之间的集成点
  - 边缘情况和错误条件
- 属性测试应专注于：
  - 对所有输入都成立的通用属性
  - 通过随机化实现全面的输入覆盖

### 基于属性的测试

使用 **fast-check** 库进行基于属性的测试。

**配置要求：**
- 每个属性测试至少运行 100 次迭代（由于随机化）
- 每个测试必须引用其设计文档属性
- 标签格式：**Feature: dict-management, Property {number}: {property_text}**
- 每个正确性属性必须由单个基于属性的测试实现

**示例：**

```typescript
import fc from 'fast-check'

describe('Property Tests - Dict Management', () => {
  /**
   * Feature: dict-management, Property 1: 搜索结果匹配
   * 对于任意搜索关键词和数据列表，返回的所有结果都应该在相应字段中包含该关键词
   */
  it('属性 1: 搜索应该返回包含关键词的所有结果', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          dictId: fc.integer({ min: 1, max: 1000 }),
          dictName: fc.string({ minLength: 1, maxLength: 20 }),
          dictType: fc.string({ minLength: 1, maxLength: 20 })
        })),
        fc.string({ minLength: 1, maxLength: 10 }),
        (dictTypes, keyword) => {
          const results = searchDictTypes(dictTypes, keyword)
          
          // 验证所有结果都包含关键词
          results.forEach(item => {
            const matchesName = item.dictName.includes(keyword)
            const matchesType = item.dictType.includes(keyword)
            expect(matchesName || matchesType).toBe(true)
          })
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dict-management, Property 3: 必填字段验证
   * 对于任意表单提交，如果任何必填字段为空或仅包含空白字符，则验证应该失败
   */
  it('属性 3: 必填字段为空或空白字符应该验证失败', () => {
    fc.assert(
      fc.property(
        fc.record({
          dictName: fc.oneof(
            fc.constant(''),
            fc.string().filter(s => s.trim().length === 0)
          ),
          dictType: fc.string({ minLength: 1, maxLength: 20 })
        }),
        async (formData) => {
          const result = await validateDictTypeForm(formData)
          expect(result.valid).toBe(false)
          expect(result.errors).toContain('dictName')
        }
      ),
      { numRuns: 100 }
    )
  })
  
  /**
   * Feature: dict-management, Property 14: 字典数据排序正确性
   * 对于任意字典数据列表，渲染后的顺序应该按照 dictSort 升序排列
   */
  it('属性 14: 字典数据应该按 dictSort 正确排序', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({
          dictCode: fc.integer({ min: 1, max: 1000 }),
          dictLabel: fc.string({ minLength: 1, maxLength: 20 }),
          dictSort: fc.integer({ min: 0, max: 100 }),
          createTime: fc.date()
        }), { minLength: 2 }),
        (dictDataList) => {
          const sorted = sortDictData(dictDataList)
          
          // 验证排序正确性
          for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i]
            const next = sorted[i + 1]
            
            if (current.dictSort === next.dictSort) {
              // dictSort 相同时，按创建时间排序
              expect(current.createTime.getTime()).toBeLessThanOrEqual(next.createTime.getTime())
            } else {
              // dictSort 不同时，按 dictSort 排序
              expect(current.dictSort).toBeLessThan(next.dictSort)
            }
          }
        }
      ),
      { numRuns: 100 }
    )
  })
})
```

### 测试数据生成器

为属性测试创建智能生成器：

```typescript
// 生成有效的字典类型对象
const dictTypeArbitrary = fc.record({
  dictId: fc.integer({ min: 1, max: 1000 }),
  dictName: fc.string({ minLength: 1, maxLength: 50 }),
  dictType: fc.string({ minLength: 1, maxLength: 50 }),
  status: fc.constantFrom('0', '1'),
  remark: fc.option(fc.string({ maxLength: 200 }))
})

// 生成有效的字典数据对象
const dictDataArbitrary = fc.record({
  dictCode: fc.integer({ min: 1, max: 1000 }),
  dictSort: fc.integer({ min: 0, max: 999 }),
  dictLabel: fc.string({ minLength: 1, maxLength: 50 }),
  dictValue: fc.string({ minLength: 1, maxLength: 50 }),
  dictType: fc.string({ minLength: 1, maxLength: 50 }),
  cssClass: fc.option(fc.string({ maxLength: 100 })),
  listClass: fc.constantFrom('primary', 'success', 'info', 'warning', 'error', 'default'),
  isDefault: fc.constantFrom('Y', 'N'),
  status: fc.constantFrom('0', '1'),
  remark: fc.option(fc.string({ maxLength: 200 }))
})
```

### 测试覆盖目标

- **单元测试覆盖率**：核心业务逻辑 > 80%
- **属性测试覆盖**：所有 17 个正确性属性都应该有对应的属性测试
- **集成测试**：关键用户流程（新增字典类型、新增字典数据、编辑、删除、缓存刷新）

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

1. **字典类型唯一性**: dictType 字段应该在系统中唯一，编辑时不允许修改
2. **字典数据关联**: 删除字典类型前应检查是否有关联的字典数据
3. **缓存刷新**: 修改字典数据后应提示用户刷新缓存以确保其他模块获取最新数据
4. **状态管理**: 禁用状态的字典数据不应该在其他模块的选择器中显示
5. **排序规则**: 字典数据应该按 dictSort 升序排列，相同时按创建时间排序
6. **回显样式**: 使用 Element Plus 的 el-tag 组件显示回显样式
7. **加载状态**: 所有异步操作需显示 loading 状态
8. **错误处理**: API 错误需友好提示用户
9. **数据刷新**: 操作成功后自动刷新列表数据
