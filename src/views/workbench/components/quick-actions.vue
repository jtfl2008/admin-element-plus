<template>
  <div class="quick-actions">
    <el-row :gutter="16">
      <el-col
        v-for="action in visibleActions"
        :key="action.id"
        :xs="12"
        :sm="8"
        :md="8"
        :lg="columns === 6 ? 4 : 6"
      >
        <div
          class="action-item"
          :style="{ borderLeftColor: action.color }"
          @click="handleActionClick(action)"
        >
          <div class="action-icon" :style="{ backgroundColor: `${action.color}15` }">
            <el-icon :size="24" :color="action.color">
              <component :is="action.icon" />
            </el-icon>
          </div>
          <div class="action-content">
            <div class="action-title">{{ action.title }}</div>
            <div class="action-description">{{ action.description }}</div>
          </div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import type { QuickAction } from '@/typings/workbench'

interface QuickActionsProps {
  actions: QuickAction[]
  columns?: number
}

const props = withDefaults(defineProps<QuickActionsProps>(), {
  columns: 6,
})

const router = useRouter()

// 过滤有权限的操作
const visibleActions = computed(() => {
  return props.actions.filter((action) => {
    // TODO: 实现权限检查逻辑
    // if (action.permission) {
    //   return hasPermission(action.permission)
    // }
    return true
  })
})

// 处理操作点击
const handleActionClick = (action: QuickAction) => {
  if (action.route) {
    // 路由跳转
    router.push(action.route)
  } else if (action.action) {
    // 执行自定义操作
    action.action()
  }
}
</script>

<style scoped lang="scss">
.quick-actions {
  width: 100%;
}

.action-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);
  padding: var(--spacing-md, 16px);
  background: var(--color-bg-2, #ffffff);
  border-radius: var(--radius-md, 8px);
  border-left: 3px solid var(--color-primary, #1890ff);
  cursor: pointer;
  transition: all var(--transition-duration, 0.3s);
  margin-bottom: var(--spacing-md, 16px);
  min-height: 80px;

  &:hover {
    transform: translateX(4px);
    box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.15));
  }
}

.action-icon {
  flex-shrink: 0;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md, 8px);
  background-color: rgba(24, 144, 255, 0.1);
}

.action-content {
  flex: 1;
  min-width: 0;
}

.action-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text-1, #333);
  margin-bottom: 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.action-description {
  font-size: 12px;
  color: var(--color-text-3, #999);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

// 响应式
@media (max-width: 768px) {
  .action-item {
    min-height: 70px;
    padding: var(--spacing-sm, 12px);
    gap: var(--spacing-sm, 12px);
  }

  .action-icon {
    width: 40px;
    height: 40px;

    .el-icon {
      font-size: 20px;
    }
  }

  .action-title {
    font-size: 14px;
  }

  .action-description {
    font-size: 11px;
  }
}
</style>
