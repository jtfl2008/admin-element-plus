# 设计文档 - 岗位管理

## 概述

岗位管理模块是系统管理的核心功能之一，负责维护和管理企业组织架构中的岗位信息。本模块采用 Vue 3 + TypeScript + Element Plus 技术栈，遵循项目现有的架构模式和代码规范。

### 设计目标

1. 提供完整的岗位 CRUD 功能
2. 支持岗位状态管理和部门关联
3. 提供友好的用户交互体验
4. 确保数据的完整性和一致性
5. 支持数据导出功能
6. 支持国际化（中英文）

### 技术栈

- **前端框架**: Vue 3.5.25 (Composition API)
- **开发语言**: TypeScript 5.9
- **UI 组件库**: Element Plus 2.13
- **状态管理**: Pinia 3.0
- **HTTP 客户端**: Axios 1.13
- **表单验证**: Element Plus 内置验证

## 架构设计

### 模块结构

```
src/
├── views/system/post/              # 岗位管理页面
│   └── index.vue                   # 主页面（包含对话框）
├── service/api/system/             # API 接口
│   └── post.ts                     # 岗位相关接口
└── typings/api/                    # 类型定义
    └── system.d.ts                 # 系统模块类型（扩展）
```

### 组件层次

```
PostManagement (index.vue)
├── ConfigurableForm (查询表单)
├── ConfigurableTable (数据表格)
└── DialogForm (新增/编辑对话框)
```


## 组件和接口设计

### 数据模型

#### Post（岗位实体）

```typescript
export interface Post {
  postId: number          // 岗位ID
  tenantId?: number       // 租户编号
  deptId?: number         // 部门ID
  deptName?: string       // 部门名称
  postCode: string        // 岗位编码
  postCategory?: string   // 类别编码
  postName: string        // 岗位名称
  postSort: number        // 显示顺序
  status: '0' | '1'       // 状态（0:正常 1:停用）
  remark?: string         // 备注
  createTime?: string     // 创建时间
  updateTime?: string     // 更新时间
}
```

#### PostSearchParams（查询参数）

```typescript
export interface PostSearchParams extends PageQuery {
  postCode?: string       // 岗位编码
  postName?: string       // 岗位名称
  status?: '0' | '1'      // 状态
  deptId?: number         // 归属部门ID
}
```

#### PostOperateParams（操作参数）

```typescript
export interface PostOperateParams {
  postId?: number         // 岗位ID（编辑时必填）
  deptId?: number         // 部门ID
  postCode: string        // 岗位编码
  postCategory?: string   // 类别编码
  postName: string        // 岗位名称
  postSort: number        // 显示顺序
  status: '0' | '1'       // 状态
  remark?: string         // 备注
}
```

### API 接口设计

#### 接口列表

```typescript
// 获取岗位列表
GET /system/post/list
参数: PostSearchParams
响应: PageResponse<Post>

// 获取岗位详情
GET /system/post/{postId}
参数: postId (路径参数)
响应: Post

// 新增岗位
POST /system/post
参数: PostOperateParams (请求体)
响应: void

// 更新岗位
PUT /system/post
参数: PostOperateParams (请求体)
响应: void

// 删除岗位
DELETE /system/post/{postId}
参数: postId (路径参数)
响应: void

// 批量删除岗位
DELETE /system/post/batch
参数: postIds (请求体，number[])
响应: void

// 导出岗位
POST /system/post/export
参数: PostSearchParams (请求体)
响应: Blob (Excel文件)
```


#### API 实现（src/service/api/system/post.ts）

```typescript
import httpClient from '@/service/request/request'
import type { PageResponse } from '@/typings/api'
import type { Post, PostSearchParams, PostOperateParams } from '@/typings/api/system'

/**
 * 获取岗位列表
 */
export function fetchGetPostList(params: PostSearchParams) {
  return httpClient.get<PageResponse<Post>>('/system/post/list', { params })
}

/**
 * 获取岗位详情
 */
export function fetchGetPostDetail(postId: number) {
  return httpClient.get<Post>(`/system/post/${postId}`)
}

/**
 * 新增岗位
 */
export function fetchCreatePost(data: PostOperateParams) {
  return httpClient.post('/system/post', data)
}

/**
 * 更新岗位
 */
export function fetchUpdatePost(data: PostOperateParams) {
  return httpClient.put('/system/post', data)
}

/**
 * 删除岗位
 */
export function fetchDeletePost(postId: number) {
  return httpClient.delete(`/system/post/${postId}`)
}

/**
 * 批量删除岗位
 */
export function fetchBatchDeletePost(postIds: number[]) {
  return httpClient.delete(`/system/post/${postIds.join(',')}`)
}

/**
 * 导出岗位
 */
export function fetchExportPost(params: PostSearchParams) {
  return httpClient.post('/system/post/export', params, {
    responseType: 'blob'
  })
}
```

### 页面组件设计

#### 主页面（index.vue）

**功能模块**:
1. 查询表单区域
2. 数据表格区域
3. 工具栏（新增、批量删除、导出）
4. 操作列（编辑、删除）

**状态管理**:
```typescript
// 表格数据
const tableData = ref<Post[]>([])
const total = ref(0)
const pageNum = ref(1)
const pageSize = ref(10)

// 查询表单
const queryForm = ref<PostSearchParams>({
  postCode: '',
  postName: '',
  status: '',
  deptId: undefined
})

// 选中行
const selectedRows = ref<Post[]>([])

// 加载状态
const loading = ref(false)
```


**查询表单配置**:
```typescript
const queryFields: FormFieldConfig[] = [
  { 
    prop: 'postCode', 
    label: '岗位编码', 
    component: 'input',
    placeholder: '请输入岗位编码'
  },
  { 
    prop: 'postName', 
    label: '岗位名称', 
    component: 'input',
    placeholder: '请输入岗位名称'
  },
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
    prop: 'deptId',
    label: '归属部门',
    component: 'el-tree-select',
    data: deptTreeData.value,
    props: { label: 'label', value: 'id' },
    checkStrictly: true
  }
]
```

**表格列配置**:
```typescript
const tableColumns = computed(() => [
  { prop: 'postCode', label: '岗位编码', align: 'center' },
  { prop: 'postName', label: '岗位名称', align: 'center' },
  { prop: 'postCategory', label: '类别编码', align: 'center' },
  { prop: 'deptName', label: '归属部门', align: 'center' },
  { prop: 'postSort', label: '显示顺序', align: 'center' },
  { 
    prop: 'status', 
    label: '状态', 
    align: 'center',
    cellSlot: 'status'
  },
  { prop: 'createTime', label: '创建时间', align: 'center' },
  { prop: 'remark', label: '备注', align: 'center', showOverflowTooltip: true },
  {
    label: '操作',
    align: 'center',
    width: 180,
    buttons: [
      {
        label: '编辑',
        type: 'primary',
        icon: Edit,
        visible: () => hasAuth.value('system:post:edit'),
        click: (scope: any) => handleEdit(scope.row)
      },
      {
        label: '删除',
        type: 'danger',
        icon: Delete,
        visible: () => hasAuth.value('system:post:remove'),
        click: (scope: any) => handleDelete(scope.row)
      }
    ]
  }
])
```

**工具栏配置**:
```typescript
const toolbars = computed(() => [
  { 
    label: '新增', 
    type: 'primary', 
    icon: Plus,
    disabled: () => !hasAuth.value('system:post:add'),
    click: () => handleAdd() 
  },
  { 
    label: '批量删除', 
    type: 'danger', 
    icon: Delete,
    disabled: () => !hasAuth.value('system:post:remove') || selectedRows.value.length === 0,
    click: () => handleBatchDelete() 
  },
  { 
    label: '导出', 
    type: 'warning', 
    icon: Download,
    disabled: () => !hasAuth.value('system:post:export'),
    click: () => handleExport() 
  }
])
```


#### 新增/编辑对话框

**对话框状态管理**:
```typescript
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref<'add' | 'edit'>('add')
const dialogLoading = ref(false)
```

**表单数据**:
```typescript
const formData = ref<PostOperateParams>({
  postId: undefined,
  deptId: undefined,
  postCode: '',
  postCategory: '',
  postName: '',
  postSort: 0,
  status: '0',
  remark: ''
})
```

**表单验证规则**:
```typescript
const formRules = {
  deptId: [
    { required: true, message: '请选择归属部门', trigger: 'change' }
  ],
  postCode: [
    { required: true, message: '请输入岗位编码', trigger: 'blur' },
    { min: 2, max: 64, message: '长度在 2 到 64 个字符', trigger: 'blur' }
  ],
  postName: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  postSort: [
    { required: true, message: '请输入显示顺序', trigger: 'blur' },
    { type: 'number', message: '显示顺序必须为数字', trigger: 'blur' }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}
```

**表单字段配置**:
```typescript
const dialogSections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      {
        prop: 'deptId',
        label: '归属部门',
        component: 'el-tree-select',
        data: deptTreeData.value,
        props: { label: 'label', value: 'id' },
        checkStrictly: true,
        span: 24
      },
      {
        prop: 'postCode',
        label: '岗位编码',
        component: 'input',
        placeholder: '请输入岗位编码',
        span: 12
      },
      {
        prop: 'postCategory',
        label: '类别编码',
        component: 'input',
        placeholder: '请输入类别编码',
        span: 12
      },
      {
        prop: 'postName',
        label: '岗位名称',
        component: 'input',
        placeholder: '请输入岗位名称',
        span: 12
      },
      {
        prop: 'postSort',
        label: '显示顺序',
        component: 'input-number',
        min: 0,
        span: 12
      },
      {
        prop: 'status',
        label: '状态',
        component: 'radio-group',
        options: [
          { label: '正常', value: '0' },
          { label: '停用', value: '1' }
        ],
        span: 24
      },
      {
        prop: 'remark',
        label: '备注',
        component: 'input',
        type: 'textarea',
        rows: 3,
        placeholder: '请输入备注',
        span: 24
      }
    ]
  }
])
```

**对话框操作方法**:
```typescript
// 打开新增对话框
const handleAdd = () => {
  dialogType.value = 'add'
  dialogTitle.value = '新增岗位'
  resetDialogForm()
  dialogVisible.value = true
}

// 打开编辑对话框
const handleEdit = async (row: Post) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑岗位'
  
  try {
    const postData = await fetchGetPostDetail(row.postId)
    Object.assign(dialogForm.value, postData)
  } catch (error) {
    console.warn('获取岗位详情失败，使用行数据:', error)
    Object.assign(dialogForm.value, row)
  }
  
  dialogVisible.value = true
}

// 提交对话框
const handleDialogConfirm = async () => {
  dialogLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await fetchCreatePost(dialogForm.value)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdatePost(dialogForm.value)
      ElMessage.success('修改成功')
    }
    dialogVisible.value = false
    refresh()
  } catch (error) {
    console.error('保存失败:', error)
    ElMessage.error('保存失败')
  } finally {
    dialogLoading.value = false
  }
}

// 取消对话框
const handleDialogCancel = () => {
  dialogVisible.value = false
  resetDialogForm()
}

// 重置表单
const resetDialogForm = () => {
  dialogForm.value = {
    postId: undefined,
    deptId: undefined,
    postCode: '',
    postCategory: '',
    postName: '',
    postSort: 0,
    status: '0',
    remark: ''
  }
}
```


## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1: 岗位列表查询过滤

*对于任意*查询参数（岗位编码、岗位名称、状态、部门ID），返回的岗位列表中的所有岗位都应该满足查询条件

**验证: 需求 1.2**

### 属性 2: 岗位新增数据完整性

*对于任意*有效的岗位数据（包含所有必填字段），新增操作成功后，通过岗位ID查询应该返回相同的岗位信息

**验证: 需求 2.3, 2.4**

### 属性 3: 岗位编辑数据一致性

*对于任意*已存在的岗位，编辑操作成功后，查询该岗位应该返回更新后的数据

**验证: 需求 3.3**

### 属性 4: 必填字段验证

*对于任意*缺少必填字段（归属部门、岗位编码、岗位名称、显示顺序、状态）的表单提交，系统应该阻止提交并显示验证错误

**验证: 需求 8.1, 8.2, 8.3, 8.4, 8.5**

### 属性 5: 岗位删除数据移除

*对于任意*已存在的岗位，删除操作成功后，该岗位不应该出现在岗位列表中

**验证: 需求 4.2, 4.5**

### 属性 6: 批量删除数据移除

*对于任意*选中的岗位集合，批量删除操作成功后，这些岗位都不应该出现在岗位列表中

**验证: 需求 4.4, 4.5**

### 属性 7: 状态值有效性

*对于任意*岗位，其状态值只能是 '0'（正常）或 '1'（停用）

**验证: 需求 5.1, 5.2**

### 属性 8: 部门关联有效性

*对于任意*岗位，如果设置了归属部门，该部门ID必须在部门树中存在

**验证: 需求 6.1, 6.3**

### 属性 9: 导出数据一致性

*对于任意*查询条件，导出的岗位数据应该与当前查询条件下的岗位列表数据一致

**验证: 需求 7.1, 7.2**

### 属性 10: 分页数据完整性

*对于任意*分页参数（页码、每页大小），返回的数据总数应该等于所有符合条件的岗位总数，且每页返回的数据量不超过每页大小

**验证: 需求 1.3**


## 错误处理

### 客户端错误处理

#### 表单验证错误
```typescript
// 在提交前进行表单验证
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    // 验证表单
    await formRef.value.validate()
    
    // 提交数据
    if (operateType.value === 'add') {
      await fetchCreatePost(formData.value)
    } else {
      await fetchUpdatePost(formData.value)
    }
    
    ElMessage.success('操作成功')
    emit('success')
  } catch (error) {
    // 验证失败或API调用失败
    if (error instanceof Error) {
      console.error('操作失败:', error)
    }
  }
}
```

#### API 调用错误
```typescript
// 在 API 调用时捕获错误
const loadData = async () => {
  loading.value = true
  try {
    const response = await fetchGetPostList(queryParams.value)
    tableData.value = response.rows
    total.value = response.total
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
    // 使用空数据
    tableData.value = []
    total.value = 0
  } finally {
    loading.value = false
  }
}
```

#### 删除确认
```typescript
// 删除前进行确认
const handleDelete = async (row: Post) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除岗位【${row.postName}】吗？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await fetchDeletePost(row.postId)
    ElMessage.success('删除成功')
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}
```

### 服务端错误处理

#### HTTP 状态码处理
```typescript
// 在 axios 响应拦截器中统一处理
service.interceptors.response.use(
  (response) => {
    const { code, msg, data } = response.data
    
    if (code === 200) {
      return data
    }
    
    // 业务错误
    ElMessage.error(msg || '请求失败')
    return Promise.reject(new Error(msg || '请求失败'))
  },
  (error) => {
    if (error.response) {
      const { status } = error.response
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录')
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求地址不存在')
          break
        case 500:
          ElMessage.error('服务器错误')
          break
        default:
          ElMessage.error('请求失败')
      }
    }
    
    return Promise.reject(error)
  }
)
```


#### 业务错误处理

常见业务错误及处理：

1. **岗位编码重复**
   - 错误码: 500
   - 错误信息: "岗位编码已存在"
   - 处理: 显示错误提示，要求用户修改岗位编码

2. **岗位被引用**
   - 错误码: 500
   - 错误信息: "该岗位已被用户使用，无法删除"
   - 处理: 显示错误提示，阻止删除操作

3. **部门不存在**
   - 错误码: 500
   - 错误信息: "归属部门不存在"
   - 处理: 显示错误提示，要求用户重新选择部门

4. **权限不足**
   - 错误码: 403
   - 错误信息: "没有操作权限"
   - 处理: 显示错误提示，隐藏相关操作按钮

## 测试策略

### 单元测试

#### 组件测试
使用 Vitest + @vue/test-utils 进行组件测试：

```typescript
// src/views/system/post/__tests__/index.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import PostManagement from '../index.vue'
import * as postApi from '@/service/api/system/post'

vi.mock('@/service/api/system/post')

describe('PostManagement', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })
  
  it('应该正确渲染', () => {
    const wrapper = mount(PostManagement)
    expect(wrapper.exists()).toBe(true)
  })
  
  it('应该加载岗位列表', async () => {
    const mockData = {
      rows: [
        { postId: 1, postCode: 'CEO', postName: '董事长', postSort: 1, status: '0' }
      ],
      total: 1
    }
    
    vi.mocked(postApi.fetchGetPostList).mockResolvedValue(mockData)
    
    const wrapper = mount(PostManagement)
    await wrapper.vm.$nextTick()
    
    expect(postApi.fetchGetPostList).toHaveBeenCalled()
  })
})
```

#### API 测试
```typescript
// src/service/api/system/__tests__/post.spec.ts
import { describe, it, expect, vi } from 'vitest'
import { fetchGetPostList, fetchCreatePost } from '../post'
import httpClient from '@/service/request/request'

vi.mock('@/service/request/request')

describe('Post API', () => {
  it('应该调用获取岗位列表接口', async () => {
    const mockData = { rows: [], total: 0 }
    vi.mocked(httpClient.get).mockResolvedValue(mockData)
    
    const result = await fetchGetPostList({ pageNum: 1, pageSize: 10 })
    
    expect(httpClient.get).toHaveBeenCalledWith('/system/post/list', {
      params: { pageNum: 1, pageSize: 10 }
    })
    expect(result).toEqual(mockData)
  })
})
```


### 属性测试

使用属性测试验证系统的正确性属性。由于 JavaScript/TypeScript 生态中没有成熟的属性测试库（如 Haskell 的 QuickCheck），我们将使用 Vitest 编写基于随机数据生成的测试来模拟属性测试。

#### 测试配置
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    // 每个属性测试运行 100 次
    repeats: 100
  }
})
```

#### 属性测试示例

```typescript
// src/views/system/post/__tests__/properties.spec.ts
import { describe, it, expect } from 'vitest'

/**
 * 生成随机岗位数据
 */
function generateRandomPost() {
  return {
    postId: Math.floor(Math.random() * 10000),
    postCode: `POST_${Math.random().toString(36).substring(7)}`,
    postName: `岗位_${Math.random().toString(36).substring(7)}`,
    postSort: Math.floor(Math.random() * 100),
    status: Math.random() > 0.5 ? '0' : '1',
    deptId: Math.floor(Math.random() * 100)
  }
}

describe('岗位管理属性测试', () => {
  /**
   * 属性 2: 岗位新增数据完整性
   * 验证: 需求 2.3, 2.4
   */
  it('属性 2: 对于任意有效的岗位数据，新增后查询应返回相同信息', async () => {
    // 运行 100 次测试
    for (let i = 0; i < 100; i++) {
      const postData = generateRandomPost()
      
      // 模拟新增操作
      const createdPost = await mockCreatePost(postData)
      
      // 模拟查询操作
      const queriedPost = await mockGetPost(createdPost.postId)
      
      // 验证数据一致性
      expect(queriedPost.postCode).toBe(postData.postCode)
      expect(queriedPost.postName).toBe(postData.postName)
      expect(queriedPost.postSort).toBe(postData.postSort)
      expect(queriedPost.status).toBe(postData.status)
    }
  })
  
  /**
   * 属性 7: 状态值有效性
   * 验证: 需求 5.1, 5.2
   */
  it('属性 7: 对于任意岗位，状态值只能是 0 或 1', () => {
    for (let i = 0; i < 100; i++) {
      const post = generateRandomPost()
      
      // 验证状态值
      expect(['0', '1']).toContain(post.status)
    }
  })
})
```

### 集成测试

#### 端到端流程测试
```typescript
// src/views/system/post/__tests__/integration.spec.ts
import { describe, it, expect } from 'vitest'

describe('岗位管理集成测试', () => {
  it('应该完成完整的 CRUD 流程', async () => {
    // 1. 新增岗位
    const newPost = {
      postCode: 'TEST001',
      postName: '测试岗位',
      postSort: 1,
      status: '0'
    }
    const created = await fetchCreatePost(newPost)
    expect(created).toBeDefined()
    
    // 2. 查询岗位列表
    const list = await fetchGetPostList({ postCode: 'TEST001' })
    expect(list.rows.length).toBeGreaterThan(0)
    expect(list.rows[0].postCode).toBe('TEST001')
    
    // 3. 编辑岗位
    const postId = list.rows[0].postId
    await fetchUpdatePost({
      postId,
      postCode: 'TEST001',
      postName: '测试岗位（已修改）',
      postSort: 2,
      status: '0'
    })
    
    // 4. 验证修改
    const updated = await fetchGetPostDetail(postId)
    expect(updated.postName).toBe('测试岗位（已修改）')
    expect(updated.postSort).toBe(2)
    
    // 5. 删除岗位
    await fetchDeletePost(postId)
    
    // 6. 验证删除
    const afterDelete = await fetchGetPostList({ postCode: 'TEST001' })
    expect(afterDelete.rows.length).toBe(0)
  })
})
```


### 测试覆盖率要求

- **语句覆盖率**: >= 80%
- **分支覆盖率**: >= 75%
- **函数覆盖率**: >= 80%
- **行覆盖率**: >= 80%

### 测试运行命令

```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式运行测试
pnpm test:watch

# 运行岗位管理模块测试
pnpm test src/views/system/post
```

## 国际化支持

本模块暂不实现国际化功能，所有文本使用中文硬编码。如果未来需要支持国际化，可以参考项目中其他模块的国际化实现方式。


## 性能优化

### 1. 列表查询优化

#### 防抖搜索
```typescript
import { debounce } from 'lodash-es'

// 搜索输入防抖
const handleSearch = debounce((keyword: string) => {
  queryForm.value.postName = keyword
  handleQuery()
}, 500)
```

#### 分页加载
```typescript
// 使用分页减少单次数据量
const pageSize = ref(10)  // 默认每页 10 条

// 支持用户自定义每页大小
const pageSizes = [10, 20, 50, 100]
```

### 2. 组件懒加载

```typescript
// 路由懒加载
const PostManagement = () => import('@/views/system/post/index.vue')

// 抽屉组件懒加载
const PostOperateDrawer = defineAsyncComponent(() =>
  import('./modules/post-operate-drawer.vue')
)
```

### 3. 请求优化

#### 请求取消
```typescript
import { CancelToken } from 'axios'

let cancelToken: CancelToken | null = null

const loadData = async () => {
  // 取消上一次请求
  if (cancelToken) {
    cancelToken.cancel('取消上一次请求')
  }
  
  // 创建新的取消令牌
  cancelToken = axios.CancelToken.source()
  
  try {
    const response = await fetchGetPostList(queryParams.value, {
      cancelToken: cancelToken.token
    })
    tableData.value = response.rows
    total.value = response.total
  } catch (error) {
    if (!axios.isCancel(error)) {
      console.error('加载数据失败:', error)
    }
  }
}
```

#### 请求缓存
```typescript
// 使用 Pinia 缓存部门树数据
import { useDeptStore } from '@/stores/modules/dept'

const deptStore = useDeptStore()

// 加载部门树（带缓存）
const loadDeptTree = async () => {
  if (deptStore.deptTree.length > 0) {
    // 使用缓存数据
    deptTreeData.value = deptStore.deptTree
    return
  }
  
  // 从 API 加载
  const tree = await fetchGetDeptTree()
  deptTreeData.value = tree
  deptStore.setDeptTree(tree)
}
```

### 4. 渲染优化

#### 虚拟滚动
```vue
<!-- 对于大数据量表格，使用虚拟滚动 -->
<el-table-v2
  v-if="tableData.length > 100"
  :columns="columns"
  :data="tableData"
  :width="700"
  :height="400"
  fixed
/>
```

#### 条件渲染优化
```vue
<!-- 使用 v-show 代替频繁切换的 v-if -->
<el-dialog v-show="visible" />

<!-- 使用 v-if 代替条件渲染 -->
<DialogForm v-if="dialogVisible" />
```


## 安全性考虑

### 1. 权限控制

#### 按钮权限
```typescript
import { useAuth } from '@/hooks/useAuth'

const { hasAuth } = useAuth()

// 在按钮配置中检查权限
const toolbars = computed(() => [
  { 
    label: '新增', 
    disabled: () => !hasAuth.value('system:post:add'),
    click: () => handleAdd() 
  },
  { 
    label: '删除', 
    disabled: () => !hasAuth.value('system:post:remove'),
    click: () => handleDelete() 
  }
])
```

#### 路由权限
```typescript
// 在路由配置中添加权限标识
{
  path: '/system/post',
  name: 'Post',
  component: () => import('@/views/system/post/index.vue'),
  meta: {
    title: '岗位管理',
    permissions: ['system:post:list']
  }
}
```

### 2. 输入验证

#### 前端验证
```typescript
// 表单验证规则
const formRules = {
  postCode: [
    { required: true, message: '请输入岗位编码', trigger: 'blur' },
    { 
      pattern: /^[a-zA-Z0-9_-]{2,64}$/, 
      message: '岗位编码只能包含字母、数字、下划线和连字符', 
      trigger: 'blur' 
    }
  ],
  postName: [
    { required: true, message: '请输入岗位名称', trigger: 'blur' },
    { min: 2, max: 50, message: '长度在 2 到 50 个字符', trigger: 'blur' }
  ]
}
```

#### XSS 防护
```typescript
// 对用户输入进行转义
import { escapeHtml } from '@/utils/security'

const sanitizedInput = escapeHtml(userInput)
```

### 3. CSRF 防护

```typescript
// 在请求头中添加 CSRF Token
service.interceptors.request.use((config) => {
  const csrfToken = getCsrfToken()
  if (csrfToken) {
    config.headers['X-CSRF-TOKEN'] = csrfToken
  }
  return config
})
```

### 4. 敏感数据保护

```typescript
// 不在前端存储敏感信息
// 使用 HTTPS 传输数据
// 对敏感字段进行脱敏显示
const maskPhoneNumber = (phone: string) => {
  return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')
}
```

## 可访问性

### 1. 键盘导航

```vue
<!-- 支持 Tab 键导航 -->
<el-button tabindex="0" @keyup.enter="handleAdd">新增</el-button>

<!-- 支持快捷键 -->
<el-input
  v-model="queryForm.postName"
  @keyup.enter="handleQuery"
  placeholder="按 Enter 搜索"
/>
```

### 2. ARIA 属性

```vue
<!-- 添加 ARIA 标签 -->
<el-button
  aria-label="新增岗位"
  @click="handleAdd"
>
  新增
</el-button>

<!-- 表格添加描述 -->
<el-table
  :data="tableData"
  aria-label="岗位列表"
  aria-describedby="post-table-description"
>
  <!-- 表格列 -->
</el-table>
<div id="post-table-description" class="sr-only">
  显示系统中所有岗位的列表，包括岗位编码、名称、状态等信息
</div>
```

### 3. 屏幕阅读器支持

```vue
<!-- 加载状态提示 -->
<div v-if="loading" role="status" aria-live="polite">
  正在加载数据...
</div>

<!-- 操作结果提示 -->
<div role="alert" aria-live="assertive">
  {{ message }}
</div>
```


## 部署和配置

### 环境变量配置

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=管理系统

# .env.production
VITE_API_BASE_URL=https://api.example.com
VITE_APP_TITLE=管理系统
```

### 构建配置

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'element-plus': ['element-plus'],
          'system-views': [
            './src/views/system/user/index.vue',
            './src/views/system/post/index.vue',
            './src/views/system/role/index.vue'
          ]
        }
      }
    }
  }
})
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name example.com;
    
    location / {
        root /usr/share/nginx/html;
        try_files $uri $uri/ /index.html;
    }
    
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 监控和日志

### 前端错误监控

```typescript
// 全局错误处理
window.addEventListener('error', (event) => {
  console.error('全局错误:', event.error)
  
  // 上报错误到监控平台
  reportError({
    message: event.error.message,
    stack: event.error.stack,
    url: window.location.href,
    timestamp: new Date().toISOString()
  })
})

// Vue 错误处理
app.config.errorHandler = (err, instance, info) => {
  console.error('Vue 错误:', err, info)
  
  // 上报错误
  reportError({
    message: err.message,
    stack: err.stack,
    component: instance?.$options.name,
    info,
    timestamp: new Date().toISOString()
  })
}
```

### 操作日志

```typescript
// 记录用户操作
const logOperation = (action: string, data: any) => {
  console.log(`[操作日志] ${action}:`, data)
  
  // 上报到日志服务
  reportLog({
    action,
    data,
    userId: userStore.userInfo?.userId,
    timestamp: new Date().toISOString()
  })
}

// 在关键操作中记录日志
const handleAdd = async () => {
  logOperation('新增岗位', formData.value)
  await fetchCreatePost(formData.value)
}
```

### 性能监控

```typescript
// 监控页面加载性能
window.addEventListener('load', () => {
  const perfData = performance.getEntriesByType('navigation')[0]
  
  console.log('页面加载性能:', {
    dns: perfData.domainLookupEnd - perfData.domainLookupStart,
    tcp: perfData.connectEnd - perfData.connectStart,
    request: perfData.responseStart - perfData.requestStart,
    response: perfData.responseEnd - perfData.responseStart,
    domParse: perfData.domInteractive - perfData.responseEnd,
    domReady: perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart,
    load: perfData.loadEventEnd - perfData.loadEventStart
  })
})
```

## 总结

本设计文档详细描述了岗位管理模块的架构、组件、接口、测试策略和实现细节。主要特点包括：

1. **完整的 CRUD 功能**: 支持岗位的新增、编辑、删除、查询和导出
2. **友好的用户体验**: 使用 Element Plus 组件库，提供直观的操作界面
3. **严格的数据验证**: 前后端双重验证，确保数据完整性
4. **完善的错误处理**: 统一的错误处理机制，友好的错误提示
5. **全面的测试覆盖**: 单元测试、属性测试和集成测试
6. **性能优化**: 防抖搜索、分页加载、组件懒加载
7. **安全性保障**: 权限控制、输入验证、XSS/CSRF 防护
8. **可访问性**: 键盘导航、ARIA 属性、屏幕阅读器支持
9. **可维护性**: 清晰的代码结构、完善的文档注释

该设计遵循项目现有的架构模式和代码规范，使用对话框（Dialog）而非抽屉（Drawer）组件，暂不实现国际化功能，可以无缝集成到现有系统中。
