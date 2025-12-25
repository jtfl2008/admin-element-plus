<template>
  <el-breadcrumb class="global-breadcrumb" separator="/">
    <el-breadcrumb-item
      v-for="(item, index) in breadcrumbList"
      :key="item.path || item.label"
      :to="index < breadcrumbList.length - 1 && item.path ? item.path : undefined"
    >
      <span>{{ item.label }}</span>
    </el-breadcrumb-item>
  </el-breadcrumb>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { BreadcrumbItem } from '@/typings/layout'

const route = useRoute()

/**
 * 面包屑列表
 */
const breadcrumbList = computed<BreadcrumbItem[]>(() => {
  // 如果是首页，只显示首页
  if (route.path === '/' || route.path === '/home') {
    return [
      {
        path: '/',
        label: '首页',
      },
    ]
  }

  const breadcrumbs: BreadcrumbItem[] = []

  // 遍历路由的 matched 数组构建面包屑
  route.matched.forEach((routeRecord) => {
    // 跳过没有 meta 或没有 title 的路由
    if (!routeRecord.meta?.title) {
      return
    }

    // 跳过隐藏的路由
    if (routeRecord.meta?.hidden) {
      return
    }

    breadcrumbs.push({
      path: routeRecord.path,
      label: routeRecord.meta.title as string,
    })
  })

  // 如果面包屑为空或第一项不是首页，添加首页
  if (breadcrumbs.length === 0 || (breadcrumbs[0] && breadcrumbs[0].path !== '/')) {
    breadcrumbs.unshift({
      path: '/',
      label: '首页',
    })
  }

  return breadcrumbs
})
</script>

<style scoped lang="scss">
.global-breadcrumb {
  :deep(.el-breadcrumb__item) {
    display: inline-flex;
    align-items: center;

    .el-breadcrumb__inner {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
      font-weight: normal;
      font-size: var(--font-size-sm);
      color: var(--text-secondary);
      transition: color var(--transition-fast);

      &:hover {
        color: var(--color-primary);
      }
    }

    .el-breadcrumb__separator {
      color: var(--text-tertiary);
      margin: 0 var(--spacing-xs);
    }

    &:last-child .el-breadcrumb__inner {
      color: var(--text-primary);
      font-weight: 500;
      cursor: default;

      &:hover {
        color: var(--text-primary);
      }
    }
  }
}
</style>
