<template>
  <el-menu
    :mode="mode"
    :collapse="collapsed && mode === 'vertical'"
    :default-active="activeKey"
    :unique-opened="false"
    :collapse-transition="false"
    class="global-menu"
    @select="handleSelect"
  >
    <template v-for="item in visibleItems" :key="item.path || item.name">
      <SubMenu v-if="item.children && item.children.length > 0" :item="item" :base-path="item.path || ''" />
      <MenuItem v-else :item="item" :base-path="''" />
    </template>
  </el-menu>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRouteStore } from '@/stores/modules/route'
import { useAuthStore } from '@/stores/modules/auth'
import MenuItem from './components/menu-item.vue'
import SubMenu from './components/sub-menu.vue'
import type { RouteConfig } from '@/typings/router'

interface Props {
  /** 菜单模式 */
  mode?: 'vertical' | 'horizontal'
  /** 是否折叠（仅垂直模式） */
  collapsed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'vertical',
  collapsed: false,
})

const route = useRoute()
const router = useRouter()
const routeStore = useRouteStore()
const authStore = useAuthStore()

/**
 * 当前激活的菜单项
 */
const activeKey = computed(() => route.path)

/**
 * 可见的菜单项（过滤隐藏项和无权限项）
 * 使用 computed 缓存结果,避免不必要的重新计算
 */
const visibleItems = computed(() => {
  // 确保 menuList 存在且是数组
  if (!routeStore.menuList || !Array.isArray(routeStore.menuList)) {
    return []
  }
  return filterMenuItems(routeStore.menuList)
})

/**
 * 过滤菜单项
 */
function filterMenuItems(items: RouteConfig[]): RouteConfig[] {
  return items.filter((item) => {
    // 过滤隐藏的菜单项
    if (item.meta?.hidden) {
      return false
    }

    // 检查权限
    if (item.meta?.permissions && item.meta.permissions.length > 0) {
      const hasPermission = item.meta.permissions.some((permission) =>
        authStore.permissions.includes(permission)
      )
      if (!hasPermission && !authStore.permissions.includes('*:*:*')) {
        return false
      }
    }

    return true
  }).map((item) => {
    // 创建新对象，避免修改原对象
    const newItem = { ...item }
    
    // 递归过滤子菜单
    if (newItem.children && newItem.children.length > 0) {
      newItem.children = filterMenuItems(newItem.children)
    }
    
    return newItem
  })
}

/**
 * 处理菜单选择
 */
function handleSelect(key: string) {
  if (key && key !== route.path) {
    router.push(key)
  }
}
</script>

<style scoped lang="scss">
.global-menu {
  border: none;
  
  &.el-menu--vertical {
    height: 100%;
  }

  &.el-menu--horizontal {
    border-bottom: none;
  }
}
</style>
