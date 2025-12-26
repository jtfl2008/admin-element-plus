<template>
  <el-sub-menu :index="item.path || item.name || ''" :disabled="item.meta?.disabled">
    <template #title>
      <el-icon v-if="item.meta?.icon">
        <component :is="item.meta.icon" />
      </el-icon>
      <span class="menu-title">{{ item.meta?.title || item.name }}</span>
      <el-badge
        v-if="item.meta?.badge"
        :value="item.meta.badge"
        :type="getBadgeType(item.meta.badge)"
        class="menu-badge"
      />
    </template>

    <template v-for="child in visibleChildren" :key="child.path || child.name">
      <!-- 递归渲染子菜单（最多3级） -->
      <SubMenu
        v-if="child.children && child.children.length > 0 && currentLevel < 3"
        :item="child"
        :base-path="resolvePath(child.path)"
        :level="currentLevel + 1"
      />
      <MenuItem v-else :item="child" :base-path="basePath" />
    </template>
  </el-sub-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import MenuItem from './menu-item.vue'
import type { RouteConfig } from '@/typings/router'

// 递归组件需要定义名称
defineOptions({
  name: 'SubMenu'
})

interface Props {
  /** 菜单项数据 */
  item: RouteConfig
  /** 基础路径 */
  basePath?: string
  /** 当前层级 */
  level?: number
}

const props = withDefaults(defineProps<Props>(), {
  basePath: '',
  level: 1,
})

/**
 * 当前层级
 */
const currentLevel = computed(() => props.level)

/**
 * 可见的子菜单项
 */
const visibleChildren = computed(() => {
  return props.item.children?.filter((child) => !child.meta?.hidden) || []
})

/**
 * 解析完整路径
 */
function resolvePath(path?: string): string {
  if (!path) return props.basePath
  if (path.startsWith('/')) return path
  
  // 拼接路径并规范化
  const fullPath = props.basePath ? `${props.basePath}/${path}` : path
  return fullPath.replace(/\/+/g, '/')
}

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
  font-size: var(--font-size-base);
  transition: color var(--transition-fast);
}

.menu-badge {
  margin-left: var(--spacing-sm);
}

:deep(.el-sub-menu__title) {
  height: 48px;
  line-height: 48px;
  padding: 0 var(--spacing-lg);
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--bg-hover);
  }

  .el-icon {
    margin-right: var(--spacing-sm);
    font-size: var(--font-size-lg);
    color: var(--text-secondary);
    transition: color var(--transition-fast);
  }
}

:deep(.el-sub-menu.is-active) {
  .el-sub-menu__title {
    color: var(--color-primary);

    .el-icon {
      color: var(--color-primary);
    }
  }
}

:deep(.el-menu) {
  border: none;
  background-color: transparent;
}
</style>
