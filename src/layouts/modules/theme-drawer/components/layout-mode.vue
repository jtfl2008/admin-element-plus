<template>
  <div class="config-section">
    <div class="section-title">布局模式</div>
    <div class="layout-mode-options">
      <div
        class="mode-option"
        :class="{ active: layoutMode === 'vertical' }"
        @click="handleChange('vertical')"
      >
        <div class="mode-preview vertical">
          <div class="preview-sider"></div>
          <div class="preview-main">
            <div class="preview-header"></div>
            <div class="preview-content"></div>
          </div>
        </div>
        <span>垂直布局</span>
      </div>

      <div
        class="mode-option"
        :class="{ active: layoutMode === 'horizontal' }"
        @click="handleChange('horizontal')"
      >
        <div class="mode-preview horizontal">
          <div class="preview-header"></div>
          <div class="preview-content"></div>
        </div>
        <span>水平布局</span>
      </div>

      <div
        class="mode-option"
        :class="{ active: layoutMode === 'mix' }"
        @click="handleChange('mix')"
      >
        <div class="mode-preview mix">
          <div class="preview-header"></div>
          <div class="preview-body">
            <div class="preview-sider"></div>
            <div class="preview-content"></div>
          </div>
        </div>
        <span>混合布局</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import type { LayoutMode } from '@/typings/layout'

const appStore = useAppStore()

const layoutMode = computed(() => appStore.layoutConfig.layoutMode)

function handleChange(value: LayoutMode) {
  appStore.setLayoutMode(value)
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

  .layout-mode-options {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .mode-option {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 10px;
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

      span {
        color: var(--color-primary);
        font-weight: 500;
      }
    }

    span {
      font-size: 12px;
      color: var(--text-secondary);
      min-width: 56px;
      transition: all var(--transition-fast);
    }
  }

  .mode-preview {
    flex: 1;
    height: 48px;
    background-color: var(--bg-primary);
    border: 1px solid var(--border-light);
    border-radius: var(--radius-sm);
    overflow: hidden;

    &.vertical {
      display: flex;

      .preview-sider {
        width: 28%;
        background-color: var(--color-primary-light-2);
      }

      .preview-main {
        flex: 1;
        display: flex;
        flex-direction: column;

        .preview-header {
          height: 22%;
          background-color: var(--color-primary-light);
        }

        .preview-content {
          flex: 1;
          background-color: var(--bg-secondary);
        }
      }
    }

    &.horizontal {
      display: flex;
      flex-direction: column;

      .preview-header {
        height: 28%;
        background-color: var(--color-primary-light-2);
      }

      .preview-content {
        flex: 1;
        background-color: var(--bg-secondary);
      }
    }

    &.mix {
      display: flex;
      flex-direction: column;

      .preview-header {
        height: 24%;
        background-color: var(--color-primary-light-2);
      }

      .preview-body {
        flex: 1;
        display: flex;

        .preview-sider {
          width: 28%;
          background-color: var(--color-primary-light);
        }

        .preview-content {
          flex: 1;
          background-color: var(--bg-secondary);
        }
      }
    }
  }
}
</style>
