<template>
  <div class="app-container">
    <!-- 查询表单 -->
    <ConfigurableForm
      ref="queryFormRef"
      v-model="queryForm"
      :fields="queryFields"
      query
      label-width="100px"
      @on-query="onQuery"
      @on-reset="onReset"
    />

    <!-- 数据表格 -->
    <ConfigurableTable
      :data="data"
      :columns="tableColumns"
      :toolbars="toolbars"
      :total="total"
      v-model:pageNum="pageNum"
      v-model:pageSize="pageSize"
      @current-change="onCurrentChange"
      @size-change="onSizeChange"
    />
    <!-- 新增/编辑对话框 -->
    <DialogForm
      ref="dialogFormRef"
      v-model="dialogVisible"
      v-model:formData="dialogForm"
      :title="dialogTitle"
      :sections="dialogSections"
      :rules="dialogFormRules"
      :show-default-buttons="true"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    >
      <!-- 自定义组件插槽 -->
      <template #customComponent="{ onClick }">
        <el-input v-model="dialogForm.customComponent" @click="onClick" />
      </template>
      <template #selectTableSingle>
        <!-- ✅ 使用简单值绑定，直接绑定 userId -->
        <!-- <user-select 
          v-model="dialogForm.selectTableSingle" 
          value-key="userId"
          @change="handleUserSelectChange"
        ></user-select> -->
      </template>
      <template #selectTableMultiple>
        <!-- ✅ 使用简单值绑定，直接绑定 userId -->
        <!-- <user-select 
          v-model="dialogForm.selectTableMultiple" 
          value-key="deptId"
          multiple
          @change="handleUserMultipleSelectChange"
        ></user-select> -->
      </template>

      <!-- 物品明细表格插槽 -->
      <template #detailsTable>
        {{dialogForm.selectTableSingle}}
        <el-row style="margin-bottom: 10px">
          <el-col>
            <el-button type="primary" :icon="Plus" @click="handleAddRow">新增</el-button>
            <el-button type="danger" :icon="Delete" @click="handleDeleteRow">删除</el-button>
          </el-col>
        </el-row>
        <el-table
          ref="dialogDetailTableRef"
          border
          stripe
          max-height="300px"
          style="width: 100%"
          :data="dialogForm.details"
          @selection-change="handleSelectionChange"
          row-key="index"
        >
          <el-table-column type="selection" align="center" fixed="left" width="55" />
          <el-table-column align="center" label="序号" type="index" width="80" />
          <el-table-column label="物品编码" align="center" prop="goodsCode" />
          <el-table-column label="物品名称" align="center" prop="goodsName" />
          <el-table-column label="规格型号" align="center" prop="goodsSpecs" />
          <el-table-column label="单位" align="center" prop="goodsUnitName" />
          <el-table-column label="生产日期" align="center" prop="productionDate" width="160">
            <template #default="scope">
              <el-form-item
                :prop="'details.' + scope.$index + '.productionDate'"
                :rules="[
                  { required: true, message: '请选择生产日期', trigger: 'change' },
                  {
                    validator: (_rule, value, callback) => {
                      if (value > scope.row.expireDate)
                        callback(new Error('生产日期不能大于到期日期'))
                      else callback()
                    },
                    trigger: 'change',
                  },
                ]"
                label-width="0"
                label=" "
              >
                <el-date-picker
                  v-model="scope.row.productionDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  placeholder="请选择生产日期"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="到期日期" align="center" prop="expireDate" width="160">
            <template #default="scope">
              <el-form-item
                :prop="'details.' + scope.$index + '.expireDate'"
                label-width="0"
                label=" "
              >
                <el-date-picker
                  v-model="scope.row.expireDate"
                  type="date"
                  value-format="YYYY-MM-DD"
                  disabled
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="本次入库数量" align="center" prop="inboundAmount" width="160">
            <template #default="scope">
              <el-form-item
                :prop="'details.' + scope.$index + '.inboundAmount'"
                :rules="[
                  { required: true, message: '数量不能为空', trigger: 'change' },
                  {
                    validator: (_rule, value, callback) => {
                      if (value < 0) callback(new Error('数量必须大于0'))
                      else callback()
                    },
                    trigger: 'change',
                  },
                ]"
                label-width="0"
                label=" "
              >
                <el-input-number
                  v-model="scope.row.inboundAmount"
                  placeholder="请输入数量"
                  :min="0"
                  :precision="0"
                  :step="1"
                  style="width: 100%"
                />
              </el-form-item>
            </template>
          </el-table-column>
          <el-table-column label="备注" align="center" prop="remark" width="160">
            <template #default="scope">
              <el-form-item :prop="'details.' + scope.$index + '.remark'" label-width="0" label=" ">
                <el-input v-model="scope.row.remark" placeholder="请输入备注" style="width: 100%" />
              </el-form-item>
            </template>
          </el-table-column>
        </el-table>
      </template>
    </DialogForm>

    <!-- 选择器组件 -->
    <!-- <locationList ref="locationRef" :multiple="false" @confirm="handleSelectLocation" /> -->
    <!-- <user ref="userRef" @confirm="handleSelectUser" /> -->
    <!-- <materialList ref="materiaListRef" @confirm="handleSelectMaterial" /> -->
    <!-- <detail ref="detailRef" /> -->
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { dayjs } from 'element-plus'
import { Plus, Delete, View, Edit, QuestionFilled } from '@element-plus/icons-vue'
import useTable from '@/utils/useTable'
import DialogForm from '@/components/DialogForm/index.vue'
// import SelectTable from '@/components/SelectTable/index.vue'
// import locationList from '@/views/location/management/managementList.vue'
// import userSelect from '@/components/user/index.vue'
// import materialList from '@/views/goodsManage/goods/materailList.vue'
// import detail from './detail.vue'
// import {
//   list,
//   saveInbound,
//   submitInbound,
//   getInbound,
//   deleteInbound,
// } from '@/api/stock/stockManagement'

const { proxy } = getCurrentInstance()

// ==================== 常量定义 ====================
const statusOptions = [
  { label: '未提交', value: 0 },
  { label: '审批中', value: 1 },
  { label: '已完成', value: 2 },
]

// ==================== 查询表单配置 ====================
const queryFields = [
  { prop: 'code', label: '入库单号', component: 'input' },
  { prop: 'name', label: '入库名称', component: 'input' },
  { prop: 'locationName', label: '入库库位', component: 'input' },
  { prop: 'status', label: '审批状态', component: 'select', options: statusOptions },
]

// ==================== 表格列配置 ====================
const tableColumns = [
  { prop: 'code', label: '入库单号' },
  { prop: 'name', label: '入库名称' },
  { prop: 'locationName', label: '入库库位' },
  { prop: 'address', label: '详细位置' },
  { prop: 'userName', label: '入库人员' },
  { prop: 'createBy', label: '操作人' },
  { prop: 'createTime', label: '操作时间' },
  { prop: 'status', label: '审批状态', options: statusOptions },
  {
    label: '操作',
    align: 'center',
    buttons: [
      {
        label: '修改',
        type: 'primary',
        icon: Edit,
        // visible: ({ row }) => [0].includes(row.status),
        click: ({ row }) => dialogHandleUpdate(row),
      },
      {
        label: '删除',
        type: 'primary',
        icon: Delete,
        visible: ({ row }) => [0].includes(row.status),
        click: ({ row }) => handleDelete(row),
      },
      { label: '查看', type: 'primary', icon: View, click: ({ row }) => handleDetail(row) },
    ],
  },
]

// ==================== 工具栏配置 ====================
const toolbars = [{ label: '新增', type: 'primary', icon: Plus, click: () => dialogHandleAdd() }]

// ==================== 列表数据获取 ====================
const getTableData = async (params) => {
  params = { ...params, ...queryForm.value }

    const { rows, total } = await list(params)
    return {
      dataList: rows,
      totalCount: total,
    }
}

// ==================== useTable 集成 ====================
const {
  queryFormRef,
  queryForm,
  data,
  total,
  pageNum,
  pageSize,
  onQuery,
  onReset,
  onCurrentChange,
  onSizeChange,
  refresh,
} = useTable({ getTableData, immediate: true })

// ==================== 对话框状态 ====================
const dialogTitle = ref('')
const dialogVisible = ref(false)
const dialogFormRef = ref(null)
const dialogDetailTableRef = ref(null)
const dialogLoading = ref(false)

// ==================== 表单数据 ====================
const dialogForm = ref({
  id: null,
  name: '',
  locationId: '',
  locationName: '',
  address: '',
  userId: '',
  userName: '',
  remark: '',
  details: [],
  path: '',
  customComponent: '',
  selectTableSingle: '',
  selectTableMultiple: [],
})

// ==================== 表单验证规则 ====================
const dialogFormRules = {
  name: [{ required: true, message: '请输入入库名称', trigger: 'blur' }],
  locationName: [{ required: true, message: '请选择入库库位', trigger: 'change' }],
  userName: [{ required: true, message: '请选择入库人员', trigger: 'change' }],
  customComponent2: [{ required: true, message: '请选择用户', trigger: 'change' }],
}

// ==================== 对话框分段配置 ====================
const dialogSections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      { prop: 'name', label: '入库名称', component: 'input', span: 12 },
      {
        prop: 'locationName',
        label: '入库库位',
        component: 'input',
        span: 12,
        onClick: handleOpenLocation,
      },
      { prop: 'address', label: '详细位置', component: 'input', span: 12, disabled: true },
      {
        prop: 'userName',
        label: '入库人员',
        component: 'input',
        span: 12,
        onClick: handleOpenUser,
      },
      {
        prop: 'customComponent',
        label: '自定义组件',
        span: 12,
        slotName: 'customComponent',
        onClick: handleOpenUser,
      },
      {
        prop: 'selectTableSingle',
        label: '选择器单选',
        span: 12,
        slotName: 'selectTableSingle',
      },
      {
        prop: 'selectTableMultiple',
        label: '选择器多选',
        span: 12,
        slotName: 'selectTableMultiple',
      },
      { prop: 'remark', label: '备注', component: 'input', type: 'textarea', span: 24 },
      // date-picker
      { prop: 'date', label: '日期', component: 'date-picker', type: 'date', span: 12 },
    ],
  },
  { type: 'custom', key: 'details', title: '物品明细', slotName: 'detailsTable' },
  { type: 'custom', key: 'details2', title: '物品明细2', slotName: 'detailsTable2' },
  {
    type: 'upload',
    key: 'file',
    title: '附件',
    uploadConfig: { dataKey: 'path' },
  },
])

// ==================== 对话框自定义按钮 ====================
const dialogButtons = computed(() => [
  {
    key: 'save',
    label: '暂存',
    type: 'primary',
    loading: dialogLoading.value,
    onClick: () => dialogSubmitForm('save'),
  },
  {
    key: 'submit',
    label: '提交',
    type: 'primary',
    loading: dialogLoading.value,
    onClick: () => dialogSubmitForm('submit'),
  },
  { key: 'cancel', label: '取消', onClick: handleDialogCancel },
])

// ==================== CRUD 操作 ====================
function dialogHandleAdd() {
  dialogResetForm()
  dialogVisible.value = true
  dialogTitle.value = '新增入库'
}

function dialogHandleUpdate(row) {
  dialogVisible.value = true
  dialogTitle.value = '修改入库'
  getInbound(row.id)
    .then((res) => {
      dialogForm.value = {
        ...res.data,
        details: res.data.details.map((item) => ({
          ...item,
          goodsSpec: item.goodsSpecs,
          goodsUnitName: item.goodsUnit,
        })),
      }
      
      // 🔥 关键修复：数据回显后清除表单验证状态
      nextTick(() => {
        if (dialogFormRef.value) {
          dialogFormRef.value.clearValidate()
        }
      })
    })
    .catch(() => {
      console.warn('详情获取失败，使用行数据回显')
      dialogForm.value = {
        ...row,
        details: row.details || [],
      }
      
      // 🔥 关键修复：数据回显后清除表单验证状态
      nextTick(() => {
        if (dialogFormRef.value) {
          dialogFormRef.value.clearValidate()
        }
      })
    })
}

function handleDelete(row) {
  proxy.$modal
    .confirm(`是否确认删除名称为"${row.name}"的数据项?`)
    .then(() => deleteInbound(row.id))
    .then(() => {
      refresh()
      proxy.$modal.msgSuccess('删除成功')
    })
    .catch(() => {})
}

const detailRef = ref(null)
function handleDetail(row) {
  detailRef.value.open(row)
}

// ==================== 表单提交 ====================
async function dialogSubmitForm(type) {
  if (!dialogForm.value.details.length) {
    proxy.$modal.msgError('请添加物品明细')
    return
  }

  dialogLoading.value = true
  try {
    const api = type === 'save' ? saveInbound : submitInbound
    await api(dialogForm.value)
    const msg = type === 'save' ? (dialogForm.value.id ? '修改成功' : '新增成功') : '提交成功'
    proxy.$modal.msgSuccess(msg)
    dialogVisible.value = false
    refresh()
  } finally {
    dialogLoading.value = false
  }
}

function handleDialogConfirm() {
  dialogSubmitForm('submit')
}

function handleDialogCancel() {
  dialogVisible.value = false
  dialogResetForm()
}

function dialogResetForm() {
  dialogForm.value = {
    id: null,
    name: '',
    locationId: '',
    locationName: '',
    address: '',
    userId: '',
    userName: '',
    remark: '',
    details: [],
    path: '',
  }
}

// ==================== 选择器处理 ====================
// 库位
const locationRef = ref(null)
function handleOpenLocation() {
  locationRef.value.open()
}
function handleSelectLocation(data) {
  if (!data.length) return
  const row = data[0]
  dialogForm.value.locationId = row.id
  dialogForm.value.locationName = row.locationName
  dialogForm.value.address = `${row.warehouseName}/${row.areaName}/${row.locationName}/${row.rowNo}排${row.columnNo}列${row.levelNo}层`
}
// 人员
const userRef = ref(null)
function handleOpenUser() {
  userRef.value.open()
}
function handleSelectUser(data) {
  if (!data.length) return
  const row = data[0]
  dialogForm.value.userId = row.userId
  dialogForm.value.userName = row.nickName
}

// ==================== 物品明细操作 ====================
const materiaListRef = ref(null)
function handleAddRow() {
  materiaListRef.value.open()
}

function handleSelectMaterial(data) {
  data.forEach((item) => {
    const exists = dialogForm.value.details.find((m) => m.id === item.id)
    if (!exists) {
      dialogForm.value.details.push({
        index: dialogForm.value.details.length + 1,
        ...item,
        goodsSpec: item.goodsSpecs,
        goodsUnit: item.goodsUnitName,
        goodsId: item.id,
        inboundAmount: null,
        productionDate: dayjs().format('YYYY-MM-DD'),
        expireDate:
          Number(item.goodsValidity) > 0
            ? dayjs().add(Number(item.goodsValidity), 'day').format('YYYY-MM-DD')
            : dayjs().add(100, 'year').format('YYYY-MM-DD'),
        remark: '',
      })
    } else {
      proxy.$modal.msgError(`${item.goodsName}数据已存在!`)
    }
  })
}

const multipleSelection = ref([])
function handleSelectionChange(val) {
  multipleSelection.value = val.map((item) =>
    dialogForm.value.details.findIndex((row) => row.index === item.index)
  )
}

function handleDeleteRow() {
  multipleSelection.value
    .sort((a, b) => b - a)
    .forEach((index) => {
      dialogForm.value.details.splice(index, 1)
    })
  multipleSelection.value = []
}

// ==================== SelectTable change 事件处理 ====================
// 单选用户选择变化
function handleUserSelectChange(item) {
  console.log('单选 v-model 值:', dialogForm.value.selectTableSingle)
  console.log('单选 change 事件完整对象:', item)
  
  // 可以在这里直接使用完整对象的其他字段
  if (item) {
    // 例如：同时设置用户名称
    // dialogForm.value.userName = item.nickName
    // dialogForm.value.deptId = item.deptId
  }
}

// 多选用户选择变化
function handleUserMultipleSelectChange(items) {
  console.log('多选 v-model 值:', dialogForm.value.selectTableMultiple)
  console.log('多选 change 事件完整对象数组:', items)
  
  // 可以在这里直接使用完整对象数组的其他字段
  if (items && items.length > 0) {
    // 例如：提取所有用户名称
    // const userNames = items.map(user => user.nickName).join(', ')
  }
}
</script>

<style scoped></style>
