<template>
  <div class="config-section">
    <div class="section-title">布局配置</div>

    <!-- 侧边栏宽度 -->
    <div class="config-item">
      <div class="item-label">
        <span>侧边栏宽度</span>
        <span class="item-value">{{ layoutConfig.sidebarWidth }}px</span>
      </div>
      <el-slider
        :model-value="layoutConfig.sidebarWidth"
        :min="180"
        :max="300"
        :step="10"
        @input="handleSidebarWidthChange"
      />
    </div>

    <!-- 显示标签页 -->
    <div class="config-item">
      <div class="item-label">
        <span>显示标签页</span>
      </div>
      <el-switch
        :model-value="layoutConfig.showTab"
        @change="handleShowTabChange"
      />
    </div>

    <!-- 显示面包屑 -->
    <div class="config-item">
      <div class="item-label">
        <span>显示面包屑</span>
      </div>
      <el-switch
        :model-value="layoutConfig.showBreadcrumb"
        @change="handleShowBreadcrumbChange"
      />
    </div>

    <!-- 显示页脚 -->
    <div class="config-item">
      <div class="item-label">
        <span>显示页脚</span>
      </div>
      <el-switch
        :model-value="layoutConfig.showFooter"
        @change="handleShowFooterChange"
      />
    </div>

    <!-- 固定头部 -->
    <div class="config-item">
      <div class="item-label">
        <span>固定头部</span>
      </div>
      <el-switch
        :model-value="layoutConfig.fixedHeader"
        @change="handleFixedHeaderChange"
      />
    </div>

    <!-- 固定侧边栏 -->
    <div class="config-item">
      <div class="item-label">
        <span>固定侧边栏</span>
      </div>
      <el-switch
        :model-value="layoutConfig.fixedSidebar"
        @change="handleFixedSidebarChange"
      />
    </div>

    <!-- 启用动画 -->
    <div class="config-item">
      <div class="item-label">
        <span>启用动画</span>
      </div>
      <el-switch
        :model-value="layoutConfig.enableAnimation"
        @change="handleEnableAnimationChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAppStore } from '@/stores/modules/app'

const appStore = useAppStore()

const layoutConfig = computed(() => appStore.layoutConfig)

function handleSidebarWidthChange(value: number | number[]) {
  const width = Array.isArray(value) ? value[0] : value
  if (width) {
    appStore.updateLayoutConfig({ sidebarWidth: width })
  }
}

function handleShowTabChange(value: boolean | string | number) {
  appStore.updateLayoutConfig({ showTab: Boolean(value) })
}

function handleShowBreadcrumbChange(value: boolean | string | number) {
  appStore.updateLayoutConfig({ showBreadcrumb: Boolean(value) })
}

function handleShowFooterChange(value: boolean | string | number) {
  appStore.updateLayoutConfig({ showFooter: Boolean(value) })
}

function handleFixedHeaderChange(value: boolean | string | number) {
  appStore.updateLayoutConfig({ fixedHeader: Boolean(value) })
}

function handleFixedSidebarChange(value: boolean | string | number) {
  appStore.updateLayoutConfig({ fixedSidebar: Boolean(value) })
}

function handleEnableAnimationChange(value: boolean | string | number) {
  appStore.updateLayoutConfig({ enableAnimation: Boolean(value) })
}
</script>

<style scoped lang="scss">
.config-section {
  .section-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .config-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 0;
    border-bottom: 1px solid var(--border-light);

    &:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    &:first-of-type {
      padding-top: 0;
    }
  }

  .item-label {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: var(--text-secondary);
    flex: 1;

    span:first-child {
      flex: 1;
    }
  }

  .item-value {
    color: var(--color-primary);
    font-weight: 500;
    font-size: 11px;
    margin-left: 6px;
  }

  :deep(.el-slider) {
    flex: 1;
    margin-left: 12px;
    max-width: 120px;
  }

  :deep(.el-switch) {
    --el-switch-on-color: var(--color-primary);
    --el-switch-height: 20px;
  }
}

// 特殊处理滑块项
.config-item:has(.el-slider) {
  flex-direction: column;
  align-items: stretch;

  .item-label {
    margin-bottom: 8px;
  }

  :deep(.el-slider) {
    max-width: 100%;
    margin-left: 0;
  }
}
</style>
