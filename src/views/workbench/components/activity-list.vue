<template>
  <div class="activity-list">
    <!-- 加载状态 -->
    <div v-if="loading" class="activity-loading">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 活动列表 -->
    <div v-else-if="displayActivities.length > 0" class="activity-items">
      <div
        v-for="activity in displayActivities"
        :key="activity.id"
        class="activity-item"
      >
        <div class="activity-icon" :style="{ backgroundColor: getActivityColor(activity.type) }">
          <el-icon :color="getActivityIconColor(activity.type)">
            <component :is="getActivityIcon(activity.type)" />
          </el-icon>
        </div>
        <div class="activity-content">
          <div class="activity-text">{{ activity.content }}</div>
          <div class="activity-meta">
            <span class="activity-user">{{ activity.user }}</span>
            <span class="activity-time">{{ formatTime(activity.timestamp) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="activity-empty">
      <el-empty description="暂无活动记录" :image-size="80" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Plus, 
  Edit, 
  Delete, 
  User, 
  MoreFilled 
} from '@element-plus/icons-vue'
import type { Activity } from '@/typings/workbench'

interface ActivityListProps {
  activities: Activity[]
  loading?: boolean
  maxItems?: number
}

const props = withDefaults(defineProps<ActivityListProps>(), {
  loading: false,
  maxItems: 10,
})

// 显示的活动列表（限制数量）
const displayActivities = computed(() => {
  return props.activities.slice(0, props.maxItems)
})

// 获取活动图标
const getActivityIcon = (type: Activity['type']) => {
  const iconMap = {
    create: Plus,
    update: Edit,
    delete: Delete,
    login: User,
    other: MoreFilled,
  }
  return iconMap[type] || MoreFilled
}

// 获取活动颜色
const getActivityColor = (type: Activity['type']) => {
  const colorMap = {
    create: '#e6f7ff',
    update: '#f6ffed',
    delete: '#fff1f0',
    login: '#f9f0ff',
    other: '#f5f5f5',
  }
  return colorMap[type] || '#f5f5f5'
}

// 获取活动图标颜色
const getActivityIconColor = (type: Activity['type']) => {
  const colorMap = {
    create: '#1890ff',
    update: '#52c41a',
    delete: '#ff4d4f',
    login: '#722ed1',
    other: '#8c8c8c',
  }
  return colorMap[type] || '#8c8c8c'
}

// 格式化时间
const formatTime = (date: Date | string) => {
  const dateObj = date instanceof Date ? date : new Date(date)
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  
  return dateObj.toLocaleDateString('zh-CN')
}
</script>

<style scoped lang="scss">
.activity-list {
  width: 100%;
}

.activity-loading {
  padding: var(--spacing-md, 16px);
}

.activity-items {
  max-height: 400px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d9d9d9;
    border-radius: 3px;

    &:hover {
      background-color: #bfbfbf;
    }
  }
}

.activity-item {
  display: flex;
  gap: var(--spacing-sm, 12px);
  padding: var(--spacing-sm, 12px);
  border-bottom: 1px solid var(--color-border, #f0f0f0);
  transition: background-color var(--transition-duration, 0.3s);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--color-bg-1, #fafafa);
  }
}

.activity-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background-color: #f0f0f0;
}

.activity-content {
  flex: 1;
  min-width: 0;
}

.activity-text {
  font-size: 14px;
  color: var(--color-text-1, #333);
  margin-bottom: 4px;
  word-break: break-word;
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  font-size: 12px;
  color: var(--color-text-3, #999);
}

.activity-user {
  font-weight: 500;
}

.activity-time {
  &::before {
    content: '•';
    margin-right: 4px;
  }
}

.activity-empty {
  padding: var(--spacing-lg, 24px);
  text-align: center;
}

// 响应式
@media (max-width: 768px) {
  .activity-item {
    padding: var(--spacing-xs, 8px);
  }

  .activity-icon {
    width: 28px;
    height: 28px;
  }

  .activity-text {
    font-size: 13px;
  }

  .activity-meta {
    font-size: 11px;
  }
}
</style>
