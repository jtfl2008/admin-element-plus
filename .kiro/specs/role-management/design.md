# 设计文档: 角色管理模块

## 概述

本文档描述角色管理模块的技术设计，包括组件架构、数据流、API 设计和实现细节。本项目使用 Vue 3 + TypeScript + Element Plus 技术栈，并封装了 DialogForm（对话框表单）、ConfigurableForm（可配置表单）、ConfigurableTable（可配置表格）等基础组件。

角色管理模块提供角色的增删改查、菜单权限分配、数据权限配置、用户分配等功能，是系统权限管理的核心模块之一。

## 组件架构

```
src/views/system/role/
└── index.vue                    # 角色管理主页面（包含所有对话框逻辑）

src/components/
├── DialogForm/                  # 对话框表单组件（已有）
├── ConfigurableForm/            # 可配置表单组件（已有）
├── ConfigurableTable/           # 可配置表格组件（已有）
├── MenuTree/                    # 菜单树组件（待创建）
│   └── index.vue                # 菜单权限树选择器
├── DeptTree/                    # 部门树组件（待创建）
│   └── index.vue                # 部门权限树选择器
└── StatusSwitch/                # 状态切换组件（待创建）
    └── index.vue                # 封装 el-switch 的状态切换

src/service/api/system/
└── role.ts                      # 角色管理 API

src/utils/
└── useTable.js                  # 表格工具 Hook（已有）
```

## 页面布局设计

### 主页面布局 (index.vue)

采用单栏布局，顶部查询表单，下方数据表格：

```
+------------------------------------------------------------------+
|                         角色管理                                   |
+------------------------------------------------------------------+
|  ConfigurableForm (查询表单)                                       |
|  角色名称 [    ] 权限字符 [    ] 状态 [下拉] 创建时间 [日期范围]    |
|  [查询] [重置]                                                     |
+------------------------------------------------------------------+
|  ConfigurableTable (数据表格)                                      |
|  [新增] [批量删除] [导出] [刷新]                                    |
+------------------------------------------------------------------+
|  □ | 序号 | 角色名称 | 权限字符 | 显示顺序 | 数据范围 | 状态 | 创建时间 | 操作 |
|  □ |  1   | 超级管理员 | admin  |    1    | 全部数据 | [开关] | 2024-01 | [编辑][数据权限][分配用户][删除] |
|  □ |  2   | 普通用户   | common |    2    | 本部门   | [开关] | 2024-01 | [编辑][数据权限][分配用户][删除] |
+------------------------------------------------------------------+
|  [分页组件]                                                        |
+------------------------------------------------------------------+
```


### 角色操作对话框 (DialogForm)

使用 DialogForm 组件实现新增/编辑角色：

```
+------------------------------------------------------------------+
|  新增角色 / 编辑角色                                      [×]       |
+------------------------------------------------------------------+
|  基础信息                                                          |
|  +-------------------------------------------------------------+  |
|  |  角色名称 [          ]    权限字符 [          ]              |  |
|  |  显示顺序 [          ]    状态 ○正常 ○停用                   |  |
|  |  备注 [                                                ]     |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|  菜单权限                                                          |
|  +-------------------------------------------------------------+  |
|  |  [展开/折叠] [全选/全不选] [父子联动]                         |  |
|  |  ☑ 系统管理                                                  |  |
|  |    ☑ 用户管理                                                |  |
|  |      ☑ 用户查询                                              |  |
|  |      ☑ 用户新增                                              |  |
|  |    ☑ 角色管理                                                |  |
|  |      ☑ 角色查询                                              |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|                                    [取消]  [确定]                  |
+------------------------------------------------------------------+
```

### 数据权限配置对话框 (DialogForm)

```
+------------------------------------------------------------------+
|  数据权限配置                                            [×]       |
+------------------------------------------------------------------+
|  角色名称: 普通用户                                                |
|  权限字符: common                                                 |
|                                                                    |
|  数据范围                                                          |
|  +-------------------------------------------------------------+  |
|  |  ○ 全部数据权限                                              |  |
|  |  ○ 自定义数据权限                                            |  |
|  |  ○ 本部门数据权限                                            |  |
|  |  ○ 本部门及以下数据权限                                       |  |
|  |  ● 仅本人数据权限                                            |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|  部门权限 (选择"自定义数据权限"时显示)                              |
|  +-------------------------------------------------------------+  |
|  |  [展开/折叠] [全选/全不选] [父子联动]                         |  |
|  |  ☑ 总公司                                                    |  |
|  |    ☑ 研发部                                                  |  |
|  |      ☑ 前端组                                                |  |
|  |      ☐ 后端组                                                |  |
|  |    ☐ 市场部                                                  |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|                                    [取消]  [确定]                  |
+------------------------------------------------------------------+
```

### 用户分配对话框 (DialogForm)

```
+------------------------------------------------------------------+
|  分配用户                                                [×]       |
+------------------------------------------------------------------+
|  角色名称: 普通用户                                                |
|                                                                    |
|  [添加用户]                                                        |
|                                                                    |
|  已分配用户列表                                                     |
|  +-------------------------------------------------------------+  |
|  |  用户账号 [    ] 用户昵称 [    ] 手机号 [    ] [查询] [重置]  |  |
|  +-------------------------------------------------------------+  |
|  |  序号 | 用户账号 | 用户昵称 | 部门 | 手机号 | 操作            |  |
|  |   1   | zhangsan | 张三    | 研发 | 138   | [取消授权]      |  |
|  |   2   | lisi     | 李四    | 市场 | 139   | [取消授权]      |  |
|  +-------------------------------------------------------------+  |
|  [分页组件]                                                        |
|                                                                    |
|                                    [关闭]                          |
+------------------------------------------------------------------+
```

## 组件设计

### 1. 查询表单 (ConfigurableForm)

使用项目已有的 ConfigurableForm 组件，通过配置 fields 实现查询表单：

**配置示例:**
```typescript
const queryFields: FormFieldConfig[] = [
  { prop: 'roleName', label: '角色名称', component: 'input' },
  { prop: 'roleKey', label: '权限字符', component: 'input' },
  { 
    prop: 'status', 
    label: '状态', 
    component: 'select',
    options: [
      { label: '正常', value: '0' },
      { label: '停用', value: '1' }
    ]
  },
  {
    prop: 'createTime',
    label: '创建时间',
    component: 'date-picker',
    type: 'daterange'
  }
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


### 2. 数据表格 (ConfigurableTable)

使用项目已有的 ConfigurableTable 组件，通过配置 columns 和 toolbars 实现表格：

**列配置示例:**
```typescript
const tableColumns = computed(() => [
  { prop: 'roleName', label: '角色名称', align: 'center' },
  { prop: 'roleKey', label: '权限字符', align: 'center' },
  { prop: 'roleSort', label: '显示顺序', align: 'center' },
  { 
    prop: 'dataScope', 
    label: '数据范围', 
    align: 'center',
    cellSlot: 'dataScope' // 使用插槽渲染数据范围标签
  },
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
        visible: () => hasAuth.value('system:role:edit'),
        click: (scope) => handleEdit(scope.row)
      },
      {
        label: '数据权限',
        type: 'primary',
        icon: CircleCheck,
        visible: () => hasAuth.value('system:role:edit'),
        click: (scope) => handleDataScope(scope.row)
      },
      {
        label: '分配用户',
        type: 'primary',
        icon: User,
        visible: () => hasAuth.value('system:role:edit'),
        click: (scope) => handleAuthUser(scope.row)
      },
      {
        label: '删除',
        type: 'danger',
        icon: Delete,
        visible: (scope) => scope.row.roleId !== 1 && hasAuth.value('system:role:remove'),
        click: (scope) => handleDelete(scope.row)
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
    disabled: () => !hasAuth.value('system:role:add'),
    click: () => handleAdd() 
  },
  { 
    label: '批量删除', 
    type: 'danger', 
    icon: Delete,
    disabled: () => !hasAuth.value('system:role:remove') || selectedRows.value.length === 0,
    click: () => handleBatchDelete() 
  },
  { 
    label: '导出', 
    type: 'warning', 
    icon: Download,
    disabled: () => !hasAuth.value('system:role:export'),
    click: () => handleExport() 
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
  :data="tableData"
  :columns="tableColumns"
  :toolbars="toolbars"
  :total="total"
  v-model:pageNum="pageNum"
  v-model:pageSize="pageSize"
  selection
  @current-change="handlePageChange"
  @size-change="handleSizeChange"
  @selection-change="handleSelectionChange"
>
  <!-- 数据范围列插槽 -->
  <template #dataScope="{ row }">
    <el-tag :type="getDataScopeTagType(row.dataScope)">
      {{ getDataScopeLabel(row.dataScope) }}
    </el-tag>
  </template>
  
  <!-- 状态列插槽 -->
  <template #status="{ row }">
    <StatusSwitch
      v-model="row.status"
      :disabled="row.roleId === 1"
      @change="handleStatusChange(row)"
    />
  </template>
</ConfigurableTable>
```

### 3. 角色操作对话框 (DialogForm)

使用项目已有的 DialogForm 组件实现角色新增/编辑：

**表单配置:**
```typescript
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref<'add' | 'edit'>('add')
const dialogLoading = ref(false)

const dialogForm = ref<RoleOperateParams>({
  roleId: undefined,
  roleName: '',
  roleKey: '',
  roleSort: 0,
  status: '0',
  menuIds: [],
  remark: ''
})

const dialogRules = {
  roleName: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  roleKey: [{ required: true, message: '请输入权限字符', trigger: 'blur' }],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 导入菜单树组件
import MenuTree from '@/components/MenuTree/index.vue'

const dialogSections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      { 
        prop: 'roleName', 
        label: '角色名称', 
        component: 'input', 
        span: 12 
      },
      { 
        prop: 'roleKey', 
        label: '权限字符', 
        component: 'input', 
        span: 12 
      },
      { 
        prop: 'roleSort', 
        label: '显示顺序', 
        component: 'input-number', 
        span: 12 
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
      },
      { 
        prop: 'menuIds', 
        label: '菜单权限', 
        component: MenuTree,  // 必须传递组件对象，不能使用字符串形式
        span: 24,
        roleId: computed(() => dialogForm.value.roleId) // 传递角色ID
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


### 4. 菜单权限树组件 (MenuTree)

封装 el-tree 组件，实现菜单权限选择：

**Props:**
```typescript
interface Props {
  modelValue: number[]         // 已选中的菜单ID数组
  roleId?: number             // 角色ID（用于获取已选菜单）
}
```

**功能特性:**
- 支持展开/折叠所有节点
- 支持全选/全不选
- 支持父子节点联动
- 支持半选状态显示
- 异步加载菜单树数据

**使用方式:**
```vue
<MenuTree
  v-model="formModel.menuIds"
  :role-id="formModel.roleId"
/>
```

### 5. 数据权限配置对话框 (DialogForm)

使用项目已有的 DialogForm 组件实现数据权限配置：

**数据范围选项:**
```typescript
const dataScopeOptions = [
  { label: '全部数据权限', value: '1' },
  { label: '自定义数据权限', value: '2' },
  { label: '本部门数据权限', value: '3' },
  { label: '本部门及以下数据权限', value: '4' },
  { label: '仅本人数据权限', value: '5' }
]
```

**表单配置:**
```typescript
const dataScopeVisible = ref(false)
const dataScopeLoading = ref(false)

const dataScopeForm = ref({
  roleId: undefined,
  roleName: '',
  roleKey: '',
  dataScope: '1',
  deptIds: []
})

// 导入部门树组件
import DeptTree from '@/components/DeptTree/index.vue'

const dataScopeSections = computed(() => [
  {
    type: 'form',
    key: 'roleInfo',
    fields: [
      { 
        prop: 'roleName', 
        label: '角色名称', 
        component: 'input',
        span: 12,
        disabled: true
      },
      { 
        prop: 'roleKey', 
        label: '权限字符', 
        component: 'input',
        span: 12,
        disabled: true
      },
      { 
        prop: 'dataScope', 
        label: '数据范围', 
        component: 'radio-group', 
        span: 24,
        options: dataScopeOptions
      },
      { 
        prop: 'deptIds', 
        label: '部门权限', 
        component: DeptTree,  // 必须传递组件对象，不能使用字符串形式
        span: 24,
        visible: () => dataScopeForm.value.dataScope === '2', // 仅自定义数据权限时显示
        roleId: computed(() => dataScopeForm.value.roleId) // 传递角色ID
      }
    ]
  }
])
```

**使用方式:**
```vue
<DialogForm
  v-model="dataScopeVisible"
  v-model:formData="dataScopeForm"
  title="数据权限配置"
  :sections="dataScopeSections"
  :confirm-loading="dataScopeLoading"
  @confirm="handleDataScopeConfirm"
  @cancel="handleDataScopeCancel"
/>
```

### 6. 部门权限树组件 (DeptTree)

封装 el-tree 组件，实现部门权限选择：

**Props:**
```typescript
interface Props {
  modelValue: number[]         // 已选中的部门ID数组
  roleId?: number             // 角色ID（用于获取已选部门）
}
```

**功能特性:**
- 支持展开/折叠所有节点
- 支持全选/全不选
- 支持父子节点联动
- 异步加载部门树数据

**使用方式:**
```vue
<DeptTree
  v-model="formModel.deptIds"
  :role-id="formModel.roleId"
  v-show="formModel.dataScope === '2'"
/>
```

### 7. 用户分配对话框 (DialogForm)

使用项目已有的 DialogForm 组件实现用户分配：

**表单配置:**
```typescript
const authUserVisible = ref(false)

const authUserForm = ref({
  roleId: undefined,
  roleName: ''
})

// 已分配用户列表数据
const authUserTableData = ref([])
const authUserTotal = ref(0)
const authUserPageNum = ref(1)
const authUserPageSize = ref(10)

const authUserSections = computed(() => [
  {
    type: 'form',
    key: 'roleInfo',
    fields: [
      { 
        prop: 'roleName', 
        label: '角色名称', 
        component: 'input',
        span: 24,
        disabled: true
      }
    ]
  },
  {
    type: 'custom',
    key: 'userList',
    title: '已分配用户列表',
    slotName: 'userTable' // 使用自定义插槽渲染用户表格
  }
])
```

**使用方式:**
```vue
<DialogForm
  v-model="authUserVisible"
  v-model:formData="authUserForm"
  title="分配用户"
  :sections="authUserSections"
  width="900px"
  :show-default-buttons="false"
  :custom-buttons="[
    { label: '关闭', onClick: handleAuthUserCancel }
  ]"
>
  <!-- 用户表格插槽 -->
  <template #userTable>
    <div class="auth-user-content">
      <el-button type="primary" @click="handleAddUser">添加用户</el-button>
      
      <!-- 搜索表单 -->
      <ConfigurableForm
        v-model="authUserQueryForm"
        :fields="authUserQueryFields"
        query
        @on-query="handleAuthUserQuery"
        @on-reset="handleAuthUserReset"
      />
      
      <!-- 用户表格 -->
      <ConfigurableTable
        :data="authUserTableData"
        :columns="authUserTableColumns"
        :total="authUserTotal"
        v-model:pageNum="authUserPageNum"
        v-model:pageSize="authUserPageSize"
        @current-change="handleAuthUserPageChange"
        @size-change="handleAuthUserSizeChange"
      />
    </div>
  </template>
</DialogForm>
```

### 8. 状态切换组件 (StatusSwitch)

封装 el-switch 组件，添加切换前确认功能：

**Props:**
```typescript
interface Props {
  modelValue: string           // 当前状态值
  activeValue?: string         // 启用值，默认 '0'
  inactiveValue?: string       // 禁用值，默认 '1'
  disabled?: boolean           // 是否禁用
  loading?: boolean            // 加载状态
}
```

**使用方式:**
```vue
<StatusSwitch
  v-model="row.status"
  :disabled="row.roleId === 1"
  @change="handleStatusChange(row)"
/>
```

## 数据流设计

### 角色列表数据流

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

### 角色操作数据流

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│  操作按钮    │────>│   DialogForm     │────>│  API Layer  │
│  (触发操作)  │     │  (表单处理)       │     │  (提交数据)  │
└─────────────┘     └──────────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   MenuTree   │
                    │ (菜单权限)    │
                    └──────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │  刷新列表    │
                    └─────────────┘
```

### 数据权限配置数据流

```
┌─────────────┐     ┌─────────────────────┐     ┌─────────────┐
│  数据权限    │────>│    DialogForm       │────>│  API Layer  │
│  按钮       │     │  (权限配置)          │     │  (提交数据)  │
└─────────────┘     └─────────────────────┘     └─────────────┘
                            │
                            ▼
                    ┌──────────────┐
                    │   DeptTree   │
                    │ (部门权限)    │
                    └──────────────┘
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
  immediate: true  // 是否立即加载
})
```

## API 设计

### 接口定义 (src/service/api/system/role.ts)

```typescript
// 获取角色列表
export function fetchGetRoleList(params?: RoleSearchParams) {
  return request.get<PageResult<Role>>('/system/role/list', { params })
}

// 新增角色
export function fetchCreateRole(data: RoleOperateParams) {
  return request.post('/system/role', data)
}

// 更新角色
export function fetchUpdateRole(data: RoleOperateParams) {
  return request.put('/system/role', data)
}

// 删除角色
export function fetchBatchDeleteRole(roleIds: number[]) {
  return request.delete(`/system/role/${roleIds.join(',')}`)
}

// 获取角色详情
export function fetchGetRoleInfo(roleId: number) {
  return request.get<Role>(`/system/role/${roleId}`)
}

// 更新角色状态
export function fetchUpdateRoleStatus(data: { roleId: number; status: string }) {
  return request.put('/system/role/changeStatus', data)
}

// 获取角色菜单树
export function fetchGetRoleMenuTreeSelect(roleId: number) {
  return request.get<RoleMenuTree>(`/system/role/roleMenuTreeselect/${roleId}`)
}

// 获取角色部门树
export function fetchGetRoleDeptTreeSelect(roleId: number) {
  return request.get<RoleDeptTree>(`/system/role/deptTree/${roleId}`)
}

// 配置数据权限
export function fetchUpdateDataScope(data: DataScopeParams) {
  return request.put('/system/role/dataScope', data)
}

// 获取角色已分配用户列表
export function fetchGetRoleUserList(params: RoleUserSearchParams) {
  return request.get<PageResult<User>>('/system/role/authUser/allocatedList', { params })
}

// 获取角色未分配用户列表
export function fetchGetRoleUnallocatedUserList(params: RoleUserSearchParams) {
  return request.get<PageResult<User>>('/system/role/authUser/unallocatedList', { params })
}

// 批量授权用户
export function fetchAuthUserSelectAll(data: { roleId: number; userIds: number[] }) {
  return request.put('/system/role/authUser/selectAll', data)
}

// 取消授权用户
export function fetchCancelAuthUser(data: { roleId: number; userId: number }) {
  return request.put('/system/role/authUser/cancel', data)
}

// 批量取消授权用户
export function fetchCancelAuthUserAll(data: { roleId: number; userIds: number[] }) {
  return request.put('/system/role/authUser/cancelAll', data)
}

// 导出角色
export function fetchExportRole(params?: RoleSearchParams) {
  return request.download('/system/role/export', { params })
}
```

## 数据模型

### 角色相关类型 (src/typings/api/system.d.ts)

```typescript
declare namespace Api.System {
  // 角色搜索参数
  interface RoleSearchParams extends PageParams {
    roleName?: string
    roleKey?: string
    status?: string
    createTime?: [string, string]
  }

  // 角色列表项
  interface Role {
    roleId: number
    roleName: string
    roleKey: string
    roleSort: number
    dataScope: string
    status: string
    delFlag?: string
    createTime?: string
    remark?: string
  }

  // 角色操作参数
  interface RoleOperateParams {
    roleId?: number
    roleName: string
    roleKey: string
    roleSort: number
    status: string
    menuIds: number[]
    remark?: string
  }

  // 数据权限配置参数
  interface DataScopeParams {
    roleId: number
    roleName: string
    roleKey: string
    dataScope: string
    deptIds?: number[]
  }

  // 角色菜单树
  interface RoleMenuTree {
    menus: MenuTreeNode[]
    checkedKeys: number[]
  }

  // 菜单树节点
  interface MenuTreeNode {
    id: number
    label: string
    children?: MenuTreeNode[]
  }

  // 角色部门树
  interface RoleDeptTree {
    depts: DeptTreeNode[]
    checkedKeys: number[]
  }

  // 部门树节点
  interface DeptTreeNode {
    id: number
    label: string
    children?: DeptTreeNode[]
  }

  // 角色用户搜索参数
  interface RoleUserSearchParams extends PageParams {
    roleId: number
    userName?: string
    phonenumber?: string
  }
}
```

## 数据范围映射

```typescript
// 数据范围选项
const dataScopeOptions = [
  { label: '全部数据权限', value: '1' },
  { label: '自定义数据权限', value: '2' },
  { label: '本部门数据权限', value: '3' },
  { label: '本部门及以下数据权限', value: '4' },
  { label: '仅本人数据权限', value: '5' }
]

// 数据范围映射记录
const dataScopeRecord: Record<string, string> = {
  '1': '全部数据',
  '2': '自定义数据',
  '3': '本部门数据',
  '4': '本部门及以下',
  '5': '仅本人数据'
}

// 获取数据范围标签
const getDataScopeLabel = (dataScope: string) => {
  return dataScopeRecord[dataScope] || '未知'
}

// 获取数据范围标签类型
const getDataScopeTagType = (dataScope: string) => {
  const typeMap: Record<string, string> = {
    '1': 'danger',
    '2': 'warning',
    '3': 'success',
    '4': 'info',
    '5': 'primary'
  }
  return typeMap[dataScope] || ''
}
```


## 正确性属性

正确性属性是关于系统行为的形式化陈述，应该对所有有效执行都成立。这些属性作为人类可读规范和机器可验证正确性保证之间的桥梁。

### 搜索和筛选属性

**属性 1: 角色名称搜索结果匹配**
*对于任意* 角色名称搜索词，返回的所有角色的角色名称都应该包含该搜索词
**验证需求: 1.2**

**属性 2: 权限字符搜索结果匹配**
*对于任意* 权限字符搜索词，返回的所有角色的权限字符都应该包含该搜索词
**验证需求: 1.3**

**属性 3: 状态筛选结果匹配**
*对于任意* 状态值，返回的所有角色都应该具有该状态值
**验证需求: 1.4**

**属性 4: 时间范围筛选结果匹配**
*对于任意* 时间范围，返回的所有角色的创建时间都应该在该时间范围内
**验证需求: 1.5**

**属性 5: 分页数据量正确**
*对于任意* 分页参数（页码和每页大小），返回的数据量应该不超过每页大小（最后一页除外）
**验证需求: 1.6**

### 表单验证属性

**属性 6: 必填字段验证**
*对于任意* 缺少必填字段（角色名称、权限字符或状态）的角色表单，提交时应该被拒绝并显示验证错误
**验证需求: 2.2, 2.3, 2.5, 2.9, 3.5, 10.1, 10.2, 10.3, 10.5**

### CRUD 操作属性

**属性 7: 角色创建后可查询**
*对于任意* 有效的角色数据，创建成功后应该能在角色列表中查询到该角色
**验证需求: 2.8**

**属性 8: 角色编辑数据一致性**
*对于任意* 角色，点击编辑按钮后，抽屉表单中显示的数据应该与该角色的当前数据一致
**验证需求: 3.1**

**属性 9: 角色更新后数据变更**
*对于任意* 有效的角色修改，提交成功后，角色列表中该角色的数据应该反映最新的修改
**验证需求: 3.4**

**属性 10: 角色删除后不可查询**
*对于任意* 角色，删除成功后，该角色不应该再出现在角色列表中
**验证需求: 4.2**

**属性 11: 批量删除后所有角色不可查询**
*对于任意* 选中的角色集合，批量删除成功后，这些角色都不应该再出现在角色列表中
**验证需求: 4.5**

### 状态管理属性

**属性 12: 状态切换后值改变**
*对于任意* 角色，切换状态成功后，该角色的状态值应该从启用变为停用，或从停用变为启用
**验证需求: 5.2**

**属性 13: 状态切换失败后恢复原值**
*对于任意* 角色，如果状态切换失败，该角色的状态值应该恢复到切换前的值
**验证需求: 5.4**

### 权限配置属性

**属性 14: 自定义数据权限显示部门树**
*对于任意* 角色，当选择"自定义数据权限"时，部门树组件应该显示；当选择其他数据范围时，部门树组件应该隐藏
**验证需求: 6.4, 13.1**

**属性 15: 数据权限配置保存后更新**
*对于任意* 数据权限配置，提交成功后，角色列表中该角色的数据范围应该反映最新的配置
**验证需求: 6.8**

**属性 16: 菜单权限显示一致性**
*对于任意* 角色，编辑时显示的已选菜单权限应该与该角色实际拥有的菜单权限一致
**验证需求: 3.3, 12.7**

**属性 17: 部门权限显示一致性**
*对于任意* 角色，编辑数据权限时显示的已选部门应该与该角色实际拥有的部门权限一致
**验证需求: 13.7**

### 树形控件联动属性

**属性 18: 树形控件父子联动（勾选）**
*对于任意* 树形控件（菜单树或部门树）中的父节点，勾选该父节点后，其所有子节点都应该被自动勾选
**验证需求: 12.5, 13.5**

**属性 19: 树形控件父子联动（取消勾选）**
*对于任意* 树形控件（菜单树或部门树）中的父节点，取消勾选该父节点后，其所有子节点都应该被自动取消勾选
**验证需求: 12.6, 13.6**

### 用户分配属性

**属性 20: 已分配用户列表一致性**
*对于任意* 角色，打开用户分配抽屉时显示的用户列表应该与该角色实际分配的用户一致
**验证需求: 7.2**

**属性 21: 添加用户后出现在列表**
*对于任意* 用户，添加到角色后，该用户应该出现在该角色的已分配用户列表中
**验证需求: 7.3**

**属性 22: 移除用户后不在列表**
*对于任意* 已分配的用户，从角色移除后，该用户不应该再出现在该角色的已分配用户列表中
**验证需求: 7.4**

### 导出功能属性

**属性 23: 导出数据符合筛选条件**
*对于任意* 筛选条件，导出的角色数据应该只包含符合该筛选条件的角色
**验证需求: 8.1**

**属性 24: 导出数据包含必需字段**
*对于任意* 导出的角色数据，每条记录都应该包含角色名称、权限字符、显示顺序、数据范围、状态和创建时间字段
**验证需求: 8.3**

### 按钮状态属性

**属性 25: 批量删除按钮状态正确**
*对于任意* 表格选择状态，当没有选中任何角色时，批量删除按钮应该被禁用；当选中一个或多个角色时，批量删除按钮应该被启用
**验证需求: 9.3, 9.4**
