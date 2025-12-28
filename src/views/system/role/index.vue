<template>
  <div class="page-container">
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
        <!-- 数据范围列插槽 -->
        <template #dataScope="{ row }">
          <el-tag :type="getDataScopeTagType(row.dataScope) as any">
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
    </el-card>

    <!-- 新增/编辑角色对话框 -->
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

    <!-- 数据权限配置对话框 -->
    <DialogForm
      v-model="dataScopeVisible"
      v-model:formData="dataScopeForm"
      title="数据权限配置"
      :sections="dataScopeSections"
      :confirm-loading="dataScopeLoading"
      @confirm="handleDataScopeConfirm"
      @cancel="handleDataScopeCancel"
    />

    <!-- 用户分配对话框 -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Plus, 
  Delete, 
  Edit, 
  CircleCheck,
  User as UserIcon,
  Download, 
  Refresh
} from '@element-plus/icons-vue'
// @ts-ignore
import ConfigurableForm from '@/components/ConfigurableForm/index.vue'
// @ts-ignore
import ConfigurableTable from '@/components/ConfigurableTable/index.vue'
// @ts-ignore
import DialogForm from '@/components/DialogForm/index.vue'
// @ts-ignore
import StatusSwitch from '@/components/StatusSwitch/index.vue'
import MenuTree from '@/components/MenuTree/index.vue'
import DeptTree from '@/components/DeptTree/index.vue'
import { useAuth } from '@/hooks/useAuth'
// @ts-ignore
import useTable from '@/utils/useTable'
import {
  fetchGetRoleList,
  fetchCreateRole,
  fetchUpdateRole,
  fetchBatchDeleteRole,
  fetchGetRoleInfo,
  fetchUpdateRoleStatus,
  fetchUpdateDataScope,
  fetchGetRoleUserList,
  fetchCancelAuthUser,
  fetchExportRole
} from '@/service/api/system/role'
import type { FormFieldConfig } from '@/components/ConfigurableForm/types'
import type { 
  User,
  Role, 
  RoleDetail,
  RoleSearchParams,
  RoleOperateParams, 
  DataScopeParams,
  RoleUserSearchParams
} from '@/typings/api/system'

// 权限控制
const { hasAuth } = useAuth()

// ==================== 查询表单配置 ====================
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

// ==================== 数据范围映射 ====================
const dataScopeRecord: Record<string, string> = {
  '1': '全部数据',
  '2': '自定义数据',
  '3': '本部门数据',
  '4': '本部门及以下',
  '5': '仅本人数据'
}

const getDataScopeLabel = (dataScope: string) => {
  return dataScopeRecord[dataScope] || '未知'
}

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

// ==================== 表格列配置 ====================
const tableColumns = computed(() => [
  { prop: 'roleName', label: '角色名称', align: 'center' as const },
  { prop: 'roleKey', label: '权限字符', align: 'center' as const },
  { prop: 'roleSort', label: '显示顺序', align: 'center' as const },
  { 
    prop: 'dataScope', 
    label: '数据范围', 
    align: 'center' as const,
    cellSlot: 'dataScope'
  },
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
        visible: () => hasAuth.value('system:role:edit'),
        click: (scope: any) => handleEdit(scope.row)
      },
      {
        label: '数据权限',
        type: 'primary' as const,
        icon: CircleCheck,
        visible: () => hasAuth.value('system:role:edit'),
        click: (scope: any) => handleDataScope(scope.row)
      },
      {
        label: '分配用户',
        type: 'primary' as const,
        icon: UserIcon,
        visible: () => hasAuth.value('system:role:edit'),
        click: (scope: any) => handleAuthUser(scope.row)
      },
      {
        label: '删除',
        type: 'danger' as const,
        icon: Delete,
        visible: (scope: any) => scope.row.roleId !== 1 && hasAuth.value('system:role:remove'),
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
    disabled: () => !hasAuth.value('system:role:add'),
    click: () => handleAdd() 
  },
  { 
    label: '批量删除', 
    type: 'danger' as const, 
    icon: Delete,
    disabled: () => !hasAuth.value('system:role:remove') || selectedRows.value.length === 0,
    click: () => handleBatchDelete() 
  },
  { 
    label: '导出', 
    type: 'warning' as const, 
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

// ==================== 表格数据管理 ====================
const selectedRows = ref<Role[]>([])

// 测试数据
const mockRoles = [
  {
    roleId: 1,
    roleName: '超级管理员',
    roleKey: 'admin',
    roleSort: 1,
    dataScope: '1',
    status: '0',
    createTime: '2024-01-01 10:00:00'
  },
  {
    roleId: 2,
    roleName: '普通用户',
    roleKey: 'common',
    roleSort: 2,
    dataScope: '5',
    status: '0',
    createTime: '2024-01-02 10:00:00'
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
      const response = await fetchGetRoleList(params)
      return {
        dataList: response.rows || [],
        totalCount: response.total || 0
      }
    } catch (apiError) {
      console.warn('API 调用失败，使用测试数据:', apiError)
      
      // 使用测试数据
      let filteredData = [...mockRoles]
      
      // 根据查询条件过滤
      const query = queryForm.value || {}
      
      if (query.roleName) {
        filteredData = filteredData.filter(role => 
          role.roleName.includes(query.roleName)
        )
      }
      if (query.roleKey) {
        filteredData = filteredData.filter(role => 
          role.roleKey.includes(query.roleKey)
        )
      }
      if (query.status) {
        filteredData = filteredData.filter(role => 
          role.status === query.status
        )
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
    console.error('获取角色列表失败:', error)
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
  immediate: true
})

// 表格选择变化
const handleSelectionChange = (selection: Role[]) => {
  selectedRows.value = selection
}

// ==================== 对话框相关 ====================
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
        component: MenuTree,
        span: 24,
        roleId: computed(() => dialogForm.value.roleId)
      }
    ]
  }
])

// 重置对话框表单
const resetDialogForm = () => {
  dialogForm.value = {
    roleId: undefined,
    roleName: '',
    roleKey: '',
    roleSort: 0,
    status: '0',
    menuIds: [],
    remark: ''
  }
}

// 对话框确认
const handleDialogConfirm = async () => {
  dialogLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await fetchCreateRole(dialogForm.value)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdateRole(dialogForm.value)
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

// ==================== 数据权限配置对话框 ====================
const dataScopeVisible = ref(false)
const dataScopeLoading = ref(false)

const dataScopeOptions = [
  { label: '全部数据权限', value: '1' },
  { label: '自定义数据权限', value: '2' },
  { label: '本部门数据权限', value: '3' },
  { label: '本部门及以下数据权限', value: '4' },
  { label: '仅本人数据权限', value: '5' }
]

const dataScopeForm = ref<DataScopeParams>({
  roleId: 0,
  roleName: '',
  roleKey: '',
  dataScope: '1',
  deptIds: []
})

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
        component: DeptTree,
        span: 24,
        visible: () => dataScopeForm.value.dataScope === '2',
        roleId: computed(() => dataScopeForm.value.roleId)
      }
    ]
  }
])

// 数据权限配置确认
const handleDataScopeConfirm = async () => {
  dataScopeLoading.value = true
  try {
    await fetchUpdateDataScope(dataScopeForm.value)
    ElMessage.success('配置成功')
    dataScopeVisible.value = false
    refresh()
  } catch (error) {
    console.error('配置失败:', error)
    ElMessage.error('配置失败')
  } finally {
    dataScopeLoading.value = false
  }
}

// 数据权限配置取消
const handleDataScopeCancel = () => {
  dataScopeVisible.value = false
}

// ==================== 用户分配对话框 ====================
const authUserVisible = ref(false)

const authUserForm = ref({
  roleId: 0,
  roleName: ''
})

const authUserTableData = ref<User[]>([])
const authUserTotal = ref(0)
const authUserPageNum = ref(1)
const authUserPageSize = ref(10)

const authUserQueryForm = ref({
  userName: '',
  phonenumber: ''
})

const authUserQueryFields: FormFieldConfig[] = [
  { prop: 'userName', label: '用户账号', component: 'input' },
  { prop: 'phonenumber', label: '手机号码', component: 'input' }
]

const authUserTableColumns = computed(() => [
  { prop: 'userName', label: '用户账号', align: 'center' as const },
  { prop: 'nickName', label: '用户昵称', align: 'center' as const },
  { prop: 'deptName', label: '部门', align: 'center' as const },
  { prop: 'phonenumber', label: '手机号码', align: 'center' as const },
  {
    label: '操作',
    align: 'center' as const,
    buttons: [
      {
        label: '取消授权',
        type: 'danger' as const,
        icon: Delete,
        click: (scope: any) => handleCancelAuth(scope.row)
      }
    ]
  }
])

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
    slotName: 'userTable'
  }
])

// 加载已分配用户列表
const loadAuthUserList = async () => {
  try {
    const params: RoleUserSearchParams = {
      roleId: authUserForm.value.roleId,
      pageNum: authUserPageNum.value,
      pageSize: authUserPageSize.value,
      ...authUserQueryForm.value
    }
    const response = await fetchGetRoleUserList(params)
    authUserTableData.value = response.rows || []
    authUserTotal.value = response.total || 0
  } catch (error) {
    console.error('加载用户列表失败:', error)
  }
}

// 用户分配查询
const handleAuthUserQuery = () => {
  authUserPageNum.value = 1
  loadAuthUserList()
}

// 用户分配重置
const handleAuthUserReset = () => {
  authUserQueryForm.value = {
    userName: '',
    phonenumber: ''
  }
  handleAuthUserQuery()
}

// 用户分配分页变化
const handleAuthUserPageChange = (page: number) => {
  authUserPageNum.value = page
  loadAuthUserList()
}

const handleAuthUserSizeChange = (size: number) => {
  authUserPageSize.value = size
  loadAuthUserList()
}

// 添加用户
const handleAddUser = () => {
  ElMessage.info('添加用户功能待实现')
}

// 取消授权
const handleCancelAuth = async (row: any) => {
  try {
    await ElMessageBox.confirm(
      `是否确认取消用户【${row.userName}】的授权？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await fetchCancelAuthUser({
      roleId: authUserForm.value.roleId,
      userId: row.userId
    })
    ElMessage.success('取消授权成功')
    loadAuthUserList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消授权失败:', error)
      ElMessage.error('取消授权失败')
    }
  }
}

// 用户分配取消
const handleAuthUserCancel = () => {
  authUserVisible.value = false
}

// ==================== CRUD 操作 ====================
// 新增角色
const handleAdd = () => {
  dialogType.value = 'add'
  dialogTitle.value = '新增角色'
  resetDialogForm()
  dialogVisible.value = true
}

// 编辑角色
const handleEdit = async (row: Role) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑角色'
  
  try {
    const roleData = await fetchGetRoleInfo(row.roleId) as RoleDetail
    dialogForm.value = {
      roleId: roleData.roleId,
      roleName: roleData.roleName,
      roleKey: roleData.roleKey,
      roleSort: roleData.roleSort,
      status: roleData.status,
      menuIds: roleData.menuIds || [],
      remark: roleData.remark
    }
  } catch (error) {
    console.warn('获取角色详情失败，使用行数据:', error)
    dialogForm.value = {
      roleId: row.roleId,
      roleName: row.roleName,
      roleKey: row.roleKey,
      roleSort: row.roleSort,
      status: row.status,
      menuIds: [],
      remark: row.remark
    }
  }
  
  dialogVisible.value = true
}

// 删除角色
const handleDelete = async (row: Role) => {
  try {
    await ElMessageBox.confirm(
      `是否确认删除角色【${row.roleName}】？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await fetchBatchDeleteRole([row.roleId])
    ElMessage.success('删除成功')
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除角色失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的角色')
    return
  }

  // 检查是否包含超级管理员
  const hasAdmin = selectedRows.value.some(row => row.roleId === 1)
  if (hasAdmin) {
    ElMessage.warning('不能删除超级管理员')
    return
  }

  try {
    await ElMessageBox.confirm(
      `是否确认删除选中的 ${selectedRows.value.length} 个角色？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const roleIds = selectedRows.value.map(row => row.roleId)
    await fetchBatchDeleteRole(roleIds)
    ElMessage.success('删除成功')
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 状态切换
const handleStatusChange = async (row: Role) => {
  const oldStatus = row.status
  try {
    await fetchUpdateRoleStatus({
      roleId: row.roleId,
      status: row.status
    })
    ElMessage.success('状态更新成功')
    refresh()
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = oldStatus
  }
}

// 数据权限配置
const handleDataScope = (row: Role) => {
  dataScopeForm.value = {
    roleId: row.roleId,
    roleName: row.roleName,
    roleKey: row.roleKey,
    dataScope: (row as RoleDetail).dataScope || '1',
    deptIds: []
  }
  dataScopeVisible.value = true
}

// 分配用户
const handleAuthUser = (row: Role) => {
  authUserForm.value = {
    roleId: row.roleId,
    roleName: row.roleName
  }
  authUserVisible.value = true
  loadAuthUserList()
}

// 导出角色
const handleExport = async () => {
  try {
    ElMessage.info('正在导出角色数据...')
    
    const params: RoleSearchParams = {
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      ...queryForm.value
    }
    const response = await fetchExportRole(params)
    
    // 创建 Blob 对象
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    // 创建下载链接
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `角色数据_${new Date().getTime()}.xlsx`
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

// ==================== 生命周期 ====================
onMounted(() => {
  refresh()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;

  .query-card {
    margin-bottom: 20px;
  }

  .auth-user-content {
    padding: 10px 0;

    .el-button {
      margin-bottom: 15px;
    }
  }
}
</style>
