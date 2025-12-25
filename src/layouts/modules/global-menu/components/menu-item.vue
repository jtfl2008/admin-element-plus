<template>
  <el-menu-item :index="item.path || item.name || ''" :disabled="item.meta?.disabled">
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
import type { RouteConfig } from '@/typings/router'

interface Props {
  /** 菜单项数据 */
  item: RouteConfig
}

defineProps<Props>()

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
