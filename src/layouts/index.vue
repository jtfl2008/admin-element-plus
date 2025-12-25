<template>
  <component :is="layoutComponent" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import DefaultLayout from './default/index.vue'
import HorizontalLayout from './horizontal/index.vue'
import MixLayout from './mix/index.vue'

const appStore = useAppStore()

/**
 * 根据布局模式选择对应的布局组件
 */
const layoutComponent = computed(() => {
  const layoutMode = appStore.layoutConfig.layoutMode
  
  switch (layoutMode) {
    case 'horizontal':
      return HorizontalLayout
    case 'mix':
      return MixLayout
    case 'vertical':
    default:
      return DefaultLayout
  }
})
</script>
