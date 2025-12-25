<template>
  <el-dropdown trigger="click" @command="handleCommand">
    <div class="user-center">
      <el-avatar :size="28" :src="userInfo.avatar">
        <el-icon><User /></el-icon>
      </el-avatar>
      <span class="user-name">{{ userInfo.username }}</span>
    </div>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item command="profile">
          <el-icon><User /></el-icon>
          <span>个人中心</span>
        </el-dropdown-item>
        <el-dropdown-item command="settings">
          <el-icon><Setting /></el-icon>
          <span>系统设置</span>
        </el-dropdown-item>
        <el-dropdown-item divided command="logout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import { ElMessageBox } from 'element-plus'
import { User, Setting, SwitchButton } from '@element-plus/icons-vue'

const router = useRouter()
const authStore = useAuthStore()

const userInfo = computed(() => {
  const info = authStore.userInfo
  return {
    username: info?.nickName || info?.userName || '用户',
    avatar: info?.avatar || '',
  }
})

async function handleCommand(command: string) {
  switch (command) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      await handleLogout()
      break
  }
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning',
    })

    await authStore.logout()
    router.push('/login')
  } catch (error) {
    // 用户取消
  }
}
</script>

<style scoped lang="scss">
.user-center {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  height: 36px;
  padding: 0 var(--spacing-sm);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--bg-hover);
  }
}

.user-name {
  font-size: var(--font-size-sm);
  color: var(--text-secondary);
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color var(--transition-fast);

  .user-center:hover & {
    color: var(--color-primary);
  }
}

:deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--bg-hover);
  }
}
</style>
