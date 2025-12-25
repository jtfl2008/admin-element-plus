<template>
  <div class="header-action-item theme-drawer-button" @click="handleClick">
    <el-tooltip content="主题配置" placement="bottom">
      <el-icon>
        <Setting />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'

interface Emits {
  (e: 'click'): void
}

const emit = defineEmits<Emits>()

function handleClick() {
  emit('click')
}
</script>

<style scoped lang="scss">
.theme-drawer-button {
  cursor: pointer;
  
  .el-icon {
    font-size: 18px;
    color: var(--text-secondary);
    transition: all var(--transition-normal);
  }

  &:hover {
    .el-icon {
      color: var(--color-primary);
      transform: rotate(90deg);
    }
  }
}
</style>
