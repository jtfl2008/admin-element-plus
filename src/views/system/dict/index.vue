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
        :data="dictTreeData"
        :columns="tableColumns"
        :toolbars="toolbars"
        :loading="loading"
        row-key="id"
        :tree-props="{ children: 'children', hasChildren: 'hasChildren' }"
        :default-expand-all="isExpandAll"
      >
        <!-- 名称/标签列插槽 -->
        <template #name="{ row }">
          <span v-if="row.type === 'dict-type'" class="dict-type-name">
            {{ row.data?.dictName }}
          </span>
          <span v-else-if="row.type === 'dict-data'" class="dict-data-label">
            {{ row.data?.dictLabel }}
          </span>
        </template>

        <!-- 类型/键值列插槽 -->
        <template #typeOrValue="{ row }">
          <span v-if="row.type === 'dict-type'">
            {{ row.data?.dictType }}
          </span>
          <span v-else-if="row.type === 'dict-data'">
            {{ row.data?.dictValue }}
          </span>
        </template>

        <!-- 排序列插槽 -->
        <template #sort="{ row }">
          <span v-if="row.type === 'dict-data'">
            {{ row.data?.dictSort }}
          </span>
        </template>

        <!-- 样式列插槽 -->
        <template #listClass="{ row }">
          <el-tag v-if="row.type === 'dict-data' && row.data" :type="row.data.listClass">
            {{ row.data.listClass }}
          </el-tag>
        </template>

        <!-- 状态列插槽 -->
        <template #status="{ row }">
          <el-tag v-if="row.data" :type="row.data.status === '0' ? 'success' : 'danger'">
            {{ row.data.status === '0' ? '正常' : '停用' }}
          </el-tag>
        </template>

        <!-- 创建时间列插槽 -->
        <template #createTime="{ row }">
          {{ row.data?.createTime }}
        </template>

        <!-- 操作列插槽 -->
        <template #actions="{ row }">
          <!-- 字典类型操作 -->
          <template v-if="row.type === 'dict-type' && row.data">
            <el-button
              link
              type="primary"
              @click="handleAddDictData(row.data)"
            >
              新增数据
            </el-button>
            <el-button
              link
              type="primary"
              @click="handleEditDictType(row.data)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDeleteDictType(row)"
            >
              删除
            </el-button>
          </template>

          <!-- 字典数据操作 -->
          <template v-else-if="row.type === 'dict-data' && row.data">
            <el-button
              link
              type="primary"
              @click="handleEditDictData(row.data)"
            >
              编辑
            </el-button>
            <el-button
              link
              type="danger"
              @click="handleDeleteDictData(row.data)"
            >
              删除
            </el-button>
          </template>
        </template>
      </ConfigurableTable>
    </el-card>

    <!-- 字典类型对话框 -->
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

    <!-- 字典数据对话框 -->
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
  fetchGetDictTypeList,
  fetchCreateDictType,
  fetchUpdateDictType,
  fetchBatchDeleteDictType,
  fetchRefreshDictCache,
  fetchExportDictType
} from '@/service/api/system/dict'
import {
  fetchCreateDictData,
  fetchUpdateDictData,
  fetchBatchDeleteDictData,
  fetchExportDictData
} from '@/service/api/system/dict-data'
import { loadDictTree } from '@/utils/dict'
import type { FormFieldConfig } from '@/components/ConfigurableForm/types'
import type {
  DictType,
  DictData,
  DictTreeNode,
  DictTypeOperateParams,
  DictDataOperateParams
} from '@/typings/api/system'

// 权限控制
const { hasAuth } = useAuth()

// ==================== 页面状态 ====================
const loading = ref(false)
const dictTreeData = ref<DictTreeNode[]>([])
const isExpandAll = ref(true)

// ==================== 查询表单配置 ====================
const queryForm = ref<{ dictName?: string; dictType?: string; status?: '0' | '1' }>({
  dictName: '',
  dictType: '',
  status: undefined
})

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

// ==================== 表格配置 ====================
const tableColumns: any[] = [
  {
    prop: 'name',
    label: '名称/标签',
    align: 'left',
    width: 200,
    cellSlot: 'name'
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
    cellSlot: 'sort'
  },
  {
    prop: 'listClass',
    label: '样式',
    align: 'center',
    width: 100,
    cellSlot: 'listClass'
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
    width: 180,
    cellSlot: 'createTime'
  },
  {
    label: '操作',
    align: 'center',
    width: 250,
    fixed: 'right',
    cellSlot: 'actions'
  }
]

const toolbars = computed(() => [
  {
    label: '新增字典类型',
    type: 'primary' as const,
    icon: Plus,
    click: () => handleAddDictType()
  },
  {
    label: '刷新缓存',
    type: 'warning' as const,
    icon: Refresh,
    click: () => handleRefreshCache()
  },
  {
    label: '导出',
    type: 'success' as const,
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
])

// ==================== 字典类型对话框配置 ====================
const dictTypeDialogVisible = ref(false)
const dictTypeDialogLoading = ref(false)
const dictTypeOperateType = ref<'add' | 'edit'>('add')
const dictTypeDialogTitle = computed(() =>
  dictTypeOperateType.value === 'add' ? '新增字典类型' : '编辑字典类型'
)

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
        disabled: dictTypeOperateType.value === 'edit'
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

// ==================== 字典数据对话框配置 ====================
const dictDataDialogVisible = ref(false)
const dictDataDialogLoading = ref(false)
const dictDataOperateType = ref<'add' | 'edit'>('add')
const dictDataDialogTitle = computed(() =>
  dictDataOperateType.value === 'add' ? '新增字典数据' : '编辑字典数据'
)

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
  { label: 'Danger', value: 'danger' },
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
        disabled: true
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

// ==================== 数据加载 ====================
/**
 * 加载字典树数据
 */
async function loadData() {
  loading.value = true
  try {
    dictTreeData.value = await loadDictTree()
  } catch (error) {
    console.error('加载字典树失败:', error)
    ElMessage.error('加载字典数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

// ==================== 查询操作 ====================
/**
 * 处理查询
 */
function handleQuery() {
  loadData()
}

/**
 * 处理重置
 */
function handleReset() {
  queryForm.value = {
    dictName: '',
    dictType: '',
    status: undefined
  }
  loadData()
}

// ==================== 字典类型操作 ====================
/**
 * 新增字典类型
 */
function handleAddDictType() {
  dictTypeOperateType.value = 'add'
  dictTypeDialogForm.value = {
    dictId: undefined,
    dictName: '',
    dictType: '',
    remark: ''
  }
  dictTypeDialogVisible.value = true
}

/**
 * 编辑字典类型
 */
function handleEditDictType(dictType: DictType) {
  dictTypeOperateType.value = 'edit'
  dictTypeDialogForm.value = {
    dictId: dictType.dictId,
    dictName: dictType.dictName,
    dictType: dictType.dictType,
    remark: dictType.remark || ''
  }
  dictTypeDialogVisible.value = true
}

/**
 * 删除字典类型
 */
async function handleDeleteDictType(node: DictTreeNode) {
  // 检查是否有子节点
  if (node.children && node.children.length > 0) {
    ElMessage.warning('该字典类型下存在字典数据，请先删除字典数据')
    return
  }

  try {
    await ElMessageBox.confirm('确定要删除该字典类型吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const dictType = node.data as DictType
    await fetchBatchDeleteDictType([dictType.dictId])
    ElMessage.success('删除成功')
    await loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除字典类型失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

/**
 * 字典类型对话框确认
 */
async function handleDictTypeDialogConfirm() {
  dictTypeDialogLoading.value = true
  try {
    if (dictTypeOperateType.value === 'add') {
      await fetchCreateDictType(dictTypeDialogForm.value)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdateDictType(dictTypeDialogForm.value)
      ElMessage.success('更新成功')
    }
    dictTypeDialogVisible.value = false
    await loadData()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    dictTypeDialogLoading.value = false
  }
}

/**
 * 字典类型对话框取消
 */
function handleDictTypeDialogCancel() {
  dictTypeDialogVisible.value = false
}

// ==================== 字典数据操作 ====================
/**
 * 新增字典数据
 */
function handleAddDictData(dictType: DictType) {
  dictDataOperateType.value = 'add'
  dictDataDialogForm.value = {
    dictCode: undefined,
    dictType: dictType.dictType,
    dictLabel: '',
    dictValue: '',
    dictSort: 0,
    listClass: 'default',
    cssClass: '',
    isDefault: 'N',
    status: '0',
    remark: ''
  }
  dictDataDialogVisible.value = true
}

/**
 * 编辑字典数据
 */
function handleEditDictData(dictData: DictData) {
  dictDataOperateType.value = 'edit'
  dictDataDialogForm.value = {
    dictCode: dictData.dictCode,
    dictType: dictData.dictType,
    dictLabel: dictData.dictLabel,
    dictValue: dictData.dictValue,
    dictSort: dictData.dictSort,
    listClass: dictData.listClass,
    cssClass: dictData.cssClass || '',
    isDefault: dictData.isDefault,
    status: dictData.status,
    remark: dictData.remark || ''
  }
  dictDataDialogVisible.value = true
}

/**
 * 删除字典数据
 */
async function handleDeleteDictData(dictData: DictData) {
  try {
    await ElMessageBox.confirm('确定要删除该字典数据吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    await fetchBatchDeleteDictData([dictData.dictCode])
    ElMessage.success('删除成功')
    await loadData()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除字典数据失败:', error)
      ElMessage.error('删除失败，请稍后重试')
    }
  }
}

/**
 * 字典数据对话框确认
 */
async function handleDictDataDialogConfirm() {
  dictDataDialogLoading.value = true
  try {
    if (dictDataOperateType.value === 'add') {
      await fetchCreateDictData(dictDataDialogForm.value)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdateDictData(dictDataDialogForm.value)
      ElMessage.success('更新成功')
    }
    dictDataDialogVisible.value = false
    await loadData()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败，请稍后重试')
  } finally {
    dictDataDialogLoading.value = false
  }
}

/**
 * 字典数据对话框取消
 */
function handleDictDataDialogCancel() {
  dictDataDialogVisible.value = false
}

// ==================== 其他操作 ====================
/**
 * 刷新缓存
 */
async function handleRefreshCache() {
  try {
    await fetchRefreshDictCache()
    ElMessage.success('缓存刷新成功')
  } catch (error) {
    console.error('刷新缓存失败:', error)
    ElMessage.error('刷新缓存失败，请稍后重试')
  }
}

/**
 * 导出
 */
async function handleExport() {
  try {
    const params: any = { ...queryForm.value }
    const blob = await fetchExportDictType(params)
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `字典类型_${new Date().getTime()}.xlsx`
    link.click()
    window.URL.revokeObjectURL(url)
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败，请稍后重试')
  }
}

/**
 * 切换展开/折叠
 */
function handleToggleExpand() {
  isExpandAll.value = !isExpandAll.value
}

/**
 * 刷新
 */
function refresh() {
  loadData()
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadData()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 16px;

  .query-card {
    margin-bottom: 16px;
  }

  .table-card {
    margin-bottom: 16px;
  }

  .dict-type-name {
    font-weight: 600;
    color: #303133;
  }

  .dict-data-label {
    color: #606266;
    padding-left: 20px;
  }
}
</style>
