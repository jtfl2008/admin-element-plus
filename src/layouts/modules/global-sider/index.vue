<template>
  <aside
    v-show="showSider"
    class="global-sider"
    :class="{ 
      'is-collapsed': collapsed, 
      'is-fixed': fixed,
      'is-mobile': isMobile 
    }"
    :style="siderStyle"
  >
    <!-- Logo 区域 -->
    <div class="sider-logo">
      <GlobalLogo :collapsed="collapsed" />
    </div>

    <!-- 菜单区域 -->
    <div class="sider-menu">
      <GlobalMenu mode="vertical" :collapsed="collapsed" />
    </div>
  </aside>

  <!-- 移动端遮罩层 -->
  <transition name="fade">
    <div
      v-if="isMobile && !collapsed && showSider"
      class="sider-mask"
      @click="handleMaskClick"
    ></div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'
import GlobalLogo from '@/layouts/modules/global-logo/index.vue'
import GlobalMenu from '@/layouts/modules/global-menu/index.vue'

interface Props {
  /** 是否折叠 */
  collapsed?: boolean
  /** 侧边栏宽度 */
  width?: number
  /** 折叠后的宽度 */
  collapsedWidth?: number
  /** 是否固定 */
  fixed?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  width: 200,
  collapsedWidth: 64,
  fixed: true,
})

const appStore = useAppStore()

/**
 * 是否显示侧边栏（水平布局不显示）
 */
const showSider = computed(() => appStore.showSider)

/**
 * 是否为移动端
 */
const isMobile = computed(() => appStore.windowWidth < 768)

/**
 * 侧边栏样式
 */
const siderStyle = computed(() => {
  const width = props.collapsed ? props.collapsedWidth : props.width
  return {
    width: `${width}px`,
  }
})

/**
 * 点击遮罩层关闭侧边栏
 */
function handleMaskClick() {
  if (isMobile.value) {
    appStore.toggleSidebar()
  }
}
</script>

<style scoped lang="scss">
@import '@/styles/mixins/responsive.scss';

.global-sider {
  display: flex;
  flex-direction: column;
  height: 100%;
  background-color: var(--sidebar-bg);
  border-right: 1px solid var(--sidebar-border);
  box-shadow: var(--shadow-sm);
  transition: width var(--duration-base) var(--ease-in-out),
              transform var(--duration-base) var(--ease-in-out);
  overflow: hidden;

  &.is-fixed {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    z-index: var(--z-fixed);
  }

  &.is-collapsed {
    .sider-logo {
      padding: 0 var(--spacing-2);
      justify-content: center;
    }
  }

  /* 移动端样式 */
  &.is-mobile {
    z-index: calc(var(--z-fixed) + 10);
    box-shadow: var(--shadow-2xl);

    &.is-collapsed {
      transform: translateX(-100%);
    }

    &:not(.is-collapsed) {
      transform: translateX(0);
    }
  }

  /* 平板端样式 */
  @include respond-between('md', 'lg') {
    width: 180px !important;

    &.is-collapsed {
      width: 64px !important;
    }
  }
}

.sider-logo {
  flex-shrink: 0;
  height: var(--header-height);
  display: flex;
  align-items: center;
  padding: 0 var(--spacing-4);
  border-bottom: 1px solid var(--sidebar-border);
  transition: padding var(--duration-base) var(--ease-in-out);

  @include respond-to-max('md') {
    padding: 0 var(--spacing-3);
  }
}

.sider-menu {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: var(--spacing-2) 0;

  /* 自定义滚动条样式 */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: var(--scrollbar-thumb);
    border-radius: var(--radius-sm);
    transition: background-color var(--duration-fast);

    &:hover {
      background-color: var(--scrollbar-thumb-hover);
    }
  }

  &::-webkit-scrollbar-track {
    background-color: transparent;
  }

  /* Firefox 滚动条 */
  scrollbar-width: thin;
  scrollbar-color: var(--scrollbar-thumb) transparent;
}

/* 移动端遮罩层 */
.sider-mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--mask-bg);
  backdrop-filter: blur(4px);
  z-index: calc(var(--z-fixed) + 5);
  cursor: pointer;
}

/* 遮罩层淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-base) var(--ease-in-out);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
