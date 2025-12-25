<script setup lang="ts">
/**
 * 骨架屏加载组件
 * 用于异步组件加载时的占位显示
 */
import { computed } from 'vue'

interface Props {
  type?: 'card' | 'list' | 'form' | 'table'
  rows?: number
  animated?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'card',
  rows: 3,
  animated: true,
})

const skeletonClass = computed(() => ({
  'loading-skeleton': true,
  'loading-skeleton--animated': props.animated,
}))
</script>

<template>
  <div :class="skeletonClass">
    <!-- 卡片类型骨架屏 -->
    <div v-if="type === 'card'" class="skeleton-card">
      <div class="skeleton-header"></div>
      <div class="skeleton-content">
        <div v-for="i in rows" :key="i" class="skeleton-line"></div>
      </div>
    </div>

    <!-- 列表类型骨架屏 -->
    <div v-else-if="type === 'list'" class="skeleton-list">
      <div v-for="i in rows" :key="i" class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-line skeleton-line--title"></div>
          <div class="skeleton-line skeleton-line--subtitle"></div>
        </div>
      </div>
    </div>

    <!-- 表单类型骨架屏 -->
    <div v-else-if="type === 'form'" class="skeleton-form">
      <div v-for="i in rows" :key="i" class="skeleton-form-item">
        <div class="skeleton-label"></div>
        <div class="skeleton-input"></div>
      </div>
    </div>

    <!-- 表格类型骨架屏 -->
    <div v-else-if="type === 'table'" class="skeleton-table">
      <div class="skeleton-table-header">
        <div v-for="i in 4" :key="i" class="skeleton-table-cell"></div>
      </div>
      <div v-for="i in rows" :key="i" class="skeleton-table-row">
        <div v-for="j in 4" :key="j" class="skeleton-table-cell"></div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.loading-skeleton {
  padding: var(--spacing-4);

  /* 骨架屏动画 */
  &--animated {
    .skeleton-line,
    .skeleton-header,
    .skeleton-avatar,
    .skeleton-label,
    .skeleton-input,
    .skeleton-table-cell {
      position: relative;
      overflow: hidden;
      background: linear-gradient(
        90deg,
        var(--gray-200) 25%,
        var(--gray-100) 37%,
        var(--gray-200) 63%
      );
      background-size: 400% 100%;
      animation: skeleton-loading 1.4s ease infinite;
    }
  }

  /* 卡片骨架屏 */
  .skeleton-card {
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-lg);
    padding: var(--spacing-4);
  }

  .skeleton-header {
    height: 24px;
    border-radius: var(--radius-sm);
    margin-bottom: var(--spacing-4);
    width: 40%;
  }

  .skeleton-content {
    .skeleton-line {
      height: 16px;
      border-radius: var(--radius-sm);
      margin-bottom: var(--spacing-3);
      background-color: var(--gray-200);

      &:last-child {
        width: 60%;
        margin-bottom: 0;
      }
    }
  }

  /* 列表骨架屏 */
  .skeleton-list {
    .skeleton-list-item {
      display: flex;
      align-items: center;
      padding: var(--spacing-3);
      margin-bottom: var(--spacing-2);
      background-color: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: var(--radius-md);

      .skeleton-avatar {
        width: 48px;
        height: 48px;
        border-radius: var(--radius-full);
        background-color: var(--gray-200);
        flex-shrink: 0;
        margin-right: var(--spacing-3);
      }

      .skeleton-list-content {
        flex: 1;

        .skeleton-line {
          height: 16px;
          border-radius: var(--radius-sm);
          background-color: var(--gray-200);

          &--title {
            width: 60%;
            margin-bottom: var(--spacing-2);
          }

          &--subtitle {
            width: 40%;
          }
        }
      }
    }
  }

  /* 表单骨架屏 */
  .skeleton-form {
    .skeleton-form-item {
      margin-bottom: var(--spacing-4);

      .skeleton-label {
        height: 20px;
        width: 100px;
        border-radius: var(--radius-sm);
        background-color: var(--gray-200);
        margin-bottom: var(--spacing-2);
      }

      .skeleton-input {
        height: 32px;
        border-radius: var(--radius-md);
        background-color: var(--gray-200);
      }
    }
  }

  /* 表格骨架屏 */
  .skeleton-table {
    background-color: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: var(--radius-md);
    overflow: hidden;

    .skeleton-table-header,
    .skeleton-table-row {
      display: flex;
      gap: var(--spacing-2);
      padding: var(--spacing-3);
    }

    .skeleton-table-header {
      background-color: var(--table-header-bg);
      border-bottom: 1px solid var(--table-border);
    }

    .skeleton-table-row {
      border-bottom: 1px solid var(--table-border);

      &:last-child {
        border-bottom: none;
      }
    }

    .skeleton-table-cell {
      flex: 1;
      height: 20px;
      border-radius: var(--radius-sm);
      background-color: var(--gray-200);
    }
  }
}

/* 深色模式 */
[data-theme='dark'] {
  .loading-skeleton--animated {
    .skeleton-line,
    .skeleton-header,
    .skeleton-avatar,
    .skeleton-label,
    .skeleton-input,
    .skeleton-table-cell {
      background: linear-gradient(
        90deg,
        var(--gray-dark-200) 25%,
        var(--gray-dark-300) 37%,
        var(--gray-dark-200) 63%
      );
    }
  }

  .skeleton-line,
  .skeleton-avatar,
  .skeleton-label,
  .skeleton-input,
  .skeleton-table-cell {
    background-color: var(--gray-dark-200);
  }
}

/* 骨架屏加载动画 */
@keyframes skeleton-loading {
  0% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0 50%;
  }
}
</style>
