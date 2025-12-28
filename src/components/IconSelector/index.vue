<template>
  <div class="icon-selector">
    <!-- 图标类型选择 -->
    <el-radio-group v-model="currentIconType" class="icon-type-selector">
      <el-radio label="1">Iconify 图标</el-radio>
      <el-radio label="2">本地图标</el-radio>
    </el-radio-group>

    <!-- Iconify 图标输入 -->
    <div v-if="currentIconType === '1'" class="icon-input-wrapper">
      <el-input
        :model-value="modelValue"
        placeholder="请输入 Iconify 图标名称，如：mdi:menu"
        clearable
        @update:model-value="handleIconChange"
      >
        <template #prepend>
          <span>图标名称</span>
        </template>
      </el-input>
      
      <!-- 图标预览 -->
      <div v-if="modelValue" class="icon-preview">
        <span class="preview-label">预览：</span>
        <el-icon :size="24">
          <component :is="renderIconifyIcon(modelValue)" />
        </el-icon>
      </div>
    </div>

    <!-- 本地图标选择 -->
    <div v-else class="icon-select-wrapper">
      <el-select
        :model-value="modelValue"
        placeholder="请选择本地图标"
        clearable
        filterable
        @update:model-value="handleIconChange"
      >
        <el-option
          v-for="icon in localIconOptions"
          :key="icon.value"
          :label="icon.label"
          :value="icon.value"
        >
          <div class="icon-option">
            <el-icon :size="20">
              <component :is="renderLocalIcon(icon.value)" />
            </el-icon>
            <span>{{ icon.label }}</span>
          </div>
        </el-option>
      </el-select>

      <!-- 图标预览 -->
      <div v-if="modelValue" class="icon-preview">
        <span class="preview-label">预览：</span>
        <el-icon :size="24">
          <component :is="renderLocalIcon(modelValue)" />
        </el-icon>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, h } from 'vue'
import { getLocalMenuIcons } from '@/components/IconSelector/utils'

// Props 定义
const props = withDefaults(
  defineProps<{
    modelValue: string
    iconType?: '1' | '2'
  }>(),
  {
    iconType: '1'
  }
)

// Emits 定义
const emit = defineEmits<{
  'update:modelValue': [value: string]
  'update:iconType': [value: '1' | '2']
}>()

// 当前图标类型
const currentIconType = ref<'1' | '2'>(props.iconType)

// 本地图标选项
const localIconOptions = ref(
  getLocalMenuIcons().map((icon: string) => ({
    label: icon.replace('local-icon-', ''),
    value: icon
  }))
)

// 监听图标类型变化
watch(currentIconType, (newType) => {
  emit('update:iconType', newType)
  // 切换类型时清空图标值
  emit('update:modelValue', '')
})

// 监听外部 iconType 变化
watch(() => props.iconType, (newType) => {
  currentIconType.value = newType
})

// 处理图标变化
const handleIconChange = (value: string) => {
  emit('update:modelValue', value)
}

// 渲染 Iconify 图标
const renderIconifyIcon = (iconName: string) => {
  return h('i', {
    class: `iconify`,
    'data-icon': iconName,
    style: { fontSize: '24px' }
  })
}

// 渲染本地图标
const renderLocalIcon = (iconName: string) => {
  // 这里简化处理，实际应该根据项目的本地图标实现
  return h('i', {
    class: `local-icon ${iconName}`,
    style: { fontSize: '24px' }
  })
}
</script>

<style scoped lang="scss">
.icon-selector {
  .icon-type-selector {
    margin-bottom: 15px;
  }

  .icon-input-wrapper,
  .icon-select-wrapper {
    .icon-preview {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-top: 10px;
      padding: 10px;
      background-color: var(--el-fill-color-light);
      border-radius: 4px;

      .preview-label {
        font-size: 14px;
        color: var(--el-text-color-regular);
      }
    }
  }

  .icon-option {
    display: flex;
    align-items: center;
    gap: 8px;
  }
}
</style>
