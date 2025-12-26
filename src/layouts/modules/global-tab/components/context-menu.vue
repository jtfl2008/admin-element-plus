<template>
  <Teleport to="body">
    <div
      v-show="visible"
      ref="menuRef"
      class="context-menu"
      :style="menuStyle"
      @click="handleClose"
    >
      <div class="menu-item" @click="handleRefresh">
        <el-icon><Refresh /></el-icon>
        <span>刷新</span>
      </div>
      <div
        v-if="tab?.closable"
        class="menu-item"
        @click="handleCloseTab"
      >
        <el-icon><Close /></el-icon>
        <span>关闭</span>
      </div>
      <div class="menu-divider" />
      <div class="menu-item" @click="handleCloseOther">
        <el-icon><CircleClose /></el-icon>
        <span>关闭其他</span>
      </div>
      <div class="menu-item" @click="handleCloseLeft">
        <el-icon><Back /></el-icon>
        <span>关闭左侧</span>
      </div>
      <div class="menu-item" @click="handleCloseRight">
        <el-icon><Right /></el-icon>
        <span>关闭右侧</span>
      </div>
      <div class="menu-divider" />
      <div class="menu-item" @click="handleCloseAll">
        <el-icon><CircleCloseFilled /></el-icon>
        <span>关闭所有</span>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { Refresh, Close, CircleClose, Back, Right, CircleCloseFilled } from '@element-plus/icons-vue'
import type { TabItem } from '@/typings/layout'

interface Props {
  visible: boolean
  x: number
  y: number
  tab: TabItem | null
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'refresh'): void
  (e: 'close'): void
  (e: 'close-other'): void
  (e: 'close-left'): void
  (e: 'close-right'): void
  (e: 'close-all'): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const menuRef = ref<HTMLElement>()

const menuStyle = computed(() => {
  return {
    left: `${props.x}px`,
    top: `${props.y}px`,
  }
})

function handleClose() {
  emit('update:visible', false)
}

function handleRefresh() {
  emit('refresh')
  handleClose()
}

function handleCloseTab() {
  emit('close')
  handleClose()
}

function handleCloseOther() {
  emit('close-other')
  handleClose()
}

function handleCloseLeft() {
  emit('close-left')
  handleClose()
}

function handleCloseRight() {
  emit('close-right')
  handleClose()
}

function handleCloseAll() {
  emit('close-all')
  handleClose()
}

/**
 * 点击外部关闭菜单
 */
function handleClickOutside(e: MouseEvent) {
  if (menuRef.value && !menuRef.value.contains(e.target as Node)) {
    handleClose()
  }
}

watch(
  () => props.visible,
  (visible) => {
    if (visible) {
      document.addEventListener('click', handleClickOutside)
    } else {
      document.removeEventListener('click', handleClickOutside)
    }
  }
)

onMounted(() => {
  if (props.visible) {
    document.addEventListener('click', handleClickOutside)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped lang="scss">
.context-menu {
  position: fixed;
  z-index: 9999;
  min-width: 160px;
  background-color: var(--color-bg-2, #ffffff);
  border: 1px solid var(--color-border, #e5e5e5);
  border-radius: var(--radius-lg, 12px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: var(--spacing-xs, 8px);
  backdrop-filter: blur(12px);
  animation: menuFadeIn 0.2s ease-out;
}

@keyframes menuFadeIn {
  from {
    opacity: 0;
    transform: translateY(-8px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm, 12px);
  padding: var(--spacing-sm, 10px) var(--spacing-md, 14px);
  font-size: 14px;
  color: var(--color-text-1, #333);
  cursor: pointer;
  transition: all var(--transition-duration, 0.3s);
  border-radius: var(--radius-md, 8px);
  user-select: none;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 3px;
    height: 100%;
    background-color: var(--color-primary, #1890ff);
    transform: scaleY(0);
    transition: transform var(--transition-duration, 0.3s);
  }

  &:hover {
    background-color: var(--color-primary-light, #e6f7ff);
    color: var(--color-primary, #1890ff);
    padding-left: calc(var(--spacing-md, 14px) + 6px);

    &::before {
      transform: scaleY(1);
    }

    .el-icon {
      color: var(--color-primary, #1890ff);
      transform: scale(1.1);
    }
  }

  &:active {
    transform: scale(0.98);
  }

  .el-icon {
    font-size: 16px;
    color: var(--color-text-2, #666);
    transition: all var(--transition-duration, 0.3s);
    flex-shrink: 0;
  }

  span {
    flex: 1;
    white-space: nowrap;
  }
}

.menu-divider {
  height: 1px;
  margin: var(--spacing-xs, 6px) var(--spacing-sm, 10px);
  background: linear-gradient(
    to right,
    transparent,
    var(--color-border, #e5e5e5) 20%,
    var(--color-border, #e5e5e5) 80%,
    transparent
  );
}
</style>
