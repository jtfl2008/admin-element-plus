<script setup lang="ts">
import { RouterView } from 'vue-router'
import { useAppStore } from '@/stores/modules/app'
import { computed } from 'vue'

const appStore = useAppStore()
const enableAnimation = computed(() => appStore.layoutConfig.enableAnimation)
</script>

<template>
  <RouterView v-slot="{ Component, route }">
    <transition 
      :name="enableAnimation ? 'fade-slide' : ''" 
      mode="out-in"
      appear
    >
      <component :is="Component" :key="route.path" />
    </transition>
  </RouterView>
</template>

<style scoped>
/* App.vue 不再包含具体的布局样式 */
/* 布局样式由各个 layout 组件负责 */

/* 页面切换动画已在 src/styles/index.scss 中定义 */
/* 使用 CSS 变量确保动画流畅（60fps） */
/* 动画使用 transform 和 opacity 优化性能 */
</style>
