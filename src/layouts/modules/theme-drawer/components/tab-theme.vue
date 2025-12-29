<template>
  <div class="tab-theme-config">
    <div class="config-title">
      <el-icon><Grid /></el-icon>
      <span>标签页主题</span>
    </div>
    
    <div class="theme-options">
      <div
        v-for="theme in themes"
        :key="theme.value"
        class="theme-option"
        :class="{ active: currentTheme === theme.value }"
        @click="handleThemeChange(theme.value)"
      >
        <div class="theme-preview" :class="`preview-${theme.value}`">
          <div class="preview-tabs">
            <div class="preview-tab"></div>
            <div class="preview-tab active"></div>
            <div class="preview-tab"></div>
          </div>
        </div>
        <div class="theme-info">
          <div class="theme-name">{{ theme.label }}</div>
          <div class="theme-desc">{{ theme.description }}</div>
        </div>
        <el-icon v-if="currentTheme === theme.value" class="check-icon">
          <CircleCheck />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Grid, CircleCheck } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

/**
 * 主题选项
 */
const themes = [
  {
    value: 'card',
    label: '卡片',
    description: '清晰的视觉分隔，适合传统界面'
  },
  {
    value: 'button',
    label: '按钮',
    description: '紧凑现代，适合空间有限场景'
  },
  {
    value: 'underline',
    label: '下划线',
    description: '简洁优雅，适合极简设计'
  }
] as const

/**
 * 当前主题
 */
const currentTheme = computed(() => appStore.layoutConfig.tabTheme || 'card')

/**
 * 切换主题
 */
function handleThemeChange(theme: 'card' | 'button' | 'underline') {
  console.log('[TabTheme] 切换主题:', theme)
  appStore.updateLayoutConfig({ tabTheme: theme })
  console.log('[TabTheme] 更新后的配置:', appStore.layoutConfig.tabTheme)
}
</script>

<style scoped lang="scss">
.tab-theme-config {
  .config-title {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: var(--color-text-1, #333);
    margin-bottom: 16px;

    .el-icon {
      font-size: 16px;
      color: var(--color-text-2, #666);
    }
  }

  .theme-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .theme-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px;
    border: 2px solid var(--color-border, #e5e5e5);
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s;
    position: relative;

    &:hover {
      border-color: var(--color-primary, #1890ff);
      background-color: var(--color-primary-light-1, #f0f7ff);
    }

    &.active {
      border-color: var(--color-primary, #1890ff);
      background-color: var(--color-primary-light-1, #f0f7ff);
    }

    .theme-preview {
      flex-shrink: 0;
      width: 60px;
      height: 40px;
      background-color: var(--color-bg-1, #f5f5f5);
      border-radius: 4px;
      padding: 8px 6px;
      display: flex;
      align-items: center;
      justify-content: center;

      .preview-tabs {
        display: flex;
        gap: 3px;
        width: 100%;
      }

      .preview-tab {
        flex: 1;
        height: 16px;
        background-color: var(--color-bg-2, #ffffff);
        border-radius: 2px;
        transition: all 0.3s;

        &.active {
          background-color: var(--color-primary, #1890ff);
        }
      }

      /* 卡片主题预览 */
      &.preview-card {
        .preview-tab {
          border: 1px solid var(--color-border, #e5e5e5);
          border-radius: 3px;

          &.active {
            border-color: var(--color-primary, #1890ff);
            box-shadow: 0 1px 3px rgba(24, 144, 255, 0.3);
          }
        }
      }

      /* 按钮主题预览 */
      &.preview-button {
        .preview-tab {
          background-color: var(--color-bg-3, #e8e8e8);
          border-radius: 2px;

          &.active {
            background-color: var(--color-primary, #1890ff);
          }
        }
      }

      /* 下划线主题预览 */
      &.preview-underline {
        .preview-tab {
          background-color: transparent;
          border-bottom: 2px solid transparent;
          border-radius: 0;

          &.active {
            border-bottom-color: var(--color-primary, #1890ff);
          }
        }
      }
    }

    .theme-info {
      flex: 1;
      min-width: 0;

      .theme-name {
        font-size: 14px;
        font-weight: 500;
        color: var(--color-text-1, #333);
        margin-bottom: 4px;
      }

      .theme-desc {
        font-size: 12px;
        color: var(--color-text-3, #999);
        line-height: 1.4;
      }
    }

    .check-icon {
      flex-shrink: 0;
      font-size: 20px;
      color: var(--color-primary, #1890ff);
    }
  }
}
</style>
