<template>
  <el-menu-item :index="fullPath" :disabled="item.meta?.disabled">
    <el-icon v-if="item.meta?.icon">
      <component :is="item.meta.icon" />
    </el-icon>
    <template #title>
      <span class="menu-title">{{ item.meta?.title || item.name }}</span>
      <el-badge
        v-if="item.meta?.badge"
        :value="item.meta.badge"
        :type="getBadgeType(item.meta.badge)"
        class="menu-badge"
      />
    </template>
  </el-menu-item>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { RouteConfig } from '@/typings/router'

interface Props {
  /** 菜单项数据 */
  item: RouteConfig
  /** 基础路径 */
  basePath?: string
}

const props = withDefaults(defineProps<Props>(), {
  basePath: '',
})

/**
 * 完整路径
 */
const fullPath = computed(() => {
  const path = props.item.path || props.item.name || ''
  
  // 如果是绝对路径,直接返回
  if (path.startsWith('/')) {
    return path
  }
  
  // 如果有基础路径,拼接
  if (props.basePath) {
    return `${props.basePath}/${path}`.replace(/\/+/g, '/')
  }
  
  return path
})

/**
 * 获取徽章类型
 */
function getBadgeType(badge: string | number | undefined): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  if (typeof badge === 'number' && badge > 0) {
    return 'danger'
  }
  return 'primary'
}
</script>

<style scoped lang="scss">
.menu-title {
  flex: 1;
}

.menu-badge {
  margin-left: 8px;
}
</style>
