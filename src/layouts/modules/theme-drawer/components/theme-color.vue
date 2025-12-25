<template>
  <div class="theme-color">
    <div class="section-title">主题色</div>
    
    <!-- 预设主题色 -->
    <div class="preset-colors">
      <div
        v-for="color in presetColors"
        :key="color.value"
        class="color-item"
        :class="{ 'is-active': currentColor === color.value }"
        :style="{ backgroundColor: color.value }"
        @click="handleColorChange(color.value)"
      >
        <el-icon v-if="currentColor === color.value" class="check-icon">
          <Check />
        </el-icon>
      </div>
    </div>

    <!-- 自定义主题色 -->
    <div class="custom-color">
      <span class="custom-label">自定义颜色</span>
      <el-color-picker
        v-model="customColor"
        show-alpha
        @change="handleCustomColorChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { Check } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

// 预设主题色
const presetColors = [
  { name: '拂晓蓝', value: '#1890ff' },
  { name: '薄暮', value: '#f5222d' },
  { name: '火山', value: '#fa541c' },
  { name: '日暮', value: '#faad14' },
  { name: '明青', value: '#13c2c2' },
  { name: '极光绿', value: '#52c41a' },
  { name: '极客蓝', value: '#2f54eb' },
  { name: '酱紫', value: '#722ed1' },
]

const customColor = ref('#1890ff')
const currentColor = computed(() => appStore.layoutConfig.themeColor || '#1890ff')

// 监听当前颜色变化
watch(
  currentColor,
  (newColor) => {
    customColor.value = newColor
    applyThemeColor(newColor)
  },
  { immediate: true }
)

/**
 * 选择预设颜色
 */
function handleColorChange(color: string) {
  appStore.updateLayoutConfig({ themeColor: color })
}

/**
 * 自定义颜色变化
 */
function handleCustomColorChange(color: string | null) {
  if (color) {
    appStore.updateLayoutConfig({ themeColor: color })
  }
}

/**
 * 应用主题色到 CSS 变量
 */
function applyThemeColor(color: string) {
  if (!color) return
  
  const root = document.documentElement
  
  // 设置主色
  root.style.setProperty('--color-primary', color)
  
  // 计算并设置浅色和深色变体
  const rgb = hexToRgb(color)
  if (rgb) {
    // 浅色变体 (hover)
    root.style.setProperty('--color-primary-light', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.1)`)
    root.style.setProperty('--color-primary-light-2', `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.2)`)
    
    // 深色变体
    const darker = darkenColor(rgb, 0.2)
    root.style.setProperty('--color-primary-dark', `rgb(${darker.r}, ${darker.g}, ${darker.b})`)
  }
}

/**
 * 十六进制颜色转 RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result || !result[1] || !result[2] || !result[3]) {
    return null
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  }
}

/**
 * 加深颜色
 */
function darkenColor(rgb: { r: number; g: number; b: number }, amount: number) {
  return {
    r: Math.max(0, Math.floor(rgb.r * (1 - amount))),
    g: Math.max(0, Math.floor(rgb.g * (1 - amount))),
    b: Math.max(0, Math.floor(rgb.b * (1 - amount))),
  }
}
</script>

<style scoped lang="scss">
.theme-color {
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .preset-colors {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
    margin-bottom: 12px;
  }

  .color-item {
    position: relative;
    width: 100%;
    height: 32px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: all var(--transition-normal);
    border: 2px solid transparent;

    &:hover {
      transform: scale(1.1);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }

    &.is-active {
      border-color: rgba(0, 0, 0, 0.15);
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
      transform: scale(1.05);
    }

    .check-icon {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      font-size: 16px;
      color: #fff;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.5));
    }
  }

  .custom-color {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 0;

    .custom-label {
      font-size: 12px;
      color: var(--text-secondary);
    }

    :deep(.el-color-picker__trigger) {
      width: 32px;
      height: 32px;
      border-radius: var(--radius-sm);
    }
  }
}
</style>
