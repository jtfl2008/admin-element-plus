<script setup lang="ts">
/**
 * 加载旋转器组件
 * 用于显示加载状态
 */
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  color?: string
  text?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  color: 'var(--primary-500)',
})

const sizeMap = {
  small: '24px',
  medium: '40px',
  large: '56px',
}

const spinnerSize = computed(() => sizeMap[props.size])
</script>

<template>
  <div class="loading-spinner">
    <div 
      class="spinner" 
      :style="{ 
        width: spinnerSize, 
        height: spinnerSize,
        borderColor: `${color} transparent transparent transparent`
      }"
    ></div>
    <p v-if="text" class="loading-text">{{ text }}</p>
  </div>
</template>

<style scoped lang="scss">
.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
}

.spinner {
  border: 3px solid;
  border-radius: var(--radius-full);
  animation: spin var(--duration-slow) linear infinite;
  will-change: transform;
}

.loading-text {
  margin-top: var(--spacing-3);
  color: var(--text-secondary);
  font-size: var(--text-sm);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
