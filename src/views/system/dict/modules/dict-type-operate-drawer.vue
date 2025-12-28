<template>
  <DialogForm
    v-model="visible"
    v-model:formData="formData"
    :title="title"
    :sections="sections"
    :rules="rules"
    :confirm-loading="loading"
    @confirm="handleConfirm"
    @cancel="handleCancel"
  />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
// @ts-ignore
import DialogForm from '@/components/DialogForm/index.vue'
import type { DictTypeOperateParams } from '@/typings/api/system'

// Props
interface Props {
  modelValue: boolean
  operateType: 'add' | 'edit'
  dictTypeData?: DictTypeOperateParams
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  operateType: 'add'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [data: DictTypeOperateParams]
  cancel: []
}>()

// 状态
const loading = ref(false)
const formData = ref<DictTypeOperateParams>({
  dictId: undefined,
  dictName: '',
  dictType: '',
  status: '0',
  remark: ''
})

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const title = computed(() => {
  return props.operateType === 'add' ? '新增字典类型' : '编辑字典类型'
})

// 表单配置
const sections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      { 
        prop: 'dictName', 
        label: '字典名称', 
        component: 'input',
        placeholder: '请输入字典名称',
        span: 12 
      },
      { 
        prop: 'dictType', 
        label: '字典类型', 
        component: 'input',
        placeholder: '请输入字典类型',
        span: 12,
        disabled: props.operateType === 'edit'
      },
      { 
        prop: 'status', 
        label: '状态', 
        component: 'radio-group', 
        span: 12,
        options: [
          { label: '正常', value: '0' },
          { label: '停用', value: '1' }
        ]
      },
      { 
        prop: 'remark', 
        label: '备注', 
        component: 'input',
        type: 'textarea',
        placeholder: '请输入备注',
        span: 24 
      }
    ]
  }
])

// 表单验证规则
const rules = {
  dictName: [
    { required: true, message: '请输入字典名称', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value && value.trim().length === 0) {
          callback(new Error('字典名称不能为空白字符'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  dictType: [
    { required: true, message: '请输入字典类型', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value && value.trim().length === 0) {
          callback(new Error('字典类型不能为空白字符'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  status: [
    { required: true, message: '请选择状态', trigger: 'change' }
  ]
}

// 方法
const handleConfirm = () => {
  emit('confirm', formData.value)
}

const handleCancel = () => {
  emit('cancel')
}

// 初始化表单数据
const initFormData = (data?: DictTypeOperateParams) => {
  if (data) {
    formData.value = { ...data }
  } else {
    formData.value = {
      dictId: undefined,
      dictName: '',
      dictType: '',
      status: '0',
      remark: ''
    }
  }
}

// 设置加载状态
const setLoading = (val: boolean) => {
  loading.value = val
}

// 暴露方法
defineExpose({
  initFormData,
  setLoading
})
</script>
