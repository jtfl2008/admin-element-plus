<template>
  <div class="config-section">
    <div class="section-title">主题模式</div>
    <div class="theme-mode-options">
      <div
        class="mode-option"
        :class="{ active: theme === 'light' }"
        @click="handleChange('light')"
      >
        <el-icon><Sunny /></el-icon>
        <span>亮色</span>
      </div>
      <div
        class="mode-option"
        :class="{ active: theme === 'dark' }"
        @click="handleChange('dark')"
      >
        <el-icon><Moon /></el-icon>
        <span>暗色</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import { Sunny, Moon } from '@element-plus/icons-vue'
import type { ThemeType } from '@/typings/global'

const appStore = useAppStore()

const theme = computed(() => appStore.theme)

function handleChange(value: ThemeType) {
  appStore.setTheme(value)
}
</script>

<style scoped lang="scss">
.config-section {
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .theme-mode-options {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }

  .mode-option {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 64px;
    background-color: var(--bg-secondary);
    border: 1.5px solid var(--border-base);
    border-radius: var(--radius-md);
    cursor: pointer;
    transition: all var(--transition-normal);

    &:hover {
      border-color: var(--color-primary);
      background-color: var(--bg-hover);
    }

    &.active {
      border-color: var(--color-primary);
      background-color: var(--color-primary-light);

      .el-icon {
        color: var(--color-primary);
      }

      span {
        color: var(--color-primary);
        font-weight: 500;
      }
    }

    .el-icon {
      font-size: 20px;
      color: var(--text-secondary);
      transition: color var(--transition-fast);
    }

    span {
      font-size: 12px;
      color: var(--text-secondary);
      transition: all var(--transition-fast);
    }
  }
}
</style>
