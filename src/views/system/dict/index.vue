<template>
  <div class="page-container">
    <el-container>
      <!-- 左侧字典类型列表 -->
      <el-aside width="300px" class="page-aside">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>字典类型</span>
            </div>
          </template>
          
          <!-- 搜索框 -->
          <el-input
            v-model="dictTypeSearchKeyword"
            placeholder="输入字典名称或类型搜索"
            :prefix-icon="Search"
            clearable
            style="margin-bottom: 12px"
          />
          
          <!-- 工具栏 -->
          <div class="toolbar">
            <el-button
              type="primary"
              :icon="Plus"
              size="small"
              @click="handleAddDictType"
            >
              新增类型
            </el-button>
            <el-button
              :icon="Refresh"
              size="small"
              @click="handleRefreshCache"
            >
              刷新缓存
            </el-button>
          </div>
          
          <!-- 字典类型列表 -->
          <el-scrollbar height="calc(100vh - 320px)">
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
                  size="small"
                  @click.stop="handleEditDictType(item)"
                />
                <el-button
                  link
                  type="danger"
                  :icon="Delete"
                  size="small"
                  @click.stop="handleDeleteDictType(item)"
                />
              </div>
            </div>
            <el-empty
              v-if="filteredDictTypeList.length === 0"
              description="暂无数据"
              :image-size="100"
            />
          </el-scrollbar>
        </el-card>
      </el-aside>

      <!-- 右侧字典数据表格 -->
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
            <!-- 回显样式列插槽 -->
            <template #listClass="{ row }">
              <el-tag :type="row.listClass as any">
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
        </el-card>
      </el-main>
    </el-container>

    <!-- 字典类型操作抽屉 -->
    <DictTypeOperateDrawer
      ref="dictTypeDrawerRef"
      v-model="dictTypeDrawerVisible"
      :operate-type="dictTypeOperateType"
      @confirm="handleDictTypeConfirm"
      @cancel="handleDictTypeCancel"
    />

    <!-- 字典数据操作抽屉 -->
    <DictDataOperateDrawer
      ref="dictDataDrawerRef"
      v-model="dictDataDrawerVisible"
      :operate-type="dictDataOperateType"
      @confirm="handleDictDataConfirm"
      @cancel="handleDictDataCancel"
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
  Download, 
  Refresh,
  Search
} from '@element-plus/icons-vue'
// @ts-ignore
import ConfigurableForm from '@/components/ConfigurableForm/index.vue'
// @ts-ignore
import ConfigurableTable from '@/components/ConfigurableTable/index.vue'
// @ts-ignore
import StatusSwitch from '@/components/StatusSwitch/index.vue'
import DictTypeOperateDrawer from './modules/dict-type-operate-drawer.vue'
import DictDataOperateDrawer from './modules/dict-data-operate-drawer.vue'
import { useAuth } from '@/hooks/useAuth'
// @ts-ignore
import useTable from '@/utils/useTable'
import {
  fetchGetDictTypeList,
  fetchCreateDictType,
  fetchUpdateDictType,
  fetchBatchDeleteDictType,
  fetchRefreshDictCache,
  fetchExportDictType
} from '@/service/api/system/dict'
import {
  fetchGetDictDataList,
  fetchCreateDictData,
  fetchUpdateDictData,
  fetchBatchDeleteDictData,
  fetchExportDictData
} from '@/service/api/system/dict-data'
import type { FormFieldConfig } from '@/components/ConfigurableForm/types'
import type { 
  DictType, 
  DictTypeOperateParams,
  DictData,
  DictDataOperateParams,
  DictDataSearchParams
} from '@/typings/api/system'

// 权限控制
const { hasAuth } = useAuth()

// ==================== 字典类型相关 ====================
const dictTypeSearchKeyword = ref('')
const dictTypeList = ref<DictType[]>([])
const selectedDictType = ref<DictType | null>(null)
const dictTypeDrawerRef = ref()
const dictTypeDrawerVisible = ref(false)
const dictTypeOperateType = ref<'add' | 'edit'>('add')

// 过滤后的字典类型列表
const filteredDictTypeList = computed(() => {
  if (!dictTypeSearchKeyword.value) {
    return dictTypeList.value
  }
  const keyword = dictTypeSearchKeyword.value.toLowerCase()
  return dictTypeList.value.filter(item => 
    item.dictName.toLowerCase().includes(keyword) || 
    item.dictType.toLowerCase().includes(keyword)
  )
})

// 加载字典类型列表
const loadDictTypeList = async () => {
  try {
    const response = await fetchGetDictTypeList()
    dictTypeList.value = response.rows || []
  } catch (error) {
    console.error('加载字典类型列表失败:', error)
    ElMessage.error('加载字典类型列表失败')
  }
}

// 选择字典类型
const handleSelectDictType = (dictType: DictType) => {
  selectedDictType.value = dictType
  queryForm.value.dictType = dictType.dictType
  handleQuery()
}

// 新增字典类型
const handleAddDictType = () => {
  dictTypeOperateType.value = 'add'
  dictTypeDrawerVisible.value = true
  dictTypeDrawerRef.value?.initFormData()
}

// 编辑字典类型
const handleEditDictType = (dictType: DictType) => {
  dictTypeOperateType.value = 'edit'
  dictTypeDrawerVisible.value = true
  dictTypeDrawerRef.value?.initFormData(dictType)
}

// 删除字典类型
const handleDeleteDictType = async (dictType: DictType) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除字典类型"${dictType.dictName}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await fetchBatchDeleteDictType([dictType.dictId])
    ElMessage.success('删除成功')
    
    // 如果删除的是当前选中的字典类型，清空选中状态
    if (selectedDictType.value?.dictId === dictType.dictId) {
      selectedDictType.value = null
      tableData.value = []
    }
    
    loadDictTypeList()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除字典类型失败:', error)
      ElMessage.error('删除字典类型失败')
    }
  }
}

// 刷新字典缓存
const handleRefreshCache = async () => {
  try {
    await fetchRefreshDictCache()
    ElMessage.success('刷新缓存成功')
  } catch (error) {
    console.error('刷新缓存失败:', error)
    ElMessage.error('刷新缓存失败')
  }
}

// 字典类型确认
const handleDictTypeConfirm = async (data: DictTypeOperateParams) => {
  try {
    dictTypeDrawerRef.value?.setLoading(true)
    
    if (dictTypeOperateType.value === 'add') {
      await fetchCreateDictType(data)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdateDictType(data)
      ElMessage.success('更新成功')
    }
    
    dictTypeDrawerVisible.value = false
    loadDictTypeList()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    dictTypeDrawerRef.value?.setLoading(false)
  }
}

// 字典类型取消
const handleDictTypeCancel = () => {
  dictTypeDrawerVisible.value = false
}

// ==================== 字典数据相关 ====================
const queryFormRef = ref()
const queryForm = ref<DictDataSearchParams>({
  dictLabel: '',
  dictType: '',
  pageNum: 1,
  pageSize: 10
})

const queryFields = computed<FormFieldConfig[]>(() => [
  { prop: 'dictLabel', label: '字典标签', component: 'input' },
  { 
    prop: 'dictType', 
    label: '字典类型', 
    component: 'input',
    disabled: true
  }
])

// 使用 useTable 工具
const {
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
  getTableData: async () => {
    if (!selectedDictType.value) {
      return { dataList: [], totalCount: 0 }
    }
    
    const params = {
      ...queryForm.value,
      dictType: selectedDictType.value.dictType,
      pageNum: pageNum.value,
      pageSize: pageSize.value
    }
    
    const response = await fetchGetDictDataList(params)
    return {
      dataList: response.rows || [],
      totalCount: response.total || 0
    }
  },
  immediate: false
})

// 表格列配置
const tableColumns = computed(() => [
  { prop: 'dictLabel', label: '字典标签', align: 'center' as const },
  { prop: 'dictValue', label: '字典键值', align: 'center' as const },
  { prop: 'dictSort', label: '字典排序', align: 'center' as const },
  { 
    prop: 'listClass', 
    label: '回显样式', 
    align: 'center' as const,
    cellSlot: 'listClass'
  },
  { prop: 'cssClass', label: 'CSS样式', align: 'center' as const },
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
        click: (scope: any) => handleEditDictData(scope.row)
      },
      {
        label: '删除',
        type: 'danger' as const,
        icon: Delete,
        click: (scope: any) => handleDeleteDictData(scope.row)
      }
    ]
  }
])

// 选中的行
const selectedRows = ref<DictData[]>([])

// 工具栏配置
const toolbars = computed(() => [
  { 
    label: '新增', 
    type: 'primary' as const, 
    icon: Plus,
    disabled: () => !selectedDictType.value,
    click: () => handleAddDictData() 
  },
  { 
    label: '批量删除', 
    type: 'danger' as const, 
    icon: Delete,
    disabled: () => selectedRows.value.length === 0,
    click: () => handleBatchDeleteDictData() 
  },
  { 
    label: '导出', 
    type: 'warning' as const, 
    icon: Download,
    disabled: () => !selectedDictType.value,
    click: () => handleExportDictData() 
  },
  { 
    label: '刷新', 
    icon: Refresh,
    disabled: () => false,
    click: () => refresh() 
  }
])

// 选择变化
const handleSelectionChange = (selection: DictData[]) => {
  selectedRows.value = selection
}

// 字典数据抽屉
const dictDataDrawerRef = ref()
const dictDataDrawerVisible = ref(false)
const dictDataOperateType = ref<'add' | 'edit'>('add')

// 新增字典数据
const handleAddDictData = () => {
  if (!selectedDictType.value) {
    ElMessage.warning('请先选择字典类型')
    return
  }
  
  dictDataOperateType.value = 'add'
  dictDataDrawerVisible.value = true
  dictDataDrawerRef.value?.initFormData({
    dictType: selectedDictType.value.dictType,
    dictSort: 0,
    dictLabel: '',
    dictValue: '',
    cssClass: '',
    listClass: 'default',
    isDefault: 'N',
    status: '0',
    remark: ''
  })
}

// 编辑字典数据
const handleEditDictData = (dictData: DictData) => {
  dictDataOperateType.value = 'edit'
  dictDataDrawerVisible.value = true
  dictDataDrawerRef.value?.initFormData(dictData)
}

// 删除字典数据
const handleDeleteDictData = async (dictData: DictData) => {
  try {
    await ElMessageBox.confirm(
      `确定要删除字典数据"${dictData.dictLabel}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await fetchBatchDeleteDictData([dictData.dictCode])
    ElMessage.success('删除成功')
    refresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('删除字典数据失败:', error)
      ElMessage.error('删除字典数据失败')
    }
  }
}

// 批量删除字典数据
const handleBatchDeleteDictData = async () => {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据')
    return
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条数据吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    const dictCodes = selectedRows.value.map(item => item.dictCode)
    await fetchBatchDeleteDictData(dictCodes)
    ElMessage.success('删除成功')
    refresh()
  } catch (error: any) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 状态切换
const handleStatusChange = async (row: DictData) => {
  try {
    await fetchUpdateDictData(row)
    ElMessage.success('状态更新成功')
    refresh()
  } catch (error) {
    console.error('状态更新失败:', error)
    ElMessage.error('状态更新失败')
    // 恢复原状态
    row.status = row.status === '0' ? '1' : '0'
  }
}

// 导出字典数据
const handleExportDictData = async () => {
  if (!selectedDictType.value) {
    ElMessage.warning('请先选择字典类型')
    return
  }
  
  try {
    await fetchExportDictData({
      dictType: selectedDictType.value.dictType,
      pageNum: 1,
      pageSize: 10
    })
    ElMessage.success('导出成功')
  } catch (error) {
    console.error('导出失败:', error)
    ElMessage.error('导出失败')
  }
}

// 字典数据确认
const handleDictDataConfirm = async (data: DictDataOperateParams) => {
  try {
    dictDataDrawerRef.value?.setLoading(true)
    
    if (dictDataOperateType.value === 'add') {
      await fetchCreateDictData(data)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdateDictData(data)
      ElMessage.success('更新成功')
    }
    
    dictDataDrawerVisible.value = false
    refresh()
  } catch (error) {
    console.error('操作失败:', error)
    ElMessage.error('操作失败')
  } finally {
    dictDataDrawerRef.value?.setLoading(false)
  }
}

// 字典数据取消
const handleDictDataCancel = () => {
  dictDataDrawerVisible.value = false
}

// ==================== 生命周期 ====================
onMounted(() => {
  loadDictTypeList()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 16px;
  height: calc(100vh - 100px);
}

.page-aside {
  margin-right: 16px;
  
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-weight: 600;
  }
  
  .toolbar {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  
  .dict-type-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px;
    margin-bottom: 8px;
    border: 1px solid var(--el-border-color);
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover {
      background-color: var(--el-fill-color-light);
      border-color: var(--el-color-primary);
    }
    
    &.active {
      background-color: var(--el-color-primary-light-9);
      border-color: var(--el-color-primary);
    }
    
    .dict-type-info {
      flex: 1;
      
      .dict-name {
        font-weight: 600;
        margin-bottom: 4px;
      }
      
      .dict-type {
        font-size: 12px;
        color: var(--el-text-color-secondary);
      }
    }
    
    .dict-type-actions {
      display: flex;
      gap: 4px;
      opacity: 0;
      transition: opacity 0.3s;
    }
    
    &:hover .dict-type-actions {
      opacity: 1;
    }
  }
}

.page-main {
  padding: 0;
  
  .query-card {
    margin-bottom: 16px;
  }
}
</style>
