<template>
  <footer v-if="layoutConfig.showFooter" class="global-footer">
    <div class="footer-content">
      <span>© 2024 管理系统. All rights reserved.</span>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()
const layoutConfig = computed(() => appStore.layoutConfig)
</script>

<style scoped lang="scss">
.global-footer {
  flex-shrink: 0;
  padding: var(--spacing-md) var(--spacing-lg);
  background-color: var(--bg-primary);
  border-top: 1px solid var(--border-light);
  transition: background-color var(--transition-normal);
}

.footer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--font-size-sm);
  color: var(--text-tertiary);
}
</style>
