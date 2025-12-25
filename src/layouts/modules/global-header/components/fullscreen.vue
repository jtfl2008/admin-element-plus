<template>
  <div class="header-action-item fullscreen-button" @click="handleToggle">
    <el-tooltip :content="isFullscreen ? '退出全屏' : '全屏'" placement="bottom">
      <el-icon>
        <FullScreen />
      </el-icon>
    </el-tooltip>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { FullScreen } from '@element-plus/icons-vue'

const isFullscreen = ref(false)

/**
 * 切换全屏
 */
function handleToggle() {
  if (!document.fullscreenElement) {
    // 进入全屏
    document.documentElement.requestFullscreen().catch((err) => {
      console.error('进入全屏失败:', err)
    })
  } else {
    // 退出全屏
    document.exitFullscreen().catch((err) => {
      console.error('退出全屏失败:', err)
    })
  }
}

/**
 * 监听全屏状态变化
 */
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<style scoped lang="scss">
.fullscreen-button {
  cursor: pointer;
  
  .el-icon {
    font-size: 18px;
    color: var(--text-secondary);
    transition: all var(--transition-normal);
  }

  &:hover {
    .el-icon {
      color: var(--color-primary);
      transform: scale(1.1);
    }
  }
}
</style>
