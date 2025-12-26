<template>
  <div
    class="tab-item"
    :class="{ 'is-active': active, 'is-affix': tab.affix, 'is-dragging': isDragging }"
    draggable="true"
    @click="handleClick"
    @contextmenu="handleContextMenu"
    @dragstart="handleDragStart"
    @dragend="handleDragEnd"
    @dragover="handleDragOver"
    @drop="handleDrop"
  >
    <span class="tab-label">{{ tab.label }}</span>
    <button
      v-if="tab.closable"
      class="tab-close"
      @click.stop="handleClose"
    >
      <el-icon><Close /></el-icon>
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Close } from '@element-plus/icons-vue'
import type { TabItem } from '@/typings/layout'

interface Props {
  tab: TabItem
  active?: boolean
}

interface Emits {
  (e: 'click'): void
  (e: 'close'): void
  (e: 'contextmenu', event: MouseEvent): void
  (e: 'dragstart', event: DragEvent): void
  (e: 'dragend', event: DragEvent): void
  (e: 'dragover', event: DragEvent): void
  (e: 'drop', event: DragEvent): void
}

defineProps<Props>()
const emit = defineEmits<Emits>()

const isDragging = ref(false)

function handleClick() {
  emit('click')
}

function handleClose() {
  emit('close')
}

function handleContextMenu(e: MouseEvent) {
  emit('contextmenu', e)
}

function handleDragStart(e: DragEvent) {
  isDragging.value = true
  emit('dragstart', e)
}

function handleDragEnd(e: DragEvent) {
  isDragging.value = false
  emit('dragend', e)
}

function handleDragOver(e: DragEvent) {
  e.preventDefault()
  emit('dragover', e)
}

function handleDrop(e: DragEvent) {
  e.preventDefault()
  emit('drop', e)
}
</script>

<style scoped lang="scss">
.tab-item {
  display: inline-flex;
  align-items: center;
  gap: var(--spacing-xs, 8px);
  height: 32px;
  padding: 0 var(--spacing-md, 16px);
  background-color: transparent;
  border: 1px solid transparent;
  border-radius: var(--radius-md, 8px);
  cursor: pointer;
  transition: all var(--transition-duration, 0.3s);
  user-select: none;
  position: relative;
  flex-shrink: 0;

  &::before {
    content: '';
    position: absolute;
    left: 0;
    bottom: -9px;
    width: 100%;
    height: 2px;
    background-color: transparent;
    transition: background-color var(--transition-duration, 0.3s);
  }

  &:hover {
    background-color: var(--color-bg-1, #f5f5f5);
    border-color: var(--color-border, #e5e5e5);
  }

  &.is-active {
    background-color: var(--color-primary-light, #e6f7ff);
    border-color: var(--color-primary, #1890ff);
    color: var(--color-primary, #1890ff);

    &::before {
      background-color: var(--color-primary, #1890ff);
    }

    .tab-label {
      color: var(--color-primary, #1890ff);
      font-weight: 600;
    }

    .tab-close {
      .el-icon {
        color: var(--color-primary, #1890ff);
      }

      &:hover {
        background-color: var(--color-primary, #1890ff);
        
        .el-icon {
          color: #ffffff;
        }
      }
    }
  }

  &.is-affix {
    .tab-close {
      display: none;
    }
  }

  &.is-dragging {
    opacity: 0.5;
    cursor: move;
    transform: scale(0.95);
  }
}

.tab-label {
  font-size: 14px;
  color: var(--color-text-1, #333);
  white-space: nowrap;
  transition: color var(--transition-duration, 0.3s);
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 50%;
  transition: all var(--transition-duration, 0.3s);
  margin-left: var(--spacing-xs, 4px);

  &:hover {
    background-color: rgba(0, 0, 0, 0.06);
    transform: scale(1.1);
  }

  &:active {
    transform: scale(0.9);
  }

  .el-icon {
    font-size: 12px;
    color: var(--color-text-3, #999);
    transition: color var(--transition-duration, 0.3s);
  }
}
</style>
