<template>
  <div class="notification-card">
    <!-- 加载状态 -->
    <div v-if="loading" class="notification-loading">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 通知列表 -->
    <div v-else-if="displayNotifications.length > 0" class="notification-items">
      <div
        v-for="notification in displayNotifications"
        :key="notification.id"
        class="notification-item"
        :class="{ unread: !notification.read }"
        @click="handleNotificationClick(notification)"
      >
        <div class="notification-header">
          <div class="notification-title-wrapper">
            <el-icon
              :size="16"
              :color="getNotificationColor(notification.type)"
              class="notification-type-icon"
            >
              <component :is="getNotificationIcon(notification.type)" />
            </el-icon>
            <span class="notification-title">{{ notification.title }}</span>
            <el-badge v-if="!notification.read" is-dot class="unread-badge" />
          </div>
          <span class="notification-time">{{ formatTime(notification.timestamp) }}</span>
        </div>
        <div class="notification-content">{{ notification.content }}</div>
      </div>
    </div>

    <!-- 空状态 -->
    <div v-else class="notification-empty">
      <el-empty description="暂无通知" :image-size="80" />
    </div>

    <!-- 全部已读按钮 -->
    <div v-if="hasUnread && displayNotifications.length > 0" class="notification-footer">
      <el-button text type="primary" size="small" @click="handleMarkAllRead">
        全部标记为已读
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { 
  Warning, 
  InfoFilled, 
  SuccessFilled 
} from '@element-plus/icons-vue'
import type { Notification } from '@/typings/workbench'

interface NotificationCardProps {
  notifications: Notification[]
  maxItems?: number
  loading?: boolean
}

const props = withDefaults(defineProps<NotificationCardProps>(), {
  maxItems: 10,
  loading: false,
})

const emit = defineEmits<{
  read: [id: string]
  click: [notification: Notification]
  markAllRead: []
}>()

// 显示的通知列表（按优先级排序并限制数量）
const displayNotifications = computed(() => {
  const sorted = [...props.notifications].sort((a, b) => {
    // 未读优先
    if (a.read !== b.read) return a.read ? 1 : -1
    // 重要程度排序
    const typeOrder = { important: 0, normal: 1, info: 2 }
    if (typeOrder[a.type] !== typeOrder[b.type]) {
      return typeOrder[a.type] - typeOrder[b.type]
    }
    // 时间倒序
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  })
  return sorted.slice(0, props.maxItems)
})

// 是否有未读通知
const hasUnread = computed(() => {
  return props.notifications.some((n) => !n.read)
})

// 获取通知图标
const getNotificationIcon = (type: Notification['type']) => {
  const iconMap = {
    important: Warning,
    normal: InfoFilled,
    info: SuccessFilled,
  }
  return iconMap[type] || InfoFilled
}

// 获取通知颜色
const getNotificationColor = (type: Notification['type']) => {
  const colorMap = {
    important: '#ff4d4f',
    normal: '#1890ff',
    info: '#52c41a',
  }
  return colorMap[type] || '#1890ff'
}

// 处理通知点击
const handleNotificationClick = (notification: Notification) => {
  if (!notification.read) {
    emit('read', notification.id)
  }
  emit('click', notification)
}

// 全部标记为已读
const handleMarkAllRead = () => {
  emit('markAllRead')
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
.notification-card {
  width: 100%;
}

.notification-loading {
  padding: var(--spacing-md, 16px);
}

.notification-items {
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

.notification-item {
  padding: var(--spacing-sm, 12px);
  border-bottom: 1px solid var(--color-border, #f0f0f0);
  cursor: pointer;
  transition: background-color var(--transition-duration, 0.3s);

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--color-bg-1, #fafafa);
  }

  &.unread {
    background-color: #e6f7ff;

    &:hover {
      background-color: #bae7ff;
    }
  }
}

.notification-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
  gap: var(--spacing-sm, 8px);
}

.notification-title-wrapper {
  display: flex;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 0;
}

.notification-type-icon {
  flex-shrink: 0;
}

.notification-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text-1, #333);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.unread-badge {
  flex-shrink: 0;
}

.notification-time {
  flex-shrink: 0;
  font-size: 12px;
  color: var(--color-text-3, #999);
}

.notification-content {
  font-size: 13px;
  color: var(--color-text-2, #666);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.notification-empty {
  padding: var(--spacing-lg, 24px);
  text-align: center;
}

.notification-footer {
  padding: var(--spacing-sm, 12px);
  border-top: 1px solid var(--color-border, #f0f0f0);
  text-align: center;
}

// 响应式
@media (max-width: 768px) {
  .notification-item {
    padding: var(--spacing-xs, 8px);
  }

  .notification-title {
    font-size: 13px;
  }

  .notification-content {
    font-size: 12px;
  }

  .notification-time {
    font-size: 11px;
  }
}
</style>
