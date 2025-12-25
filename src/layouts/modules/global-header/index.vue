<template>
  <header
    class="global-header"
    :class="{ 'is-fixed': fixed }"
  >
    <!-- 左侧区域 -->
    <div class="header-left">
      <slot name="left">
        <!-- 默认内容：折叠按钮 -->
      </slot>
    </div>

    <!-- 中间区域 -->
    <div class="header-center">
      <slot name="center">
        <!-- 默认内容：水平菜单（水平布局模式） -->
      </slot>
    </div>

    <!-- 右侧区域 -->
    <div class="header-right">
      <slot name="right">
        <!-- 默认内容：搜索、全屏、主题、通知、用户中心 -->
      </slot>
    </div>
  </header>
</template>

<script setup lang="ts">
interface Props {
  /** 是否固定头部 */
  fixed?: boolean
}

withDefaults(defineProps<Props>(), {
  fixed: true,
})
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive.scss';

.global-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: var(--header-height);
  padding: 0 var(--spacing-6);
  background-color: var(--header-bg);
  border-bottom: 1px solid var(--header-border);
  box-shadow: var(--shadow-sm);
  backdrop-filter: blur(8px);
  transition: var(--transition-base);

  &.is-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: var(--z-fixed);
  }

  // 响应式调整
  @include respond-to-max('md') {
    padding: 0 var(--spacing-4);
  }
}

.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);

  @include respond-to-max('md') {
    gap: var(--spacing-2);
  }
}

.header-left {
  flex-shrink: 0;
  min-width: 0;
}

.header-center {
  flex: 1;
  justify-content: center;
  min-width: 0;
}

.header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  @include respond-to-max('md') {
    gap: var(--spacing-1);
  }
}

// 头部操作项统一样式
:deep(.header-action-item) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  flex-shrink: 0;
  border-radius: var(--radius-sm);
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--bg-hover);
  }

  .el-icon {
    font-size: 18px;
    color: var(--text-secondary);
    transition: all var(--transition-normal);
  }

  &:hover .el-icon {
    color: var(--color-primary);
  }
}

// 用户中心特殊样式
:deep(.user-center) {
  width: auto;
  padding: 0 var(--spacing-sm);
}
</style>
