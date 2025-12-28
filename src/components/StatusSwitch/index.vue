<template>
  <el-switch
    :model-value="modelValue"
    :active-value="activeValue"
    :inactive-value="inactiveValue"
    :disabled="disabled"
    :loading="loading"
    @update:model-value="handleChange"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ElMessageBox } from 'element-plus'

// Props 定义
const props = withDefaults(
  defineProps<{
    modelValue: string
    activeValue?: string
    inactiveValue?: string
    disabled?: boolean
    loading?: boolean
  }>(),
  {
    activeValue: '0',
    inactiveValue: '1',
    disabled: false,
    loading: false
  }
)

// Emits 定义
const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

// 处理状态变化
const handleChange = async (value: string) => {
  const action = value === props.activeValue ? '启用' : '停用'
  
  try {
    await ElMessageBox.confirm(
      `确认要${action}吗？`,
      '系统提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // 确认后更新值并触发 change 事件
    emit('update:modelValue', value)
    emit('change', value)
  } catch {
    // 用户取消，不做任何操作
  }
}
</script>
