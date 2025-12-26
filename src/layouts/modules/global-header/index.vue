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
  height: 60px;
  padding: 0 var(--spacing-lg, 24px);
  background-color: var(--color-bg-2, #ffffff);
  border-bottom: 1px solid var(--color-border, #e5e5e5);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  backdrop-filter: blur(8px);
  transition: all var(--transition-duration, 0.3s);

  &.is-fixed {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1000;
  }

  // 响应式调整
  @include respond-to-max('md') {
    padding: 0 var(--spacing-md, 16px);
    height: 56px;
  }
}

.header-left,
.header-center,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--spacing-md, 16px);

  @include respond-to-max('md') {
    gap: var(--spacing-sm, 12px);
  }
}

.header-left {
  flex-shrink: 0;
  min-width: 0;
  gap: var(--spacing-lg, 20px);

  @include respond-to-max('md') {
    gap: var(--spacing-md, 16px);
  }
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
  gap: var(--spacing-sm, 12px);

  @include respond-to-max('md') {
    gap: var(--spacing-xs, 8px);
  }
}

// 头部操作项统一样式
:deep(.header-action-item) {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: var(--radius-md, 8px);
  transition: all var(--transition-duration, 0.3s);
  cursor: pointer;

  &:hover {
    background-color: var(--color-bg-1, #f5f5f5);
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }

  .el-icon {
    font-size: 20px;
    color: var(--color-text-2, #666);
    transition: all var(--transition-duration, 0.3s);
  }

  &:hover .el-icon {
    color: var(--color-primary, #1890ff);
  }
}

// 用户中心特殊样式
:deep(.user-center) {
  width: auto;
  padding: 0 var(--spacing-md, 16px);
  height: 40px;
  border-radius: var(--radius-md, 8px);

  &:hover {
    background-color: var(--color-bg-1, #f5f5f5);
  }
}
</style>
