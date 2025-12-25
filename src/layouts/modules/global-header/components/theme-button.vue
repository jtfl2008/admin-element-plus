<template>
  <div class="header-action-item theme-button" @click="handleToggle">
    <el-tooltip :content="isDark ? '切换到亮色模式' : '切换到暗色模式'" placement="bottom">
      <el-icon>
        <Sunny v-if="isDark" />
        <Moon v-else />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { Sunny, Moon } from '@element-plus/icons-vue'

const appStore = useAppStore()

const isDark = computed(() => appStore.theme === 'dark')

function handleToggle() {
  appStore.setTheme(isDark.value ? 'light' : 'dark')
}
</script>

<style scoped lang="scss">
.theme-button {
  cursor: pointer;
  
  .el-icon {
    font-size: 18px;
    color: var(--text-secondary);
    transition: all var(--transition-normal);
  }

  &:hover {
    .el-icon {
      color: var(--color-primary);
      transform: rotate(180deg);
    }
  }
}
</style>
