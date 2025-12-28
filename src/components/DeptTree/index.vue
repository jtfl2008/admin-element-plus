<template>
  <div class="dept-tree">
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

    <!-- 部门树 -->
    <el-tree
      ref="treeRef"
      :data="deptTreeData"
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
          <el-icon><OfficeBuilding /></el-icon>
          <span>{{ node.label }}</span>
        </span>
      </template>
    </el-tree>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onMounted } from 'vue'
import { OfficeBuilding } from '@element-plus/icons-vue'
import { fetchGetRoleDeptTreeSelect } from '@/service/api/system/role'
import type { DeptTreeNode } from '@/typings/api/system'

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
const deptTreeData = ref<DeptTreeNode[]>([])
const checkedKeys = ref<number[]>([])
const isExpandAll = ref(true)
const isCheckAll = ref(false)
const checkStrictly = ref(true)

// 加载部门树数据
const loadDeptTree = async () => {
  try {
    if (props.roleId) {
      // 编辑模式：获取角色的部门树和已选部门
      const response = await fetchGetRoleDeptTreeSelect(props.roleId)
      deptTreeData.value = response.depts || []
      checkedKeys.value = response.checkedKeys || []
      emit('update:modelValue', response.checkedKeys || [])
    } else {
      // 新增模式：只获取部门树
      // TODO: 调用获取所有部门树的 API
      deptTreeData.value = mockDeptTree
      checkedKeys.value = []
    }
  } catch (error) {
    console.error('加载部门树失败:', error)
    // 使用测试数据
    deptTreeData.value = mockDeptTree
    checkedKeys.value = []
  }
}

// 测试数据
const mockDeptTree: DeptTreeNode[] = [
  {
    id: 1,
    label: '总公司',
    children: [
      {
        id: 11,
        label: '研发部',
        children: [
          { id: 111, label: '前端组' },
          { id: 112, label: '后端组' },
          { id: 113, label: '测试组' }
        ]
      },
      {
        id: 12,
        label: '市场部',
        children: [
          { id: 121, label: '销售组' },
          { id: 122, label: '运营组' }
        ]
      },
      {
        id: 13,
        label: '财务部'
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
    treeRef.value?.setCheckedNodes(deptTreeData.value)
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

// 组件挂载时加载数据
onMounted(() => {
  loadDeptTree()
})
</script>

<style scoped lang="scss">
.dept-tree {
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
