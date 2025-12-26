<template>
  <div
    class="data-card"
    :class="{ clickable: clickable, loading: loading }"
    :style="{ borderTopColor: color }"
    @click="handleClick"
  >
    <!-- 加载状态 -->
    <div v-if="loading" class="card-loading">
      <el-skeleton :rows="2" animated />
    </div>

    <!-- 正常内容 -->
    <div v-else class="card-content">
      <!-- 卡片头部 -->
      <div class="card-header">
        <div class="card-title">
          <el-icon v-if="icon" class="card-icon" :style="{ color: color }">
            <component :is="icon" />
          </el-icon>
          <span>{{ title }}</span>
        </div>
        <div v-if="trend" class="card-trend" :class="`trend-${trend}`">
          <el-icon>
            <component :is="trendIcon" />
          </el-icon>
          <span v-if="trendValue !== undefined">{{ formatTrendValue(trendValue) }}%</span>
        </div>
      </div>

      <!-- 卡片主体 -->
      <div class="card-body">
        <div class="card-value">
          {{ formattedValue }}
          <span v-if="unit" class="card-unit">{{ unit }}</span>
        </div>
        <div v-if="compareText" class="card-compare">
          {{ compareText }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { ArrowUp, ArrowDown, Minus } from '@element-plus/icons-vue'
import type { DataCardProps } from '@/typings/workbench'

// Props
const props = withDefaults(defineProps<DataCardProps>(), {
  loading: false,
  clickable: false,
  trend: 'stable',
  color: '#1890ff',
})

// Emits
const emit = defineEmits<{
  click: []
}>()

// 计算趋势图标
const trendIcon = computed(() => {
  switch (props.trend) {
    case 'up':
      return ArrowUp
    case 'down':
      return ArrowDown
    default:
      return Minus
  }
})

// 格式化数值
const formattedValue = computed(() => {
  if (typeof props.value === 'number') {
    // 如果是大数字，使用千分位分隔
    if (props.value >= 1000) {
      return props.value.toLocaleString('zh-CN')
    }
    return props.value.toString()
  }
  return props.value
})

// 格式化趋势值
const formatTrendValue = (value: number) => {
  const absValue = Math.abs(value)
  return value >= 0 ? `+${absValue.toFixed(1)}` : `-${absValue.toFixed(1)}`
}

// 处理点击事件
const handleClick = () => {
  if (props.clickable && !props.loading) {
    emit('click')
  }
}
</script>

<style scoped lang="scss">
.data-card {
  position: relative;
  height: 120px;
  background: var(--color-bg-2, #ffffff);
  border-radius: var(--radius-md, 8px);
  border-top: 3px solid var(--color-primary, #1890ff);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1));
  transition: all var(--transition-duration, 0.3s);
  overflow: hidden;

  &.clickable {
    cursor: pointer;

    &:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-md, 0 4px 12px rgba(0, 0, 0, 0.15));
    }
  }

  &.loading {
    cursor: default;
  }
}

.card-loading {
  padding: var(--spacing-md, 16px);
  height: 100%;
  display: flex;
  align-items: center;
}

.card-content {
  padding: var(--spacing-md, 16px);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm, 8px);
}

.card-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  font-size: 14px;
  color: var(--color-text-2, #666);
  font-weight: 500;

  .card-icon {
    font-size: 18px;
  }
}

.card-trend {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: var(--radius-sm, 4px);

  &.trend-up {
    color: #52c41a;
    background-color: #f6ffed;

    .el-icon {
      color: #52c41a;
    }
  }

  &.trend-down {
    color: #ff4d4f;
    background-color: #fff1f0;

    .el-icon {
      color: #ff4d4f;
    }
  }

  &.trend-stable {
    color: #8c8c8c;
    background-color: #f5f5f5;

    .el-icon {
      color: #8c8c8c;
    }
  }
}

.card-body {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.card-value {
  font-size: 28px;
  font-weight: 600;
  color: var(--color-text-1, #333);
  line-height: 1.2;
  margin-bottom: var(--spacing-xs, 4px);

  .card-unit {
    font-size: 16px;
    font-weight: 400;
    color: var(--color-text-3, #999);
    margin-left: 4px;
  }
}

.card-compare {
  font-size: 12px;
  color: var(--color-text-3, #999);
}

// 响应式
@media (max-width: 768px) {
  .data-card {
    height: 100px;
  }

  .card-value {
    font-size: 24px;

    .card-unit {
      font-size: 14px;
    }
  }

  .card-title {
    font-size: 13px;
  }
}
</style>
