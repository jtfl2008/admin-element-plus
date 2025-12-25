<template>
  <button class="collapse-button" @click="handleToggle">
    <el-icon>
      <component :is="collapsed ? 'Expand' : 'Fold'" />
    </el-icon>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { Expand, Fold } from '@element-plus/icons-vue'

const appStore = useAppStore()

const collapsed = computed(() => appStore.sidebarCollapsed)

function handleToggle() {
  appStore.toggleSidebar()
}
</script>

<style scoped lang="scss">
.collapse-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--bg-hover);
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }

  .el-icon {
    font-size: var(--font-size-lg);
    color: var(--text-primary);
    transition: color var(--transition-fast);
  }
}
</style>
