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
        :data="companyTreeData"
        :columns="tableColumns"
        :toolbars="toolbars"
        :loading="loading"
        row-key="companyId"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="isExpandAll"
      >
        <!-- 状态列自定义插槽 -->
        <template #status="{ row }">
          <el-tag :type="row.status === '0' ? 'success' : 'danger'">
            {{ row.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>
      </ConfigurableTable>
    </el-card>

    <!-- 新增/编辑公司对话框 -->
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
import { Plus, Delete, Edit, Refresh, Fold, Expand, Download } from '@element-plus/icons-vue'
// @ts-ignore
import ConfigurableForm from '@/components/ConfigurableForm/index.vue'
// @ts-ignore
import ConfigurableTable from '@/components/ConfigurableTable/index.vue'
// @ts-ignore
import DialogForm from '@/components/DialogForm/index.vue'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchGetCompanyList,
  fetchCreateCompany,
  fetchUpdateCompany,
  fetchDeleteCompany,
  fetchBatchDeleteCompany,
  fetchExportCompany
} from '@/service/api/system/company'
import { handleTree, filterCompanyTree, searchCompanyTree, sortMenus } from '@/utils/tree'
import { validateCompanyForm, checkCircularReference } from '@/utils/company-validation'
import type { FormFieldConfig } from '@/components/ConfigurableForm/types'
import type { Company, CompanyOperateParams } from '@/typings/api/system'

defineOptions({
  name: 'CompanyManagement'
})

// 权限控制
const { hasAuth } = useAuth()

// ==================== 页面状态 ====================
const loading = ref(false)
const companyTreeData = ref<Company[]>([])
const isExpandAll = ref(true)

// ==================== 查询表单配置 ====================
const queryForm = ref<{ companyName?: string; companyCode?: string; status?: '0' | '1' }>({
  companyName: '',
  companyCode: '',
  status: undefined
})

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

// ==================== 表格列配置 ====================
const tableColumns = computed(() => [
  {
    prop: 'companyName',
    label: '公司名称',
    align: 'left' as const,
    width: 260
  },
  {
    prop: 'companyCode',
    label: '公司编码',
    align: 'center' as const,
    width: 150
  },
  {
    prop: 'companyShortName',
    label: '公司简称',
    align: 'center' as const,
    width: 150
  },
  {
    prop: 'orderNum',
    label: '排序',
    align: 'center' as const,
    width: 100
  },
  {
    prop: 'status',
    label: '状态',
    align: 'center' as const,
    width: 100,
    cellSlot: 'status'
  },
  {
    prop: 'leader',
    label: '负责人',
    align: 'center' as const,
    width: 120
  },
  {
    prop: 'phone',
    label: '联系电话',
    align: 'center' as const,
    width: 150
  },
  {
    prop: 'createTime',
    label: '创建时间',
    align: 'center' as const,
    width: 180
  },
  {
    label: '操作',
    align: 'center' as const,
    width: 200,
    fixed: 'right' as const,
    buttons: [
      {
        label: '新增',
        type: 'primary' as const,
        icon: Plus,
        link: true,
        visible: () => hasAuth.value('system:company:add'),
        click: (scope: any) => handleAddCompany(scope.row)
      },
      {
        label: '编辑',
        type: 'primary' as const,
        icon: Edit,
        link: true,
        visible: () => hasAuth.value('system:company:edit'),
        click: (scope: any) => handleUpdateCompany(scope.row)
      },
      {
        label: '删除',
        type: 'danger' as const,
        icon: Delete,
        link: true,
        visible: () => hasAuth.value('system:company:remove'),
        click: (scope: any) => handleDeleteCompany(scope.row)
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
    disabled: () => !hasAuth.value('system:company:add'),
    click: () => handleAddCompany()
  },
  {
    label: isExpandAll.value ? '折叠' : '展开',
    icon: isExpandAll.value ? Fold : Expand,
    click: () => handleExpandAll()
  },
  {
    label: '导出',
    icon: Download,
    disabled: () => !hasAuth.value('system:company:export'),
    click: () => handleExport()
  },
  {
    label: '刷新',
    icon: Refresh,
    click: () => refresh()
  }
])

// ==================== 获取公司树数据 ====================
const getCompanyTree = async () => {
  loading.value = true
  try {
    const response = await fetchGetCompanyList(queryForm.value)
    
    // 转换为树形结构
    let treeData = handleTree(response, 'companyId', 'parentId', 'children')
    
    // 排序
    const sortTree = (tree: Company[]): Company[] => {
      const sorted = sortMenus(tree, 'orderNum')
      return sorted.map(node => ({
        ...node,
        children: node.children ? sortTree(node.children) : undefined
      }))
    }
    
    treeData = sortTree(treeData)
    
    // 如果有搜索条件，进行搜索过滤
    if (queryForm.value.companyName || queryForm.value.companyCode) {
      const keyword = queryForm.value.companyName || queryForm.value.companyCode || ''
      treeData = searchCompanyTree(treeData, keyword)
    }
    
    // 如果有状态筛选，进行状态过滤
    if (queryForm.value.status) {
      const filterByStatus = (tree: Company[]): Company[] => {
        return tree
          .filter(company => company.status === queryForm.value.status)
          .map(company => ({
            ...company,
            children: company.children ? filterByStatus(company.children) : undefined
          }))
      }
      treeData = filterByStatus(treeData)
    }
    
    companyTreeData.value = treeData
  } catch (error) {
    console.error('获取公司列表失败:', error)
    ElMessage.error('获取公司列表失败')
  } finally {
    loading.value = false
  }
}

// ==================== 查询和重置 ====================
const handleQuery = () => {
  getCompanyTree()
}

const handleReset = () => {
  queryForm.value = {
    companyName: '',
    companyCode: '',
    status: undefined
  }
  getCompanyTree()
}

// ==================== 展开/折叠 ====================
const handleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value
}

// ==================== 刷新 ====================
const refresh = () => {
  getCompanyTree()
}

// ==================== 导出 ====================
const handleExport = async () => {
  try {
    const response = await fetchExportCompany(queryForm.value)
    
    // 创建下载链接
    const blob = new Blob([response as any], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `公司列表_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// ==================== 对话框相关 ====================
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref<'add' | 'edit'>('add')
const dialogLoading = ref(false)

// 对话框表单数据
const dialogForm = ref<Partial<CompanyOperateParams>>({
  companyId: undefined,
  parentId: 0,
  companyCode: '',
  companyName: '',
  companyShortName: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  address: '',
  status: '0',
  remark: ''
})

// 上级公司选项
const parentCompanyOptions = ref<any[]>([])

// 对话框表单验证规则
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
  companyShortName: [
    { max: 30, message: '公司简称长度不能超过 30 个字符', trigger: 'blur' }
  ],
  orderNum: [
    { required: true, message: '请输入显示顺序', trigger: 'blur' },
    { type: 'number', min: 0, message: '显示顺序必须为非负整数', trigger: 'blur' }
  ],
  phone: [
    { pattern: /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/, message: '请输入正确的联系电话', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
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
        prop: 'parentId',
        label: '上级公司',
        component: 'tree-select',
        span: 12,
        data: parentCompanyOptions.value,
        props: { label: 'label', value: 'id' },
        checkStrictly: true,
        renderAfterExpand: false,
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
        prop: 'companyShortName',
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
        prop: 'address',
        label: '详细地址',
        component: 'input',
        span: 12,
        placeholder: '请输入详细地址'
      },
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

// 转换为树形选择器数据格式
const convertToTreeSelect = (companies: Company[]): any[] => {
  return companies.map(company => ({
    id: company.companyId,
    label: company.companyName,
    children: company.children ? convertToTreeSelect(company.children) : undefined
  }))
}

// 获取上级公司选项
const getParentCompanyOptions = (excludeCompanyId?: number) => {
  if (!excludeCompanyId) {
    // 新增模式：返回所有公司，添加顶级公司选项
    const allCompanies = convertToTreeSelect(companyTreeData.value)
    return [
      { id: 0, label: '顶级公司', children: undefined },
      ...allCompanies
    ]
  }
  
  // 编辑模式：排除当前公司及其子公司
  const filtered = filterCompanyTree(companyTreeData.value, excludeCompanyId)
  const options = convertToTreeSelect(filtered)
  return [
    { id: 0, label: '顶级公司', children: undefined },
    ...options
  ]
}

// 重置对话框表单
const resetDialogForm = () => {
  dialogForm.value = {
    companyId: undefined,
    parentId: 0,
    companyCode: '',
    companyName: '',
    companyShortName: '',
    orderNum: 0,
    leader: '',
    phone: '',
    email: '',
    address: '',
    status: '0',
    remark: ''
  }
}

// 对话框确认
const handleDialogConfirm = async () => {
  // 验证表单数据
  const validation = validateCompanyForm(dialogForm.value as CompanyOperateParams)
  if (!validation.valid) {
    ElMessage.warning(validation.errors[0])
    return
  }
  
  // 编辑模式下检测循环引用
  if (dialogType.value === 'edit' && dialogForm.value.companyId) {
    const hasCircular = checkCircularReference(
      dialogForm.value.companyId,
      dialogForm.value.parentId!,
      companyTreeData.value
    )
    if (hasCircular) {
      ElMessage.warning('不能选择当前公司或其子公司作为上级公司')
      return
    }
  }
  
  dialogLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await fetchCreateCompany(dialogForm.value as CompanyOperateParams)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdateCompany(dialogForm.value as CompanyOperateParams)
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
// 新增公司
const handleAddCompany = (parentCompany?: Company) => {
  dialogType.value = 'add'
  dialogTitle.value = '新增公司'
  resetDialogForm()
  
  // 如果传入父公司，设置 parentId
  if (parentCompany) {
    dialogForm.value.parentId = parentCompany.companyId
  }
  
  // 获取上级公司选项
  parentCompanyOptions.value = getParentCompanyOptions()
  
  dialogVisible.value = true
}

// 编辑公司
const handleUpdateCompany = (company: Company) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑公司'
  
  // 填充表单数据
  dialogForm.value = {
    companyId: company.companyId,
    parentId: company.parentId,
    companyCode: company.companyCode,
    companyName: company.companyName,
    companyShortName: company.companyShortName,
    orderNum: company.orderNum,
    leader: company.leader,
    phone: company.phone,
    email: company.email,
    address: company.address,
    status: company.status,
    remark: company.remark
  }
  
  // 获取上级公司选项（排除当前公司）
  parentCompanyOptions.value = getParentCompanyOptions(company.companyId)
  
  dialogVisible.value = true
}

// 删除公司
const handleDeleteCompany = async (company: Company) => {
  // 检查是否包含子公司
  if (company.children && company.children.length > 0) {
    ElMessage.warning('该公司包含子公司，请先删除子公司')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `是否确认删除公司【${company.companyName}】？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await fetchDeleteCompany(company.companyId)
    ElMessage.success('删除成功')
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除公司失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  getCompanyTree()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;

  .query-card {
    margin-bottom: 20px;
  }
}
</style>
