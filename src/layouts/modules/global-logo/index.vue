<template>
  <div class="global-logo" :class="{ collapsed }" @click="handleClick">
    <div class="logo-image">
      <img v-if="logoUrl" :src="logoUrl" alt="Logo" />
      <span v-else class="logo-placeholder">{{ logoText }}</span>
    </div>
    <!-- <transition name="fade">
      <div v-if="!collapsed" class="logo-title">
        {{ title }}
      </div>
    </transition> -->
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

interface Props {
  /** 是否折叠（折叠时只显示图标） */
  collapsed?: boolean
  /** Logo 图片 URL */
  logoUrl?: string
  /** Logo 文字（当没有图片时显示） */
  logoText?: string
  /** 系统标题 */
  title?: string
}

const props = withDefaults(defineProps<Props>(), {
  collapsed: false,
  logoUrl: '',
  logoText: 'R',
  title: import.meta.env.VITE_APP_TITLE || 'RuoYi-Plus-Soybean',
})

const router = useRouter()

/**
 * 点击 Logo 跳转到首页
 */
function handleClick() {
  router.push('/')
}
</script>

<style scoped lang="scss">
.global-logo {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  cursor: pointer;
  transition: var(--transition-opacity);
  user-select: none;

  &:hover {
    opacity: 0.8;
  }

  &.collapsed {
    justify-content: center;
  }
}

.logo-image {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-md);
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  .logo-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xl);
    font-weight: var(--font-bold);
    color: var(--primary-600);
    background: var(--primary-50);
    border-radius: var(--radius-md);
  }
}

.logo-title {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

/* 淡入淡出动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity var(--duration-base);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
