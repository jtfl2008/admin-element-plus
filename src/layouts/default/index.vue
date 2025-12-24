<template>
  <div class="layout-default">
    <div class="layout-header">
      <h1>管理系统</h1>
    </div>
    <div class="layout-container">
      <aside class="layout-sidebar" :class="{ collapsed: sidebarCollapsed }">
        <nav class="sidebar-menu">
          <!-- 侧边栏菜单 -->
          <p>侧边栏菜单</p>
        </nav>
      </aside>
      <main class="layout-main">
        <div class="main-content">
          <router-view />
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()
const sidebarCollapsed = computed(() => appStore.sidebarCollapsed)
</script>

<style scoped>
.layout-default {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.layout-header {
  height: 60px;
  background: #001529;
  color: white;
  display: flex;
  align-items: center;
  padding: 0 20px;
}

.layout-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.layout-sidebar {
  width: 200px;
  background: #001529;
  color: white;
  transition: width 0.3s;
  overflow: hidden;
}

.layout-sidebar.collapsed {
  width: 64px;
}

.sidebar-menu {
  padding: 20px;
}

.layout-main {
  flex: 1;
  overflow: auto;
  background: #f0f2f5;
}

.main-content {
  padding: 20px;
}
</style>
