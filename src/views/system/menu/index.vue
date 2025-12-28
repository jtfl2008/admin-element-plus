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

    <!-- 内容区域 -->
    <el-card shadow="hover" class="content-card">
      <div class="content-layout">
        <!-- 左侧：菜单树 -->
        <div class="menu-tree-section">
          <div class="section-header">
            <h4>菜单列表</h4>
            <div class="header-actions">
              <el-button
                type="primary"
                size="small"
                :icon="Plus"
                @click="handleAdd()"
              >
                新增
              </el-button>
              <el-button
                size="small"
                :icon="Refresh"
                @click="refresh"
              >
                刷新
              </el-button>
            </div>
          </div>

          <el-tree
            ref="menuTreeRef"
            :data="menuTreeData"
            :props="{ label: 'menuName', children: 'children' }"
            node-key="menuId"
            :expand-on-click-node="false"
            default-expand-all
            highlight-current
            @node-click="handleClickTree"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node">
                <el-icon v-if="data.icon">
                  <component :is="renderIcon(data.icon, data.iconType)" />
                </el-icon>
                <span class="node-label">{{ node.label }}</span>
                <el-tag
                  v-if="data.menuType"
                  :type="getMenuTypeTag(data.menuType)"
                  size="small"
                  class="menu-type-tag"
                >
                  {{ getMenuTypeLabel(data.menuType) }}
                </el-tag>
                <el-tag
                  v-if="data.status === '1'"
                  type="danger"
                  size="small"
                >
                  停用
                </el-tag>
              </span>
            </template>
          </el-tree>
        </div>

        <!-- 右侧：菜单详情和按钮权限 -->
        <div class="menu-detail-section">
          <div v-if="currentMenu" class="menu-detail">
            <div class="detail-header">
              <h4>菜单详情</h4>
              <div class="header-actions">
                <el-button
                  type="primary"
                  size="small"
                  :icon="Edit"
                  @click="handleEdit(currentMenu)"
                >
                  编辑
                </el-button>
                <el-button
                  type="danger"
                  size="small"
                  :icon="Delete"
                  @click="handleDelete(currentMenu)"
                >
                  删除
                </el-button>
              </div>
            </div>

            <el-descriptions :column="2" border>
              <el-descriptions-item label="菜单名称">
                {{ currentMenu.menuName }}
              </el-descriptions-item>
              <el-descriptions-item label="菜单类型">
                <el-tag :type="getMenuTypeTag(currentMenu.menuType)">
                  {{ getMenuTypeLabel(currentMenu.menuType) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="显示顺序">
                {{ currentMenu.orderNum }}
              </el-descriptions-item>
              <el-descriptions-item label="权限标识">
                {{ currentMenu.perms || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="路由地址">
                {{ currentMenu.path || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="组件路径">
                {{ currentMenu.component || '-' }}
              </el-descriptions-item>
              <el-descriptions-item label="状态">
                <el-tag :type="currentMenu.status === '0' ? 'success' : 'danger'">
                  {{ currentMenu.status === '0' ? '正常' : '停用' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="显示状态">
                <el-tag :type="currentMenu.visible === '0' ? 'success' : 'info'">
                  {{ currentMenu.visible === '0' ? '显示' : '隐藏' }}
                </el-tag>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 按钮权限列表 -->
            <div v-if="currentMenu.menuType === 'C'" class="button-permissions">
              <div class="section-header">
                <h4>按钮权限</h4>
                <el-button
                  type="primary"
                  size="small"
                  :icon="Plus"
                  @click="handleAddButton(currentMenu)"
                >
                  新增按钮
                </el-button>
              </div>

              <el-table :data="btnData" border>
                <el-table-column prop="menuName" label="按钮名称" align="center" />
                <el-table-column prop="perms" label="权限标识" align="center" />
                <el-table-column prop="orderNum" label="显示顺序" align="center" />
                <el-table-column prop="status" label="状态" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.status === '0' ? 'success' : 'danger'">
                      {{ row.status === '0' ? '正常' : '停用' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="操作" align="center" width="150">
                  <template #default="{ row }">
                    <el-button
                      type="primary"
                      size="small"
                      link
                      :icon="Edit"
                      @click="handleEdit(row)"
                    >
                      编辑
                    </el-button>
                    <el-button
                      type="danger"
                      size="small"
                      link
                      :icon="Delete"
                      @click="handleDelete(row)"
                    >
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </div>

          <el-empty v-else description="请选择菜单查看详情" />
        </div>
      </div>
    </el-card>

    <!-- 新增/编辑菜单对话框 -->
    <DialogForm
      v-model="dialogVisible"
      v-model:formData="dialogForm"
      :title="dialogTitle"
      :sections="dialogSections"
      :rules="dialogRules"
      :confirm-loading="dialogLoading"
      width="800px"
      @confirm="handleDialogConfirm"
      @cancel="handleDialogCancel"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, h, onMounted, computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Delete, Edit, Refresh } from '@element-plus/icons-vue'
// @ts-ignore
import ConfigurableForm from '@/components/ConfigurableForm/index.vue'
// @ts-ignore
import DialogForm from '@/components/DialogForm/index.vue'
import IconSelector from '@/components/IconSelector/index.vue'
import type { FormFieldConfig } from '@/components/ConfigurableForm/types'
import type { Menu, MenuSearchParams, MenuOperateParams } from '@/typings/api/system'
import {
  fetchGetMenuList,
  fetchCreateMenu,
  fetchUpdateMenu,
  fetchDeleteMenu,
  fetchGetMenuTreeSelect
} from '@/service/api/system/menu'
import { handleTree, filterMenuTree } from '@/utils/tree'
import { validateMenuForm } from '@/utils/menu-validation'

// ==================== 查询表单配置 ====================
const queryFields: FormFieldConfig[] = [
  { prop: 'menuName', label: '菜单名称', component: 'input' },
  {
    prop: 'menuType',
    label: '菜单类型',
    component: 'select',
    options: [
      { label: '目录', value: 'M' },
      { label: '菜单', value: 'C' },
      { label: '按钮', value: 'F' }
    ]
  },
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

const queryForm = ref<MenuSearchParams>({})
const queryFormRef = ref()

// ==================== 菜单树数据 ====================
const menuTreeRef = ref()
const menuTreeData = ref<Menu[]>([])
const currentMenu = ref<Menu | null>(null)
const btnData = ref<Menu[]>([])

// 获取菜单树数据
const getMeunTree = async () => {
  try {
    const response = await fetchGetMenuList(queryForm.value)
    
    // 将扁平数据转换为树形结构
    const tree = handleTree(response, 'menuId', 'parentId', 'children')
    
    // 过滤掉按钮类型（F），只显示目录和菜单
    menuTreeData.value = filterMenuTree(tree, ['F'])
  } catch (error) {
    console.error('获取菜单列表失败:', error)
    ElMessage.error('获取菜单列表失败')
  }
}

// 获取按钮权限列表
const getBtnMenuList = async (parentId: number) => {
  try {
    const response = await fetchGetMenuList({
      ...queryForm.value
    })
    
    // 筛选出当前菜单下的按钮权限
    btnData.value = response.filter(
      (item: Menu) => item.parentId === parentId && item.menuType === 'F'
    )
  } catch (error) {
    console.error('获取按钮权限列表失败:', error)
    btnData.value = []
  }
}

// 处理树节点点击
const handleClickTree = (data: Menu) => {
  currentMenu.value = data
  
  // 如果是菜单类型，加载按钮权限列表
  if (data.menuType === 'C') {
    getBtnMenuList(data.menuId)
  } else {
    btnData.value = []
  }
}

// ==================== 菜单类型相关 ====================
const getMenuTypeLabel = (type: string) => {
  const typeMap: Record<string, string> = {
    M: '目录',
    C: '菜单',
    F: '按钮'
  }
  return typeMap[type] || '未知'
}

const getMenuTypeTag = (type: string) => {
  const tagMap: Record<string, any> = {
    M: 'warning',
    C: 'success',
    F: 'info'
  }
  return tagMap[type] || ''
}

// ==================== 图标渲染 ====================
const renderIcon = (iconName: string, iconType?: '1' | '2') => {
  const isLocal = iconType === '2' || iconName.startsWith('local-icon-')
  
  if (isLocal) {
    return h('i', {
      class: `local-icon ${iconName}`,
      style: { fontSize: '16px' }
    })
  } else {
    return h('i', {
      class: 'iconify',
      'data-icon': iconName,
      style: { fontSize: '16px' }
    })
  }
}

// ==================== CRUD 操作 ====================
// 对话框状态
const dialogVisible = ref(false)
const dialogTitle = ref('')
const dialogType = ref<'add' | 'edit'>('add')
const dialogLoading = ref(false)

// 对话框表单数据
const dialogForm = ref<MenuOperateParams>({
  menuId: undefined,
  parentId: 0,
  menuName: '',
  orderNum: 0,
  path: '',
  component: '',
  queryParam: '',
  isFrame: '1',
  isCache: '0',
  menuType: 'M',
  visible: '0',
  status: '0',
  perms: '',
  icon: '',
  iconType: '1',
  remark: ''
})

// 父菜单选择选项
const parentMenuOptions = ref<any[]>([])

// 对话框表单验证规则
const dialogRules = {
  menuName: [{ required: true, message: '请输入菜单名称', trigger: 'blur' }],
  menuType: [{ required: true, message: '请选择菜单类型', trigger: 'change' }],
  orderNum: [{ required: true, message: '请输入显示顺序', trigger: 'blur' }]
}

// 对话框表单配置
const dialogSections = computed(() => {
  const menuType = dialogForm.value.menuType
  
  return [
    {
      type: 'form',
      key: 'baseInfo',
      title: '基础信息',
      fields: [
        {
          prop: 'parentId',
          label: '上级菜单',
          component: 'tree-select',
          span: 24,
          data: parentMenuOptions.value,
          props: {
            label: 'label',
            value: 'id',
            children: 'children'
          },
          checkStrictly: true
        },
        {
          prop: 'menuType',
          label: '菜单类型',
          component: 'radio-group',
          span: 24,
          options: [
            { label: '目录', value: 'M' },
            { label: '菜单', value: 'C' },
            { label: '按钮', value: 'F' }
          ]
        },
        {
          prop: 'menuName',
          label: menuType === 'F' ? '按钮名称' : '菜单名称',
          component: 'input',
          span: 12
        },
        {
          prop: 'orderNum',
          label: '显示顺序',
          component: 'input-number',
          span: 12,
          min: 0
        },
        // 目录和菜单显示图标选择
        ...(menuType !== 'F' ? [{
          prop: 'icon',
          label: '菜单图标',
          component: IconSelector,
          span: 24,
          iconType: computed(() => dialogForm.value.iconType)
        }] : []),
        // 菜单类型显示路由配置
        ...(menuType === 'C' ? [
          {
            prop: 'path',
            label: '路由地址',
            component: 'input',
            span: 12,
            placeholder: '请输入路由地址'
          },
          {
            prop: 'component',
            label: '组件路径',
            component: 'input',
            span: 12,
            placeholder: '请输入组件路径'
          },
          {
            prop: 'queryParam',
            label: '路由参数',
            component: 'input',
            span: 12,
            placeholder: '请输入路由参数'
          },
          {
            prop: 'isFrame',
            label: '是否外链',
            component: 'radio-group',
            span: 12,
            options: [
              { label: '是', value: '0' },
              { label: '否', value: '1' },
              { label: 'iframe', value: '2' }
            ]
          },
          {
            prop: 'isCache',
            label: '是否缓存',
            component: 'radio-group',
            span: 12,
            options: [
              { label: '缓存', value: '0' },
              { label: '不缓存', value: '1' }
            ]
          }
        ] : []),
        // 目录显示路由地址
        ...(menuType === 'M' ? [{
          prop: 'path',
          label: '路由地址',
          component: 'input',
          span: 12,
          placeholder: '请输入路由地址'
        }] : []),
        // 菜单和按钮显示权限标识
        ...(menuType !== 'M' ? [{
          prop: 'perms',
          label: '权限标识',
          component: 'input',
          span: 12,
          placeholder: '请输入权限标识，如：system:menu:add'
        }] : []),
        {
          prop: 'visible',
          label: '显示状态',
          component: 'radio-group',
          span: 12,
          options: [
            { label: '显示', value: '0' },
            { label: '隐藏', value: '1' }
          ]
        },
        {
          prop: 'status',
          label: '菜单状态',
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
        }
      ]
    }
  ]
})

// 加载父菜单选项
const loadParentMenuOptions = async () => {
  try {
    const response = await fetchGetMenuTreeSelect()
    // 添加顶级菜单选项
    parentMenuOptions.value = [
      { id: 0, label: '顶级菜单', children: response }
    ]
  } catch (error) {
    console.error('加载父菜单选项失败:', error)
    parentMenuOptions.value = [{ id: 0, label: '顶级菜单', children: [] }]
  }
}

// 重置对话框表单
const resetDialogForm = () => {
  dialogForm.value = {
    menuId: undefined,
    parentId: 0,
    menuName: '',
    orderNum: 0,
    path: '',
    component: '',
    queryParam: '',
    isFrame: '1',
    isCache: '0',
    menuType: 'M',
    visible: '0',
    status: '0',
    perms: '',
    icon: '',
    iconType: '1',
    remark: ''
  }
}

// 新增菜单
const handleAdd = async (parentMenu?: Menu) => {
  dialogType.value = 'add'
  dialogTitle.value = '新增菜单'
  resetDialogForm()
  
  // 如果有父菜单，设置 parentId
  if (parentMenu) {
    dialogForm.value.parentId = parentMenu.menuId
  }
  
  // 加载父菜单选项
  await loadParentMenuOptions()
  
  dialogVisible.value = true
}

// 新增按钮
const handleAddButton = async (parentMenu: Menu) => {
  dialogType.value = 'add'
  dialogTitle.value = '新增按钮'
  resetDialogForm()
  
  // 设置为按钮类型，并设置父菜单
  dialogForm.value.menuType = 'F'
  dialogForm.value.parentId = parentMenu.menuId
  
  // 加载父菜单选项
  await loadParentMenuOptions()
  
  dialogVisible.value = true
}

// 编辑菜单
const handleEdit = async (menu: Menu) => {
  dialogType.value = 'edit'
  dialogTitle.value = menu.menuType === 'F' ? '编辑按钮' : '编辑菜单'
  
  // 填充表单数据
  dialogForm.value = {
    menuId: menu.menuId,
    parentId: menu.parentId,
    menuName: menu.menuName,
    orderNum: menu.orderNum,
    path: menu.path || '',
    component: menu.component || '',
    queryParam: menu.queryParam || '',
    isFrame: menu.isFrame || '1',
    isCache: menu.isCache || '0',
    menuType: menu.menuType,
    visible: menu.visible,
    status: menu.status,
    perms: menu.perms || '',
    icon: menu.icon || '',
    iconType: menu.iconType || '1',
    remark: menu.remark || ''
  }
  
  // 加载父菜单选项
  await loadParentMenuOptions()
  
  dialogVisible.value = true
}

// 对话框确认
const handleDialogConfirm = async () => {
  // 验证表单
  const validation = validateMenuForm(dialogForm.value)
  if (!validation.valid) {
    ElMessage.error(validation.errors[0])
    return
  }
  
  dialogLoading.value = true
  try {
    if (dialogType.value === 'add') {
      await fetchCreateMenu(dialogForm.value)
      ElMessage.success('新增成功')
    } else {
      await fetchUpdateMenu(dialogForm.value)
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

// 删除菜单
const handleDelete = async (menu: Menu) => {
  // 检查是否有子菜单
  if (menu.children && menu.children.length > 0) {
    ElMessage.warning('该菜单包含子菜单，请先删除子菜单')
    return
  }

  try {
    await ElMessageBox.confirm(
      `是否确认删除菜单【${menu.menuName}】？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )

    await fetchDeleteMenu(menu.menuId)
    ElMessage.success('删除成功')
    refresh()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除菜单失败:', error)
      ElMessage.error('删除失败')
    }
  }
}

// ==================== 查询操作 ====================
const handleQuery = () => {
  getMeunTree()
}

const handleReset = () => {
  queryForm.value = {}
  getMeunTree()
}

const refresh = () => {
  currentMenu.value = null
  btnData.value = []
  getMeunTree()
}

// ==================== 生命周期 ====================
onMounted(() => {
  getMeunTree()
})
</script>

<style scoped lang="scss">
.page-container {
  padding: 20px;

  .query-card {
    margin-bottom: 20px;
  }

  .content-card {
    .content-layout {
      display: flex;
      gap: 20px;
      min-height: 600px;

      .menu-tree-section {
        flex: 0 0 400px;
        border-right: 1px solid var(--el-border-color);
        padding-right: 20px;

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;

          h4 {
            margin: 0;
            font-size: 16px;
            font-weight: 600;
          }

          .header-actions {
            display: flex;
            gap: 8px;
          }
        }

        .custom-tree-node {
          flex: 1;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;

          .node-label {
            flex: 1;
          }

          .menu-type-tag {
            margin-left: auto;
          }
        }
      }

      .menu-detail-section {
        flex: 1;

        .menu-detail {
          .detail-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;

            h4 {
              margin: 0;
              font-size: 16px;
              font-weight: 600;
            }

            .header-actions {
              display: flex;
              gap: 8px;
            }
          }

          .button-permissions {
            margin-top: 30px;

            .section-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;

              h4 {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
              }
            }
          }
        }
      }
    }
  }
}
</style>
