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
  gap: var(--spacing-xs);
  height: 32px;
  padding: 0 var(--spacing-sm);
  margin: 0 var(--spacing-xs);
  background-color: var(--bg-secondary);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-normal);
  user-select: none;

  &:hover {
    background-color: var(--bg-hover);
  }

  &.is-active {
    background-color: var(--color-primary);
    color: var(--text-inverse);
    box-shadow: var(--shadow-sm);

    .tab-label {
      color: var(--text-inverse);
      font-weight: 500;
    }

    .tab-close {
      .el-icon {
        color: var(--text-inverse);
      }

      &:hover {
        background-color: rgba(255, 255, 255, 0.2);
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
  }
}

.tab-label {
  font-size: var(--font-size-sm);
  color: var(--text-primary);
  white-space: nowrap;
}

.tab-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: var(--radius-xs);
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: var(--bg-hover);
  }

  .el-icon {
    font-size: 12px;
    color: var(--text-secondary);
  }
}
</style>
