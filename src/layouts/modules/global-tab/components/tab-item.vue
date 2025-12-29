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
  cursor: pointer;
  user-select: none;
  position: relative;
  flex-shrink: 0;
  
  /* 基础样式由主题控制，这里只保留布局相关的样式 */
}

.tab-label {
  font-size: 14px;
  white-space: nowrap;
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
  }
}

/* 固定标签页隐藏关闭按钮 */
.tab-item.is-affix {
  .tab-close {
    display: none;
  }
}
</style>
