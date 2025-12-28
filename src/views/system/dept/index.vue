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
        :data="deptTreeData"
        :columns="tableColumns"
        :toolbars="toolbars"
        :loading="loading"
        row-key="deptId"
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

    <!-- 新增/编辑部门对话框 -->
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
import { Plus, Delete, Edit, Refresh, Fold, Expand } from '@element-plus/icons-vue'
// @ts-ignore
import ConfigurableForm from '@/components/ConfigurableForm/index.vue'
// @ts-ignore
import ConfigurableTable from '@/components/ConfigurableTable/index.vue'
// @ts-ignore
import DialogForm from '@/components/DialogForm/index.vue'
import { useAuth } from '@/hooks/useAuth'
import {
  fetchGetDeptList,
  fetchCreateDept,
  fetchUpdateDept,
  fetchDeleteDept
} from '@/service/api/system/dept'
import { handleTree, filterDeptTree, searchDeptTree, sortMenus } from '@/utils/tree'
import { validateDeptForm, checkCircularReference } from '@/utils/dept-validation'
import type { FormFieldConfig } from '@/components/ConfigurableForm/types'
import type { Dept, DeptOperateParams } from '@/typings/api/system'

// 权限控制
const { hasAuth } = useAuth()

// ==================== 页面状态 ====================
const loading = ref(false)
const deptTreeData = ref<Dept[]>([])
const isExpandAll = ref(true)

// ==================== 查询表单配置 ====================
const queryForm = ref<{ deptName?: string; status?: '0' | '1' }>({
  deptName: '',
  status: undefined
})

const queryFields: FormFieldConfig[] = [
  { 
    prop: 'deptName', 
    label: '部门名称', 
    component: 'input',
    span: 6,
    placeholder: '请输入部门名称'
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
    prop: 'deptName',
    label: '部门名称',
    align: 'left' as const,
    width: 260
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
    prop: 'email',
    label: '邮箱',
    align: 'center' as const,
    width: 200
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
        visible: () => hasAuth.value('system:dept:add'),
        click: (scope: any) => handleAddDept(scope.row)
      },
      {
        label: '编辑',
        type: 'primary' as const,
        icon: Edit,
        link: true,
        visible: () => hasAuth.value('system:dept:edit'),
        click: (scope: any) => handleUpdateDept(scope.row)
      },
      {
        label: '删除',
        type: 'danger' as const,
        icon: Delete,
        link: true,
        visible: () => hasAuth.value('system:dept:remove'),
        click: (scope: any) => handleDeleteDept(scope.row)
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
    disabled: () => !hasAuth.value('system:dept:add'),
    click: () => handleAddDept()
  },
  {
    label: isExpandAll.value ? '折叠' : '展开',
    icon: isExpandAll.value ? Fold : Expand,
    click: () => handleExpandAll()
  },
  {
    label: '刷新',
    icon: Refresh,
    click: () => refresh()
  }
])

// ==================== 获取部门树数据 ====================
const getDeptTree = async () => {
  loading.value = true
  try {
    const response = await fetchGetDeptList(queryForm.value)
    
    // 转换为树形结构
    let treeData = handleTree(response, 'deptId', 'parentId', 'children')
    
    // 排序
    const sortTree = (tree: Dept[]): Dept[] => {
      const sorted = sortMenus(tree, 'orderNum')
      return sorted.map(node => ({
        ...node,
        children: node.children ? sortTree(node.children) : undefined
      }))
    }
    
    treeData = sortTree(treeData)
    
    // 如果有搜索条件，进行搜索过滤
    if (queryForm.value.deptName) {
      treeData = searchDeptTree(treeData, queryForm.value.deptName)
    }
    
    // 如果有状态筛选，进行状态过滤
    if (queryForm.value.status) {
      const filterByStatus = (tree: Dept[]): Dept[] => {
        return tree
          .filter(dept => dept.status === queryForm.value.status)
          .map(dept => ({
            ...dept,
            children: dept.children ? filterByStatus(dept.children) : undefined
          }))
      }
      treeData = filterByStatus(treeData)
    }
    
    deptTreeData.value = treeData
  } catch (error) {
    console.error('获取部门列表失败:', error)
    ElMessage.error('获取部门列表失败')
  } finally {
    loading.value = false
  }
}

// ==================== 查询和重置 ====================
const handleQuery = () => {
  getDeptTree()
}

const handleReset = () => {
  queryForm.value = {
    deptName: '',
    status: undefined
  }
  getDeptTree()
}

// ==================== 展开/折叠 ====================
const handleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value
}

// ==================== 刷新 ====================
const refresh = () => {
  getDeptTree()
}

// ==================== 对话框相关 ====================
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref<'add' | 'edit'>('add')
const dialogLoading = ref(false)

// 对话框表单数据
const dialogForm = ref<Partial<DeptOperateParams>>({
  deptId: undefined,
  parentId: 0,
  deptName: '',
  orderNum: 0,
  leader: '',
  phone: '',
  email: '',
  status: '0',
  remark: ''
})

// 上级部门选项
const parentDeptOptions = ref<any[]>([])

// 对话框表单验证规则
const dialogRules = {
  parentId: [
    { required: true, message: '请选择上级部门', trigger: 'change' }
  ],
  deptName: [
    { required: true, message: '请输入部门名称', trigger: 'blur' },
    { min: 2, max: 50, message: '部门名称长度在 2 到 50 个字符', trigger: 'blur' }
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

// 对话框分段配置
const dialogSections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      {
        prop: 'parentId',
        label: '上级部门',
        component: 'el-tree-select',
        span: 24,
        data: parentDeptOptions.value,
        props: { label: 'label', value: 'id' },
        checkStrictly: true,
        renderAfterExpand: false,
        placeholder: '请选择上级部门'
      },
      {
        prop: 'deptName',
        label: '部门名称',
        component: 'input',
        span: 12,
        placeholder: '请输入部门名称'
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
        prop: 'status',
        label: '部门状态',
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
const convertToTreeSelect = (depts: Dept[]): any[] => {
  return depts.map(dept => ({
    id: dept.deptId,
    label: dept.deptName,
    children: dept.children ? convertToTreeSelect(dept.children) : undefined
  }))
}

// 获取上级部门选项
const getParentDeptOptions = (excludeDeptId?: number) => {
  if (!excludeDeptId) {
    // 新增模式：返回所有部门，添加顶级部门选项
    const allDepts = convertToTreeSelect(deptTreeData.value)
    return [
      { id: 0, label: '顶级部门', children: undefined },
      ...allDepts
    ]
  }
  
  // 编辑模式：排除当前部门及其子部门
  const filtered = filterDeptTree(deptTreeData.value, excludeDeptId)
  const options = convertToTreeSelect(filtered)
  return [
    { id: 0, label: '顶级部门', children: undefined },
    ...options
  ]
}

// 重置对话框表单
const resetDialogForm = () => {
  dialogForm.value = {
    deptId: undefined,
    parentId: 0,
    deptName: '',
    orderNum: 0,
    leader: '',
    phone: '',
    email: '',
    status: '0',
    remark: ''
  }
}

// 对话框确认
const handleDialogConfirm = async () => {
  // 验证表单数据
  const validation = validateDeptForm(dialogForm.value as DeptOperateParams)
  if (!validation.valid) {
    ElMessage.warning(validation.errors[0])
    return
  }
  
  // 编辑模式下检测循环引用
  if (dialogType.value === 'edit' && dialogForm.value.deptId) {
    const hasCircular = checkCircularReference(
      dialogForm.value.deptId,
      dialogForm.value.parentId!,
      deptTreeData.value
    )
    if (hasCircular) {
      ElMessage.warning('不能选择当前部门或其子部门作为上级部门')
      return
    }
  }
  
  dialogLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await fetchCreateDept(dialogForm.value as DeptOperateParams)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdateDept(dialogForm.value as DeptOperateParams)
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
// 新增部门
const handleAddDept = (parentDept?: Dept) => {
  dialogType.value = 'add'
  dialogTitle.value = '新增部门'
  resetDialogForm()
  
  // 如果传入父部门，设置 parentId
  if (parentDept) {
    dialogForm.value.parentId = parentDept.deptId
  }
  
  // 获取上级部门选项
  parentDeptOptions.value = getParentDeptOptions()
  
  dialogVisible.value = true
}

// 编辑部门
const handleUpdateDept = (dept: Dept) => {
  dialogType.value = 'edit'
  dialogTitle.value = '编辑部门'
  
  // 填充表单数据
  dialogForm.value = {
    deptId: dept.deptId,
    parentId: dept.parentId,
    deptName: dept.deptName,
    orderNum: dept.orderNum,
    leader: dept.leader,
    phone: dept.phone,
    email: dept.email,
    status: dept.status,
    remark: dept.remark
  }
  
  // 获取上级部门选项（排除当前部门）
  parentDeptOptions.value = getParentDeptOptions(dept.deptId)
  
  dialogVisible.value = true
}

// 删除部门
const handleDeleteDept = async (dept: Dept) => {
  // 检查是否包含子部门
  if (dept.children && dept.children.length > 0) {
    ElMessage.warning('该部门包含子部门，请先删除子部门')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `是否确认删除部门【${dept.deptName}】？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await fetchDeleteDept(dept.deptId)
    ElMessage.success('删除成功')
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除部门失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// ==================== 生命周期 ====================
onMounted(() => {
  getDeptTree()
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
