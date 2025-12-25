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
  min-width: 140px;
  background-color: var(--bg-elevated);
  border: 1px solid var(--border-base);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-xs) 0;
  backdrop-filter: blur(8px);
}

.menu-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  cursor: pointer;
  transition: all var(--transition-fast);

  &:hover {
    background-color: var(--bg-hover);
    color: var(--color-primary);

    .el-icon {
      color: var(--color-primary);
    }
  }

  .el-icon {
    font-size: var(--font-size-base);
    color: var(--text-secondary);
    transition: color var(--transition-fast);
  }
}

.menu-divider {
  height: 1px;
  margin: var(--spacing-xs) 0;
  background-color: var(--border-light);
}
</style>
