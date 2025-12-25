<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="header-action-item notice-button">
      <el-tooltip content="通知消息" placement="bottom">
        <el-badge :value="unreadCount" :hidden="unreadCount === 0">
          <el-icon>
            <Bell />
          </el-icon>
        </el-badge>
      </el-tooltip>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <div class="notice-header">
          <span>通知消息</span>
          <el-link v-if="unreadCount > 0" type="primary" underline="never" @click="handleMarkAllRead">
            全部已读
          </el-link>
        </div>
        <el-scrollbar max-height="300px">
          <div v-if="noticeList.length === 0" class="notice-empty">
            <el-empty description="暂无通知" :image-size="60" />
          </div>
          <el-dropdown-item
            v-for="item in noticeList"
            :key="item.id"
            :command="item.id"
            :class="{ 'is-unread': !item.read }"
          >
            <div class="notice-item">
              <div class="notice-title">{{ item.title }}</div>
              <div class="notice-time">{{ item.time }}</div>
            </div>
          </el-dropdown-item>
        </el-scrollbar>
        <div class="notice-footer">
          <el-link type="primary" underline="never">查看全部</el-link>
        </div>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Bell } from '@element-plus/icons-vue'

interface NoticeItem {
  id: string
  title: string
  time: string
  read: boolean
}

// 模拟通知数据
const noticeList = ref<NoticeItem[]>([
  {
    id: '1',
    title: '欢迎使用本系统',
    time: '2小时前',
    read: false,
  },
])

const unreadCount = computed(() => {
  return noticeList.value.filter((item) => !item.read).length
})

function handleCommand(id: string) {
  const notice = noticeList.value.find((item) => item.id === id)
  if (notice) {
    notice.read = true
  }
}

function handleMarkAllRead() {
  noticeList.value.forEach((item) => {
    item.read = true
  })
}
</script>

<style scoped lang="scss">
.notice-button {
  cursor: pointer;
  
  .el-icon {
    font-size: 18px;
    color: var(--text-secondary);
    transition: all var(--transition-normal);
  }

  &:hover {
    .el-icon {
      color: var(--color-primary);
    }
  }
}

.notice-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-sm) var(--spacing-md);
  border-bottom: 1px solid var(--border-light);
  font-weight: 500;
  font-size: var(--font-size-base);
  color: var(--text-primary);
}

.notice-empty {
  padding: var(--spacing-lg);
}

.notice-item {
  padding: var(--spacing-xs) 0;
  
  .notice-title {
    font-size: var(--font-size-base);
    color: var(--text-primary);
    margin-bottom: var(--spacing-xs);
  }

  .notice-time {
    font-size: var(--font-size-sm);
    color: var(--text-secondary);
  }
}

:deep(.el-dropdown-menu__item) {
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all var(--transition-fast);

  &.is-unread {
    background-color: var(--bg-secondary);
  }

  &:hover {
    background-color: var(--bg-hover);
  }
}

.notice-footer {
  padding: var(--spacing-sm) var(--spacing-md);
  border-top: 1px solid var(--border-light);
  text-align: center;
}
</style>
