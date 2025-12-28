<template>
  <div class="menu-tree">
    <!-- 工具栏 -->
    <div class="tree-toolbar">
      <el-button size="small" @click="handleExpandAll">
        {{ isExpandAll ? '折叠' : '展开' }}
      </el-button>
      <el-button size="small" @click="handleCheckAll">
        {{ isCheckAll ? '全不选' : '全选' }}
      </el-button>
      <el-checkbox v-model="checkStrictly" label="父子联动" />
    </div>

    <!-- 菜单树 -->
    <el-tree
      ref="treeRef"
      :data="menuTreeData"
      :props="{ label: 'label', children: 'children' }"
      node-key="id"
      show-checkbox
      :check-strictly="!checkStrictly"
      :default-expand-all="isExpandAll"
      :default-checked-keys="checkedKeys"
      @check="handleCheck"
    >
      <template #default="{ node, data }">
        <span class="custom-tree-node">
          <el-icon v-if="data.icon">
            <component :is="renderIcon(data.icon, data.iconType)" />
          </el-icon>
          <el-icon v-else><Menu /></el-icon>
          <span>{{ node.label }}</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, h } from 'vue'
import { Menu } from '@element-plus/icons-vue'
import { fetchGetRoleMenuTreeSelect } from '@/service/api/system/role'
import type { MenuTreeNode } from '@/typings/api/system'

// Props 定义
const props = defineProps<{
  modelValue: number[]
  roleId?: number
}>()

// Emits 定义
const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

// Refs
const treeRef = ref()
const menuTreeData = ref<MenuTreeNode[]>([])
const checkedKeys = ref<number[]>([])
const isExpandAll = ref(true)
const isCheckAll = ref(false)
const checkStrictly = ref(true)

// 加载菜单树数据
const loadMenuTree = async () => {
  try {
    if (props.roleId) {
      // 编辑模式：获取角色的菜单树和已选菜单
      const response = await fetchGetRoleMenuTreeSelect(props.roleId)
      menuTreeData.value = response.menus || []
      checkedKeys.value = response.checkedKeys || []
      emit('update:modelValue', response.checkedKeys || [])
    } else {
      // 新增模式：只获取菜单树
      // TODO: 调用获取所有菜单树的 API
      menuTreeData.value = mockMenuTree
      checkedKeys.value = []
    }
  } catch (error) {
    console.error('加载菜单树失败:', error)
    // 使用测试数据
    menuTreeData.value = mockMenuTree
    checkedKeys.value = []
  }
}

// 测试数据
const mockMenuTree: MenuTreeNode[] = [
  {
    id: 1,
    label: '系统管理',
    children: [
      {
        id: 11,
        label: '用户管理',
        children: [
          { id: 111, label: '用户查询' },
          { id: 112, label: '用户新增' },
          { id: 113, label: '用户编辑' },
          { id: 114, label: '用户删除' }
        ]
      },
      {
        id: 12,
        label: '角色管理',
        children: [
          { id: 121, label: '角色查询' },
          { id: 122, label: '角色新增' },
          { id: 123, label: '角色编辑' },
          { id: 124, label: '角色删除' }
        ]
      }
    ]
  }
]

// 处理树节点勾选
const handleCheck = () => {
  const checkedNodes = treeRef.value?.getCheckedKeys() || []
  emit('update:modelValue', checkedNodes)
}

// 展开/折叠所有节点
const handleExpandAll = () => {
  isExpandAll.value = !isExpandAll.value
  const nodes = treeRef.value?.store.nodesMap
  if (nodes) {
    Object.values(nodes).forEach((node: any) => {
      node.expanded = isExpandAll.value
    })
  }
}

// 全选/全不选
const handleCheckAll = () => {
  isCheckAll.value = !isCheckAll.value
  if (isCheckAll.value) {
    treeRef.value?.setCheckedNodes(menuTreeData.value)
  } else {
    treeRef.value?.setCheckedKeys([])
  }
  handleCheck()
}

// 监听 modelValue 变化
watch(() => props.modelValue, (newVal) => {
  if (newVal && treeRef.value) {
    treeRef.value.setCheckedKeys(newVal)
  }
})

// 渲染图标
const renderIcon = (iconName: string, iconType?: '1' | '2') => {
  // 判断图标类型
  const isLocal = iconType === '2' || iconName.startsWith('local-icon-')
  
  if (isLocal) {
    // 渲染本地图标
    return h('i', {
      class: `local-icon ${iconName}`,
      style: { fontSize: '16px' }
    })
  } else {
    // 渲染 Iconify 图标
    return h('i', {
      class: 'iconify',
      'data-icon': iconName,
      style: { fontSize: '16px' }
    })
  }
}

// 获取选中的菜单 ID（包括半选状态的父节点）
const getCheckedMenuIds = (): number[] => {
  if (!treeRef.value) return []
  
  const checkedKeys = treeRef.value.getCheckedKeys() as number[]
  
  // 如果启用父子联动，还需要包含半选状态的父节点
  if (checkStrictly.value) {
    const halfCheckedKeys = treeRef.value.getHalfCheckedKeys() as number[]
    return [...checkedKeys, ...halfCheckedKeys]
  }
  
  return checkedKeys
}

// 暴露方法给父组件
defineExpose({
  getCheckedMenuIds
})

// 组件挂载时加载数据
onMounted(() => {
  loadMenuTree()
})
</script>

<style scoped lang="scss">
.menu-tree {
  .tree-toolbar {
    display: flex;
    gap: 10px;
    margin-bottom: 15px;
    align-items: center;
  }

  .custom-tree-node {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  :deep(.el-tree) {
    max-height: 400px;
    overflow-y: auto;
  }
}
</style>
