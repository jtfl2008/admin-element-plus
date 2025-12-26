<template>
  <div class="chart-card">
    <!-- 图表容器 -->
    <div v-if="!loading" ref="chartRef" class="chart-container" :style="{ height: `${height}px` }"></div>
    
    <!-- 加载状态 -->
    <div v-else class="chart-loading">
      <el-skeleton :rows="5" animated />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, nextTick, computed } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import type { ChartData } from '@/typings/workbench'
import { useAppStore } from '@/stores/modules/app'

interface ChartCardProps {
  title?: string
  chartType: 'line' | 'bar' | 'pie' | 'area'
  data: ChartData
  loading?: boolean
  height?: number
}

const props = withDefaults(defineProps<ChartCardProps>(), {
  loading: false,
  height: 300,
})

const appStore = useAppStore()
const chartRef = ref<HTMLElement>()
let chartInstance: ECharts | null = null

// 主题颜色配置
const themeColors = computed(() => {
  const isDark = appStore.theme === 'dark'
  return {
    textColor: isDark ? '#e5e5e5' : '#666',
    axisLineColor: isDark ? '#4a4a4a' : '#e5e5e5',
    splitLineColor: isDark ? '#3a3a3a' : '#f0f0f0',
    backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
  }
})

// 初始化图表
const initChart = () => {
  if (!chartRef.value) return

  // 根据主题初始化图表
  chartInstance = echarts.init(chartRef.value, appStore.theme === 'dark' ? 'dark' : undefined)
  updateChart()
}

// 更新图表
const updateChart = () => {
  if (!chartInstance) return

  const option = getChartOption()
  chartInstance.setOption(option, true)
}

// 获取图表配置
const getChartOption = () => {
  const colors = themeColors.value
  
  const baseOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow',
      },
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: props.data.labels,
      axisLine: {
        lineStyle: {
          color: colors.axisLineColor,
        },
      },
      axisLabel: {
        color: colors.textColor,
      },
    },
    yAxis: {
      type: 'value',
      axisLine: {
        lineStyle: {
          color: colors.axisLineColor,
        },
      },
      axisLabel: {
        color: colors.textColor,
      },
      splitLine: {
        lineStyle: {
          color: colors.splitLineColor,
        },
      },
    },
    series: props.data.datasets.map((dataset) => ({
      name: dataset.name,
      type: props.chartType === 'area' ? 'line' : props.chartType,
      data: dataset.data,
      smooth: props.chartType === 'line' || props.chartType === 'area',
      areaStyle: props.chartType === 'area' ? {} : undefined,
      itemStyle: {
        color: dataset.color || '#1890ff',
      },
    })),
  }

  // 饼图特殊配置
  if (props.chartType === 'pie') {
    return {
      tooltip: {
        trigger: 'item',
      },
      legend: {
        orient: 'vertical',
        left: 'left',
        textStyle: {
          color: colors.textColor,
        },
      },
      series: [
        {
          name: props.title || '数据',
          type: 'pie',
          radius: '50%',
          data: props.data.labels.map((label, index) => ({
            name: label,
            value: props.data.datasets[0]?.data[index] || 0,
          })),
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      ],
    }
  }

  return baseOption
}

// 响应式调整
const handleResize = () => {
  chartInstance?.resize()
}

// 监听主题变化
watch(
  () => appStore.theme,
  () => {
    // 销毁旧实例并重新创建
    if (chartInstance) {
      chartInstance.dispose()
      chartInstance = null
    }
    nextTick(() => {
      initChart()
    })
  }
)

// 监听数据变化
watch(
  () => props.data,
  () => {
    nextTick(() => {
      updateChart()
    })
  },
  { deep: true }
)

// 监听加载状态
watch(
  () => props.loading,
  (newVal) => {
    if (!newVal) {
      nextTick(() => {
        initChart()
      })
    }
  }
)

onMounted(() => {
  if (!props.loading) {
    initChart()
  }
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  chartInstance?.dispose()
})
</script>

<style scoped lang="scss">
.chart-card {
  width: 100%;
}

.chart-container {
  width: 100%;
}

.chart-loading {
  padding: var(--spacing-md, 16px);
}
</style>
