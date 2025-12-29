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
      />
    </el-card>

    <!-- 新增/编辑对话框 -->
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit, Download } from '@element-plus/icons-vue'
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
  fetchGetPostList,
  fetchGetPostDetail,
  fetchCreatePost,
  fetchUpdatePost,
  fetchDeletePost,
  fetchBatchDeletePost,
  fetchExportPost
} from '@/service/api/system/post'
import { fetchGetDeptTree } from '@/service/api/system/user'
import type { FormFieldConfig } from '@/components/ConfigurableForm/types'
import type { Post, PostOperateParams, PostSearchParams, DeptTree } from '@/typings/api/system'

defineOptions({
  name: 'PostManagement'
})

// 权限控制
const { hasAuth } = useAuth()

// ==================== 部门树数据 ====================
const deptTreeData = ref<DeptTree[]>([])

// 加载部门树
const loadDeptTree = async () => {
  try {
    const response = await fetchGetDeptTree()
    deptTreeData.value = response || []
  } catch (error) {
    console.error('加载部门树失败:', error)
    deptTreeData.value = []
  }
}

// ==================== 查询表单配置 ====================
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

// ==================== 表格列配置 ====================
const tableColumns = computed(() => [
  { prop: 'postCode', label: '岗位编码', align: 'center' as const },
  { prop: 'postName', label: '岗位名称', align: 'center' as const },
  { prop: 'postCategory', label: '类别编码', align: 'center' as const },
  { prop: 'deptName', label: '归属部门', align: 'center' as const },
  { prop: 'postSort', label: '显示顺序', align: 'center' as const },
  { 
    prop: 'status', 
    label: '状态', 
    align: 'center' as const,
    formatter: (row: Post) => row.status === '0' ? '正常' : '停用'
  },
  { prop: 'createTime', label: '创建时间', align: 'center' as const },
  { 
    prop: 'remark', 
    label: '备注', 
    align: 'center' as const, 
    showOverflowTooltip: true 
  },
  {
    label: '操作',
    align: 'center' as const,
    buttons: [
      {
        label: '编辑',
        type: 'primary' as const,
        icon: Edit,
        visible: () => hasAuth.value('system:post:edit'),
        click: (scope: any) => handleEdit(scope.row)
      },
      {
        label: '删除',
        type: 'danger' as const,
        icon: Delete,
        visible: () => hasAuth.value('system:post:remove'),
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
    disabled: () => !hasAuth.value('system:post:add'),
    click: () => handleAdd() 
  },
  { 
    label: '批量删除', 
    type: 'danger' as const, 
    icon: Delete,
    disabled: () => !hasAuth.value('system:post:remove') || selectedRows.value.length === 0,
    click: () => handleBatchDelete() 
  },
  { 
    label: '导出', 
    type: 'warning' as const, 
    icon: Download,
    disabled: () => !hasAuth.value('system:post:export'),
    click: () => handleExport() 
  }
])

// ==================== 表格数据管理 ====================
const selectedRows = ref<Post[]>([])

// 获取表格数据
const getTableData = async (params: any) => {
  try {
    params = {
      ...params,
      ...queryForm.value
    }
    
    const response = await fetchGetPostList(params)
    return {
      dataList: response.rows || [],
      totalCount: response.total || 0
    }
  } catch (error) {
    console.error('获取岗位列表失败:', error)
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
  immediate: false
})

// 表格选择变化
const handleSelectionChange = (selection: Post[]) => {
  selectedRows.value = selection
}


// ==================== 对话框相关 ====================
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref<'add' | 'edit'>('add')
const dialogLoading = ref(false)

// 对话框表单数据
const dialogForm = ref<Partial<PostOperateParams>>({
  postId: undefined,
  deptId: undefined,
  postCode: '',
  postCategory: '',
  postName: '',
  postSort: 0,
  status: '0',
  remark: ''
})

// 对话框表单验证规则
const dialogRules = {
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

// 对话框分段配置
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
        span: 12
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

// 重置对话框表单
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

// 对话框确认
const handleDialogConfirm = async () => {
  dialogLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await fetchCreatePost(dialogForm.value as PostOperateParams)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdatePost(dialogForm.value as PostOperateParams)
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
// 新增岗位
const handleAdd = () => {
  dialogType.value = 'add'
  dialogTitle.value = '新增岗位'
  resetDialogForm()
  dialogVisible.value = true
}

// 编辑岗位
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

// 删除岗位
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
      console.error('删除岗位失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// 批量删除
const handleBatchDelete = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的岗位')
    return
  }

  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 个岗位吗？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    const postIds = selectedRows.value.map(row => row.postId)
    await fetchBatchDeletePost(postIds)
    ElMessage.success('删除成功')
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// ==================== 导出功能 ====================
const handleExport = async () => {
  try {
    ElMessage.info('正在导出岗位数据...')
    
    const exportParams: PostSearchParams = {
      pageNum: 1,
      pageSize: 10000,
      ...queryForm.value
    }
    
    const response = await fetchExportPost(exportParams)
    
    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    })
    
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `岗位数据_${new Date().getTime()}.xlsx`
    document.body.appendChild(link)
    link.click()
    
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// ==================== 生命周期 ====================
onMounted(async () => {
  await loadDeptTree()
  refresh()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;
  
  .query-card {
    margin-bottom: 20px;
  }
  
  .table-card {
    :deep(.el-card__body) {
      padding: 20px;
    }
  }
}
</style>
