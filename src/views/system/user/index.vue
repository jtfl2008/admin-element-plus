<template>
  <div class="page-container">
    <el-container>
      <!-- 左侧部门树 -->
      <el-aside width="260px" class="page-aside">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>部门列表</span>
              <el-button
                type="primary"
                :icon="Refresh"
                circle
                size="small"
                @click="loadDeptTree"
              />
            </div>
          </template>
          
          <!-- 部门树搜索 -->
          <el-input
            v-model="deptFilterText"
            placeholder="输入部门名称搜索"
            :prefix-icon="Search"
            clearable
            style="margin-bottom: 12px"
          />
          
          <!-- 部门树 -->
          <el-tree
            ref="deptTreeRef"
            :data="deptTreeData"
            :props="{ label: 'label', children: 'children' }"
            node-key="id"
            :filter-node-method="filterDeptNode"
            :highlight-current="true"
            :expand-on-click-node="false"
            default-expand-all
            @node-click="handleDeptNodeClick"
          >
            <template #default="{ node }">
              <span class="custom-tree-node">
                <el-icon><OfficeBuilding /></el-icon>
                <span>{{ node.label }}</span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-aside>

      <!-- 右侧用户列表 -->
      <el-main class="page-main">
        <!-- 查询表单区域 -->
        <el-card shadow="hover" class="query-card">
          <ConfigurableForm
            ref="queryFormRef"
            v-model="queryForm"
            :fields="queryFields"
            query
            label-width="80px"
            @on-query="handleQuery"
            @on-reset="handleReset"
          />
        </el-card>

        <!-- 数据表格区域 -->
        <el-card shadow="hover" class="table-card">
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
            <!-- 状态列自定义插槽 -->
            <template #status="{ row }">
              <el-switch
                v-model="row.status"
                active-value="0"
                inactive-value="1"
                :disabled="row.userId === 1"
                @change="handleStatusChange(row)"
                @before-change="() => handleBeforeStatusChange(row)"
              />
            </template>
          </ConfigurableTable>
        </el-card>
      </el-main>
    </el-container>

    <!-- 新增/编辑用户对话框 -->
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

    <!-- 重置密码对话框 -->
    <DialogForm
      v-model="resetPwdVisible"
      v-model:formData="resetPwdForm"
      title="重置密码"
      :sections="resetPwdSections"
      :rules="resetPwdRules"
      :confirm-loading="resetPwdLoading"
      width="500px"
      @confirm="handleResetPwdConfirm"
      @cancel="handleResetPwdCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Delete, 
  Edit, 
  Key, 
  Download, 
  Upload, 
  Refresh,
  Search,
  OfficeBuilding
} from '@element-plus/icons-vue'
// @ts-ignore
import ConfigurableForm from '@/components/ConfigurableForm/index.vue'
// @ts-ignore
import ConfigurableTable from '@/components/ConfigurableTable/index.vue'
// @ts-ignore
import DialogForm from '@/components/DialogForm/index.vue'
import { useAuth } from '@/hooks/useAuth'
// @ts-ignore
import useTable from '@/utils/useTable'
import {
  fetchGetUserList,
  fetchGetDeptTree,
  fetchBatchDeleteUser,
  fetchUpdateUserStatus,
  fetchCreateUser,
  fetchUpdateUser,
  fetchGetUserInfo,
  fetchGetPostList,
  fetchGetRoleList,
  fetchResetUserPassword,
  fetchExportUser,
  fetchImportUser
} from '@/service/api/system/user'
import type { FormFieldConfig } from '@/components/ConfigurableForm/types'
import type { User, DeptTree, Post, Role, UserOperateParams, ResetPasswordParams, UserSearchParams } from '@/typings/api/system'

// 权限控制
const { hasAuth } = useAuth()

// ==================== 部门树相关 ====================
const deptTreeRef = ref()
const deptTreeData = ref<DeptTree[]>([])
const deptFilterText = ref('')
const selectedDeptId = ref<number>()

// 加载部门树
const loadDeptTree = async () => {
  try {
    // 尝试从 API 获取数据
    try {
      const response = await fetchGetDeptTree()
      deptTreeData.value = response || []
    } catch (apiError) {
      console.warn('API 调用失败，使用测试数据:', apiError)
      // 使用测试数据
      deptTreeData.value = mockDeptTree
    }
  } catch (error) {
    console.error('加载部门树失败:', error)
    ElMessage.error('加载部门树失败')
    // 使用测试数据作为后备
    deptTreeData.value = mockDeptTree
  }
}

// 部门树节点过滤
const filterDeptNode = (value: string, data: any) => {
  if (!value) return true
  return data.label.includes(value)
}

// 监听搜索文本变化
watch(deptFilterText, (val) => {
  deptTreeRef.value?.filter(val)
})

// 部门节点点击
const handleDeptNodeClick = (data: DeptTree) => {
  selectedDeptId.value = data.id
  queryForm.value.deptId = data.id
  handleQuery()
}

// ==================== 查询表单配置 ====================
const queryFields: FormFieldConfig[] = [
  { prop: 'userName', label: '用户账号', component: 'input' },
  { prop: 'nickName', label: '用户昵称', component: 'input' },
  { prop: 'phonenumber', label: '手机号码', component: 'input' },
  { 
    prop: 'status', 
    label: '状态', 
    component: 'select',
    options: [
      { label: '正常', value: '0' },
      { label: '停用', value: '1' }
    ]
  }
]

// ==================== 表格列配置 ====================
const tableColumns = computed(() => [
  { prop: 'userName', label: '用户账号', align: 'center' as const },
  { prop: 'nickName', label: '用户昵称', align: 'center' as const },
  { prop: 'deptName', label: '部门', align: 'center' as const },
  { prop: 'phonenumber', label: '手机号码', align: 'center' as const },
  { 
    prop: 'status', 
    label: '状态', 
    align: 'center' as const,
    cellSlot: 'status'
  },
  { prop: 'createTime', label: '创建时间', align: 'center' as const },
  {
    label: '操作',
    align: 'center' as const,
    buttons: [
      {
        label: '编辑',
        type: 'primary' as const,
        icon: Edit,
        visible: () => hasAuth.value('system:user:edit'),
        click: (scope: any) => handleEdit(scope.row)
      },
      {
        label: '重置密码',
        type: 'primary' as const,
        icon: Key,
        visible: () => hasAuth.value('system:user:resetPwd'),
        click: (scope: any) => handleResetPwd(scope.row)
      },
      {
        label: '删除',
        type: 'danger' as const,
        icon: Delete,
        visible: (scope: any) => scope.row.userId !== 1 && hasAuth.value('system:user:remove'),
        click: (scope: any) => handleDelete(scope.row)
      }
    ]
  }
])

// ==================== 工具栏配置 ====================
const toolbars = computed(() => [
  { 
    label: '新增', 
    type: 'primary' as const, 
    icon: Plus,
    disabled: () => !hasAuth.value('system:user:add'),
    click: () => handleAdd() 
  },
  { 
    label: '批量删除', 
    type: 'danger' as const, 
    icon: Delete,
    disabled: () => !hasAuth.value('system:user:remove') || selectedRows.value.length === 0,
    click: () => handleBatchDelete() 
  },
  { 
    label: '导出', 
    type: 'warning' as const, 
    icon: Download,
    disabled: () => !hasAuth.value('system:user:export'),
    click: () => handleExport() 
  },
  { 
    label: '导入', 
    type: 'success' as const, 
    icon: Upload,
    disabled: () => !hasAuth.value('system:user:import'),
    click: () => handleImport() 
  },
])

// ==================== 表格数据管理 ====================
const selectedRows = ref<User[]>([])

// 测试数据
const mockUsers = [
  {
    userId: 1,
    userName: 'admin',
    nickName: '管理员',
    deptName: '总经办',
    phonenumber: '13800138000',
    status: '0',
    createTime: '2024-01-01 10:00:00'
  },
  {
    userId: 2,
    userName: 'zhangsan',
    nickName: '张三',
    deptName: '技术部',
    phonenumber: '13800138001',
    status: '0',
    createTime: '2024-01-02 10:00:00'
  },
  {
    userId: 3,
    userName: 'lisi',
    nickName: '李四',
    deptName: '市场部',
    phonenumber: '13800138002',
    status: '1',
    createTime: '2024-01-03 10:00:00'
  },
  {
    userId: 4,
    userName: 'wangwu',
    nickName: '王五',
    deptName: '技术部',
    phonenumber: '13800138003',
    status: '0',
    createTime: '2024-01-04 10:00:00'
  },
  {
    userId: 5,
    userName: 'zhaoliu',
    nickName: '赵六',
    deptName: '财务部',
    phonenumber: '13800138004',
    status: '0',
    createTime: '2024-01-05 10:00:00'
  },
  {
    userId: 6,
    userName: 'sunqi',
    nickName: '孙七',
    deptName: '人事部',
    phonenumber: '13800138005',
    status: '1',
    createTime: '2024-01-06 10:00:00'
  },
  {
    userId: 7,
    userName: 'zhouba',
    nickName: '周八',
    deptName: '技术部',
    phonenumber: '13800138006',
    status: '0',
    createTime: '2024-01-07 10:00:00'
  },
  {
    userId: 8,
    userName: 'wujiu',
    nickName: '吴九',
    deptName: '市场部',
    phonenumber: '13800138007',
    status: '0',
    createTime: '2024-01-08 10:00:00'
  },
  {
    userId: 9,
    userName: 'zhengshi',
    nickName: '郑十',
    deptName: '技术部',
    phonenumber: '13800138008',
    status: '1',
    createTime: '2024-01-09 10:00:00'
  },
  {
    userId: 10,
    userName: 'chenyi',
    nickName: '陈一',
    deptName: '财务部',
    phonenumber: '13800138009',
    status: '0',
    createTime: '2024-01-10 10:00:00'
  }
]

// 测试部门树数据
const mockDeptTree = [
  {
    id: 1,
    label: '总经办',
    children: []
  },
  {
    id: 2,
    label: '技术部',
    children: [
      { id: 21, label: '前端组', children: [] },
      { id: 22, label: '后端组', children: [] },
      { id: 23, label: '测试组', children: [] }
    ]
  },
  {
    id: 3,
    label: '市场部',
    children: [
      { id: 31, label: '销售组', children: [] },
      { id: 32, label: '运营组', children: [] }
    ]
  },
  {
    id: 4,
    label: '财务部',
    children: []
  },
  {
    id: 5,
    label: '人事部',
    children: []
  }
]

// 获取表格数据
const getTableData = async (params: any) => {
  try {
    // 合并查询参数
    params = {
      ...params,
      ...queryForm.value
    }
    
    // 尝试从 API 获取数据
    try {
      const response = await fetchGetUserList(params)
      return {
        dataList: response.rows || [],
        totalCount: response.total || 0
      }
    } catch (apiError) {
      console.warn('API 调用失败，使用测试数据:', apiError)
      
      // 使用测试数据
      let filteredData = [...mockUsers]
      
      // 根据查询条件过滤
      const query = queryForm.value || {}
      
      if (query.userName) {
        filteredData = filteredData.filter(user => 
          user.userName.includes(query.userName)
        )
      }
      if (query.nickName) {
        filteredData = filteredData.filter(user => 
          user.nickName.includes(query.nickName)
        )
      }
      if (query.phonenumber) {
        filteredData = filteredData.filter(user => 
          user.phonenumber.includes(query.phonenumber)
        )
      }
      if (query.status) {
        filteredData = filteredData.filter(user => 
          user.status === query.status
        )
      }
      if (query.deptId) {
        // 简单的部门过滤（实际应该根据部门ID过滤）
        const deptNames = ['技术部', '市场部', '财务部', '人事部', '总经办']
        const deptName = deptNames[query.deptId - 1] || ''
        if (deptName) {
          filteredData = filteredData.filter(user => 
            user.deptName === deptName
          )
        }
      }
      
      // 分页
      const start = (params.pageNum - 1) * params.pageSize
      const end = start + params.pageSize
      const pagedData = filteredData.slice(start, end)
      
      return {
        dataList: pagedData,
        totalCount: filteredData.length
      }
    }
  } catch (error) {
    console.error('获取用户列表失败:', error)
    return {
      dataList: [],
      totalCount: 0
    }
  }
}

// 使用 useTable 工具
const {
  queryForm,
  data: tableData,
  total,
  pageNum,
  pageSize,
  onQuery: handleQuery,
  onReset: handleReset,
  onCurrentChange: handlePageChange,
  onSizeChange: handleSizeChange,
  refresh
} = useTable({ 
  getTableData,
  immediate: false // 等待部门树加载后再加载数据
})

// 表格选择变化
const handleSelectionChange = (selection: User[]) => {
  selectedRows.value = selection
}

// ==================== 对话框相关 ====================
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref<'add' | 'edit'>('add')
const dialogLoading = ref(false)

// 岗位和角色选项
const postOptions = ref<Post[]>([])
const roleOptions = ref<Role[]>([])

// 对话框表单数据
const dialogForm = ref<Partial<UserOperateParams>>({
  userId: undefined,
  userName: '',
  nickName: '',
  password: '',
  deptId: undefined,
  phonenumber: '',
  email: '',
  sex: '0',
  postIds: [],
  roleIds: [],
  status: '0',
  remark: ''
})

// 对话框表单验证规则
const dialogRules = {
  nickName: [{ required: true, message: '请输入用户昵称', trigger: 'blur' }],
  userName: [{ required: true, message: '请输入用户账号', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' }
  ],
  phonenumber: [
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  status: [{ required: true, message: '请选择状态', trigger: 'change' }]
}

// 对话框分段配置
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
        data: deptTreeData.value,
        props: { label: 'label', value: 'id' },
        checkStrictly: true,
        renderAfterExpand: false
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
        visible: () => dialogType.value === 'add',
        disabled: () => dialogType.value === 'edit'
      },
      { 
        prop: 'password', 
        label: '密码', 
        component: 'input', 
        type: 'password',
        span: 12,
        visible: () => dialogType.value === 'add'
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
        options: postOptions.value.map(post => ({
          label: post.postName,
          value: post.postId
        }))
      },
      { 
        prop: 'roleIds', 
        label: '角色', 
        component: 'select', 
        span: 12,
        multiple: true,
        options: roleOptions.value.map(role => ({
          label: role.roleName,
          value: role.roleId
        }))
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

// 加载岗位和角色选项
const loadOptions = async () => {
  try {
    const [postsRes, rolesRes] = await Promise.all([
      fetchGetPostList(),
      fetchGetRoleList()
    ])
    postOptions.value = postsRes || []
    roleOptions.value = rolesRes || []
  } catch (error) {
    console.error('加载选项失败:', error)
    // 使用测试数据
    postOptions.value = [
      { postId: 1, postCode: 'ceo', postName: 'CEO', postSort: 1, status: '0' },
      { postId: 2, postCode: 'manager', postName: '经理', postSort: 2, status: '0' },
      { postId: 3, postCode: 'staff', postName: '员工', postSort: 3, status: '0' }
    ]
    roleOptions.value = [
      { roleId: 1, roleName: '超级管理员', roleKey: 'admin', roleSort: 1, status: '0' },
      { roleId: 2, roleName: '普通用户', roleKey: 'common', roleSort: 2, status: '0' }
    ]
  }
}

// 重置对话框表单
const resetDialogForm = () => {
  dialogForm.value = {
    userId: undefined,
    userName: '',
    nickName: '',
    password: '',
    deptId: undefined,
    phonenumber: '',
    email: '',
    sex: '0',
    postIds: [],
    roleIds: [],
    status: '0',
    remark: ''
  }
}

// 对话框确认
const handleDialogConfirm = async () => {
  dialogLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await fetchCreateUser(dialogForm.value as UserOperateParams)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdateUser(dialogForm.value as UserOperateParams)
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

// 对话框取消
const handleDialogCancel = () => {
  dialogVisible.value = false
  resetDialogForm()
}

// ==================== CRUD 操作 ====================
// 新增用户
const handleAdd = async () => {
  dialogType.value = 'add'
  dialogTitle.value = '新增用户'
  resetDialogForm()
  await loadOptions()
  dialogVisible.value = true
}

// 编辑用户
const handleEdit = async (row: User) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑用户'
  
  try {
    // 尝试从 API 获取用户详情
    const userData = await fetchGetUserInfo(row.userId)
    dialogForm.value = {
      ...userData,
      password: undefined // 编辑时不显示密码
    }
  } catch (error) {
    console.warn('获取用户详情失败，使用行数据:', error)
    // 使用行数据
    dialogForm.value = {
      userId: row.userId,
      userName: row.userName,
      nickName: row.nickName,
      deptId: row.deptId,
      phonenumber: row.phonenumber,
      email: row.email,
      sex: row.sex,
      postIds: row.postIds || [],
      roleIds: row.roleIds || [],
      status: row.status,
      remark: row.remark
    }
  }
  
  await loadOptions()
  dialogVisible.value = true
}

// 删除用户
const handleDelete = async (row: User) => {
  try {
    await ElMessageBox.confirm(
      `是否确认删除用户【${row.userName}】？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await fetchBatchDeleteUser([row.userId])
    ElMessage.success('删除成功')
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除用户失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的用户')
    return
  }

  // 检查是否包含超级管理员
  const hasAdmin = selectedRows.value.some(row => row.userId === 1)
  if (hasAdmin) {
    ElMessage.warning('不能删除超级管理员')
    return
  }

  try {
    await ElMessageBox.confirm(
      `是否确认删除选中的 ${selectedRows.value.length} 个用户？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const userIds = selectedRows.value.map(row => row.userId)
    await fetchBatchDeleteUser(userIds)
    ElMessage.success('删除成功')
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// ==================== 重置密码相关 ====================
const resetPwdVisible = ref(false)
const resetPwdLoading = ref(false)
const resetPwdForm = ref<Partial<ResetPasswordParams>>({
  userId: undefined,
  password: ''
})
const currentUserName = ref('')

// 重置密码表单验证规则
const resetPwdRules = {
  password: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度为 6-20 位', trigger: 'blur' }
  ]
}

// 重置密码表单配置
const resetPwdSections = computed(() => [
  {
    type: 'form',
    key: 'resetPwd',
    fields: [
      { 
        prop: 'userName', 
        label: '用户账号', 
        component: 'input',
        span: 24,
        disabled: true,
        value: currentUserName.value
      },
      { 
        prop: 'password', 
        label: '新密码', 
        component: 'input',
        type: 'password',
        span: 24,
        placeholder: '请输入新密码（6-20位）'
      }
    ]
  }
])

// 打开重置密码对话框
const handleResetPwd = (row: User) => {
  resetPwdForm.value = {
    userId: row.userId,
    password: ''
  }
  currentUserName.value = row.userName
  resetPwdVisible.value = true
}

// 重置密码确认
const handleResetPwdConfirm = async () => {
  resetPwdLoading.value = true
  try {
    await fetchResetUserPassword(resetPwdForm.value as ResetPasswordParams)
    ElMessage.success('密码重置成功')
    resetPwdVisible.value = false
  } catch (error) {
    console.error('重置密码失败:', error)
    ElMessage.error('重置密码失败')
  } finally {
    resetPwdLoading.value = false
  }
}

// 重置密码取消
const handleResetPwdCancel = () => {
  resetPwdVisible.value = false
  resetPwdForm.value = {
    userId: undefined,
    password: ''
  }
  currentUserName.value = ''
}



// ==================== 用户状态切换 ====================
// 状态切换前确认
const handleBeforeStatusChange = async (row: User) => {
  const action = row.status === '0' ? '停用' : '启用'
  try {
    await ElMessageBox.confirm(
      `确认要${action}用户【${row.userName}】吗？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    return true
  } catch {
    return false
  }
}

// 状态切换
const handleStatusChange = async (row: User) => {
  try {
    await fetchUpdateUserStatus({
      userId: row.userId,
      status: row.status
    })
    ElMessage.success('状态更新成功')
    refresh()
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = row.status === '0' ? '1' : '0'
  }
}

// ==================== 导入导出功能 ====================
// 导出用户
const handleExport = async () => {
  try {
    ElMessage.info('正在导出用户数据...')
    
    // 构建导出参数
    const exportParams: UserSearchParams = {
      pageNum: 1,
      pageSize: 10000, // 导出所有数据
      ...queryForm.value
    }
    
    const response = await fetchExportUser(exportParams)
    
    // 创建 Blob 对象
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `用户数据_${new Date().getTime()}.xlsx`
    document.body.appendChild(link)
    link.click()
    
    // 清理
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 导入用户
const handleImport = () => {
  // 创建文件选择器
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.xlsx,.xls'
  input.onchange = async (e: Event) => {
    const target = e.target as HTMLInputElement
    const file = target.files?.[0]
    if (!file) return
    
    try {
      ElMessage.info('正在导入用户数据...')
      await fetchImportUser(file)
      ElMessage.success('导入成功')
      refresh()
    } catch (error) {
      console.error('导入失败:', error)
      ElMessage.error('导入失败')
    }
  }
  input.click()
}

// ==================== 生命周期 ====================
onMounted(async () => {
  // 先加载部门树
  await loadDeptTree()
  // 再加载用户列表
  refresh()
})
</script>


