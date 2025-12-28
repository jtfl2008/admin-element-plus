# 设计文档: 用户管理模块

## 概述

本文档描述用户管理模块的技术设计，包括组件架构、数据流、API 设计和实现细节。本项目使用 Element Plus 组件库，并封装了 DialogForm（对话框表单）、ConfigurableForm（可配置表单）、ConfigurableTable（可配置表格）、SelectTable（下拉表格选择器）等基础组件。

## 组件架构

```
src/views/system/user/
├── index.vue                    # 用户管理主页面（使用 ConfigurableForm + ConfigurableTable）
└── composables/
    └── use-user-table.ts        # 表格逻辑 Hook（可选，使用 useTable 工具）

src/components/
├── DialogForm/                  # 对话框表单组件（已有）
│   └── index.vue                # 支持表单、表格、自定义插槽的可配置对话框
├── ConfigurableForm/            # 可配置表单组件（已有）
│   └── index.vue                # 支持动态字段配置的查询表单
├── ConfigurableTable/           # 可配置表格组件（已有）
│   └── index.vue                # 支持工具栏、动态列、分页的表格
├── SelectTable/                 # 下拉表格选择器（已有）
│   └── index.vue                # 类似 el-select 的下拉表格选择
└── StatusSwitch/                # 状态切换组件（待创建）
    └── index.vue                # 封装 el-switch 的状态切换

src/service/api/system/
└── user.ts                      # 用户管理 API

src/utils/
└── useTable.js                  # 表格工具 Hook（已有）
```

## 页面布局设计

### 主页面布局 (index.vue)

采用左右分栏布局，左侧部门树，右侧用户列表：

```
+------------------------------------------------------------------+
|                         用户管理                                   |
+------------------------------------------------------------------+
|  +------------+  +---------------------------------------------+  |
|  |            |  |  ConfigurableForm (查询表单)                 |  |
|  |  部门树     |  |  用户账号 [    ] 用户昵称 [    ] 手机号 [    ] |  |
|  |  (el-tree) |  |  状态 [下拉] [查询] [重置]                    |  |
|  |            |  +---------------------------------------------+  |
|  |  - 总公司   |  |  ConfigurableTable (数据表格)                |  |
|  |    - 研发部 |  |  [新增] [批量删除] [导出] [导入] [刷新]       |  |
|  |    - 市场部 |  +---------------------------------------------+  |
|  |    - 财务部 |  |  □ | 序号 | 账号 | 昵称 | 部门 | 手机 | 状态 | 时间 | 操作 |
|  |            |  |  □ |  1   | admin| 管理员| 研发 | 138 | [开关]| 2024 | [编辑][重置][删除] |
|  |  [搜索]    |  |  □ |  2   | test | 测试  | 测试 | 139 | [开关]| 2024 | [编辑][重置][删除] |
|  |  [刷新]    |  +---------------------------------------------+  |
|  +------------+  |  [分页组件]                                   |  |
|                  +---------------------------------------------+  |
+------------------------------------------------------------------+
```

### 用户操作对话框 (DialogForm)

使用 DialogForm 组件实现新增/编辑用户：

```
+------------------------------------------------------------------+
|  新增用户 / 编辑用户                                    [×]        |
+------------------------------------------------------------------+
|  基础信息                                                          |
|  +-------------------------------------------------------------+  |
|  |  用户昵称 [          ]    部门 [下拉树选择器]                |  |
|  |  手机号码 [          ]    邮箱 [          ]                  |  |
|  |  用户账号 [          ]    密码 [          ] (新增时显示)     |  |
|  |  性别 ○男 ○女 ○未知      状态 ○正常 ○停用                   |  |
|  |  岗位 [多选下拉]          角色 [多选下拉]                     |  |
|  |  备注 [                                                ]     |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|                                    [取消]  [确定]                  |
+------------------------------------------------------------------+
```

## 组件设计

### 1. 查询表单 (ConfigurableForm)

使用项目已有的 ConfigurableForm 组件，通过配置 fields 实现查询表单：

**配置示例:**
```typescript
const queryFields: FormFieldConfig[] = [
  { prop: 'userName', label: '用户账号', component: 'input', span: 6 },
  { prop: 'nickName', label: '用户昵称', component: 'input', span: 6 },
  { prop: 'phonenumber', label: '手机号码', component: 'input', span: 6 },
  { 
    prop: 'status', 
    label: '状态', 
    component: 'select', 
    span: 6,
    options: [
      { label: '正常', value: '0' },
      { label: '停用', value: '1' }
    ]
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
const tableColumns = [
  { prop: 'userName', label: '用户账号', align: 'center' },
  { prop: 'nickName', label: '用户昵称', align: 'center' },
  { prop: 'deptName', label: '部门', align: 'center' },
  { prop: 'phonenumber', label: '手机号码', align: 'center' },
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
        click: ({ row }) => handleEdit(row)
      },
      {
        label: '重置密码',
        type: 'primary',
        icon: Key,
        click: ({ row }) => handleResetPwd(row)
      },
      {
        label: '删除',
        type: 'danger',
        icon: Delete,
        visible: ({ row }) => row.userId !== 1, // 超级管理员不可删除
        click: ({ row }) => handleDelete(row)
      }
    ]
  }
]
```

**工具栏配置:**
```typescript
const toolbars = [
  { label: '新增', type: 'primary', icon: Plus, click: () => handleAdd() },
  { label: '批量删除', type: 'danger', icon: Delete, click: () => handleBatchDelete() },
  { label: '导出', type: 'warning', icon: Download, click: () => handleExport() },
  { label: '导入', type: 'success', icon: Upload, click: () => handleImport() },
  { label: '刷新', icon: Refresh, click: () => refresh() }
]
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
  <!-- 状态列插槽 -->
  <template #status="{ row }">
    <StatusSwitch
      v-model="row.status"
      :disabled="row.userId === 1"
      @change="handleStatusChange(row)"
    />
  </template>
</ConfigurableTable>
```

### 3. 用户操作对话框 (DialogForm)

使用项目已有的 DialogForm 组件，通过配置 sections 实现表单对话框：

**配置示例:**
```typescript
const dialogSections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      { 
        prop: 'nickName', 
        label: '用户昵称', 
        component: 'input', 
        span: 12 
      },
      { 
        prop: 'deptId', 
        label: '部门', 
        component: 'el-tree-select',
        span: 12,
        data: deptTreeData.value, // 部门树数据
        props: { label: 'label', value: 'id' }
      },
      { 
        prop: 'phonenumber', 
        label: '手机号码', 
        component: 'input', 
        span: 12 
      },
      { 
        prop: 'email', 
        label: '邮箱', 
        component: 'input', 
        span: 12 
      },
      { 
        prop: 'userName', 
        label: '用户账号', 
        component: 'input', 
        span: 12,
        visible: () => dialogType.value === 'add', // 新增时显示
        disabled: () => dialogType.value === 'edit' // 编辑时禁用
      },
      { 
        prop: 'password', 
        label: '密码', 
        component: 'input', 
        type: 'password',
        span: 12,
        visible: () => dialogType.value === 'add' // 仅新增时显示
      },
      { 
        prop: 'sex', 
        label: '性别', 
        component: 'radio-group', 
        span: 12,
        options: [
          { label: '男', value: '0' },
          { label: '女', value: '1' },
          { label: '未知', value: '2' }
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
        prop: 'postIds', 
        label: '岗位', 
        component: 'select', 
        span: 12,
        multiple: true,
        options: postOptions.value // 从 API 获取
      },
      { 
        prop: 'roleIds', 
        label: '角色', 
        component: 'select', 
        span: 12,
        multiple: true,
        options: roleOptions.value // 从 API 获取
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
  @confirm="handleDialogConfirm"
  @cancel="handleDialogCancel"
/>
```

### 4. 密码重置对话框 (DialogForm)

同样使用 DialogForm 组件，配置密码重置表单：

```typescript
const passwordSections = [
  {
    type: 'form',
    key: 'password',
    fields: [
      { 
        prop: 'userName', 
        label: '用户账号', 
        component: 'input', 
        span: 24,
        disabled: true // 只读显示
      },
      { 
        prop: 'newPassword', 
        label: '新密码', 
        component: 'input', 
        type: 'password',
        span: 24 
      },
      { 
        prop: 'confirmPassword', 
        label: '确认密码', 
        component: 'input', 
        type: 'password',
        span: 24 
      }
    ]
  }
]
```

### 5. 状态切换组件 (StatusSwitch)

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
  :disabled="row.userId === 1"
  @change="handleStatusChange(row)"
/>
```

### 6. 部门树 (el-tree)

直接使用 Element Plus 的 el-tree 组件：

```vue
<el-tree
  :data="deptTreeData"
  :props="{ label: 'label', children: 'children' }"
  node-key="id"
  :filter-node-method="filterNode"
  @node-click="handleNodeClick"
>
  <template #default="{ node, data }">
    <span>{{ node.label }}</span>
  </template>
</el-tree>
```

## 数据流设计

### 用户列表数据流

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

### 用户操作数据流

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
  queryFormRef,    // 查询表单引用
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

### 接口定义 (src/service/api/system/user.ts)

```typescript
// 获取用户列表
export function fetchGetUserList(params: UserSearchParams) {
  return request.get<PageResult<User>>('/system/user/list', { params })
}

// 获取部门树
export function fetchGetDeptTree() {
  return request.get<DeptTree[]>('/system/user/deptTree')
}

// 新增用户
export function fetchCreateUser(data: UserOperateParams) {
  return request.post('/system/user', data)
}

// 更新用户
export function fetchUpdateUser(data: UserOperateParams) {
  return request.put('/system/user', data)
}

// 删除用户
export function fetchBatchDeleteUser(userIds: number[]) {
  return request.delete(`/system/user/${userIds.join(',')}`)
}

// 获取用户详情
export function fetchGetUserInfo(userId: number) {
  return request.get<UserInfo>(`/system/user/${userId}`)
}

// 重置密码
export function fetchResetUserPassword(data: { userId: number; password: string }) {
  return request.put('/system/user/resetPwd', data)
}

// 更新用户状态
export function fetchUpdateUserStatus(data: { userId: number; status: string }) {
  return request.put('/system/user/changeStatus', data)
}

// 获取岗位列表
export function fetchGetPostList() {
  return request.get<Post[]>('/system/post/optionSelect')
}

// 获取角色列表
export function fetchGetRoleList() {
  return request.get<Role[]>('/system/role/optionSelect')
}
```

## 类型定义

### 用户相关类型 (src/typings/api/system.d.ts)

```typescript
declare namespace Api.System {
  // 用户搜索参数
  interface UserSearchParams extends PageParams {
    userName?: string
    nickName?: string
    phonenumber?: string
    status?: string
    deptId?: number
  }

  // 用户列表项
  interface User {
    userId: number
    userName: string
    nickName: string
    deptId: number
    deptName?: string
    phonenumber?: string
    email?: string
    sex: string
    avatar?: string
    status: string
    createTime?: string
  }

  // 用户操作参数
  interface UserOperateParams {
    userId?: number
    userName: string
    nickName: string
    password?: string
    deptId?: number
    phonenumber?: string
    email?: string
    sex?: string
    postIds?: number[]
    roleIds?: number[]
    status: string
    remark?: string
  }

  // 部门树节点
  interface DeptTree {
    id: number
    label: string
    children?: DeptTree[]
  }
}
```

## 权限设计

### 权限码定义

| 权限码 | 描述 | 控制元素 |
|--------|------|----------|
| system:user:list | 用户列表 | 页面访问 |
| system:user:add | 新增用户 | 新增按钮 |
| system:user:edit | 编辑用户 | 编辑按钮 |
| system:user:remove | 删除用户 | 删除按钮 |
| system:user:resetPwd | 重置密码 | 重置密码按钮 |
| system:user:export | 导出用户 | 导出按钮 |
| system:user:import | 导入用户 | 导入按钮 |

### 权限使用示例

```vue
<template>
  <el-button v-if="hasAuth('system:user:add')" @click="handleAdd">
    新增
  </el-button>
</template>

<script setup>
import { useAuth } from '@/hooks/useAuth'
const { hasAuth } = useAuth()
</script>
```

## 字典配置

| 字典类型 | 字典标签 | 字典值 |
|----------|----------|--------|
| sys_user_sex | 男 | 0 |
| sys_user_sex | 女 | 1 |
| sys_user_sex | 未知 | 2 |
| sys_normal_disable | 正常 | 0 |
| sys_normal_disable | 停用 | 1 |

## 实现注意事项

1. **超级管理员保护**: userId=1 的用户不可删除、不可禁用
2. **密码安全**: 密码需加密传输，前端使用 RSA 加密
3. **表单验证**: 使用 Element Plus 的表单验证规则
4. **加载状态**: 所有异步操作需显示 loading 状态
5. **错误处理**: API 错误需友好提示用户
6. **数据刷新**: 操作成功后自动刷新列表数据
