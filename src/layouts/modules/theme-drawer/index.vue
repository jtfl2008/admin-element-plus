<template>
  <!-- 抽屉 -->
  <el-drawer
    v-model="visible"
    title="主题配置"
    direction="rtl"
    size="320px"
  >
    <div class="theme-drawer-content">
        <!-- 主题模式 -->
        <ThemeMode />

        <el-divider />

        <!-- 主题色 -->
        <ThemeColor />

        <el-divider />

        <!-- 布局模式 -->
        <LayoutMode />

        <el-divider />

        <!-- 布局配置 -->
        <LayoutConfig />

        <el-divider />

        <!-- 标签页主题 -->
        <TabTheme />

        <el-divider />

        <!-- 操作按钮 -->
        <div class="drawer-actions">
          <el-button type="primary" @click="handleCopy">
            <el-icon><DocumentCopy /></el-icon>
            复制配置
          </el-button>
          <el-button @click="handleReset">
            <el-icon><RefreshLeft /></el-icon>
            重置配置
          </el-button>
        </div>
      </div>
    </el-drawer>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import { DocumentCopy, RefreshLeft } from '@element-plus/icons-vue'
import { useAppStore } from '@/stores/modules/app'
import ThemeMode from './components/theme-mode.vue'
import ThemeColor from './components/theme-color.vue'
import LayoutMode from './components/layout-mode.vue'
import LayoutConfig from './components/layout-config.vue'
import TabTheme from './components/tab-theme.vue'

interface Props {
  modelValue?: boolean
}

interface Emits {
  (e: 'update:modelValue', value: boolean): void
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
})

const emit = defineEmits<Emits>()

const appStore = useAppStore()
const visible = ref(false)

// 监听 modelValue 变化
watch(() => props.modelValue, (val) => {
  visible.value = val
})

// 监听 visible 变化,同步到父组件
watch(visible, (val) => {
  emit('update:modelValue', val)
})

/**
 * 复制配置到剪贴板
 */
async function handleCopy() {
  try {
    const config = appStore.getLayoutConfig()
    const configText = JSON.stringify(config, null, 2)
    
    await navigator.clipboard.writeText(configText)
    ElMessage.success('配置已复制到剪贴板')
  } catch (error) {
    ElMessage.error('复制失败')
  }
}

/**
 * 重置为默认配置
 */
function handleReset() {
  appStore.resetLayoutConfig()
  ElMessage.success('已重置为默认配置')
}
</script>

<style scoped lang="scss">
.theme-drawer-content {
  padding: 0;
}

.drawer-actions {
  display: flex;
  gap: 10px;
  margin-top: 8px;

  .el-button {
    flex: 1;
    height: 32px;
    font-size: 13px;
  }
}

:deep(.el-drawer__header) {
  margin-bottom: 0;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
  
  .el-drawer__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--text-primary);
  }
}

:deep(.el-drawer__body) {
  padding: 20px;
  background-color: var(--bg-page);
}

:deep(.el-divider) {
  margin: 20px 0;
  border-color: var(--border-light);
}
</style>
