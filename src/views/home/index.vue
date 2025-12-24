<template>
  <div class="home-page">
    <h1>欢迎使用管理系统</h1>
    <div class="info-card">
      <h2>系统信息</h2>
      <p>当前用户：{{ userInfo?.nickName || '未登录' }}</p>
      <p>用户角色：{{ roles.join(', ') || '无' }}</p>
      <p>权限数量：{{ permissions.length }}</p>
    </div>
    <div class="actions">
      <button class="action-button" @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import { ElMessage } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()

const userInfo = computed(() => authStore.userInfo)
const roles = computed(() => authStore.roles)
const permissions = computed(() => authStore.permissions)

async function handleLogout() {
  try {
    await authStore.logout()
    ElMessage.success('退出登录成功')
    router.push('/login')
  } catch (error) {
    console.error('Logout error:', error)
    ElMessage.error('退出登录失败')
  }
}
</script>

<style scoped>
.home-page {
  padding: 40px;
}

h1 {
  color: #333;
  margin-bottom: 30px;
}

.info-card {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
}

.info-card h2 {
  color: #409eff;
  margin-bottom: 20px;
}

.info-card p {
  margin: 10px 0;
  color: #666;
  font-size: 16px;
}

.actions {
  display: flex;
  gap: 20px;
}

.action-button {
  padding: 12px 32px;
  background: #f56c6c;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.action-button:hover {
  background: #f78989;
}
</style>
