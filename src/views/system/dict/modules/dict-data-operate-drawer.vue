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
import type { DictDataOperateParams } from '@/typings/api/system'

// Props
interface Props {
  modelValue: boolean
  operateType: 'add' | 'edit'
  dictDataData?: DictDataOperateParams
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  operateType: 'add'
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [data: DictDataOperateParams]
  cancel: []
}>()

// 状态
const loading = ref(false)
const formData = ref<DictDataOperateParams>({
  dictCode: undefined,
  dictSort: 0,
  dictLabel: '',
  dictValue: '',
  dictType: '',
  cssClass: '',
  listClass: 'default',
  isDefault: 'N',
  status: '0',
  remark: ''
})

// 计算属性
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const title = computed(() => {
  return props.operateType === 'add' ? '新增字典数据' : '编辑字典数据'
})

// 回显样式选项
const listClassOptions = [
  { label: 'Primary', value: 'primary' },
  { label: 'Success', value: 'success' },
  { label: 'Info', value: 'info' },
  { label: 'Warning', value: 'warning' },
  { label: 'Danger', value: 'danger' },
  { label: 'Default', value: 'default' }
]

// 表单配置
const sections = computed(() => [
  {
    type: 'form',
    key: 'baseInfo',
    title: '基础信息',
    fields: [
      { 
        prop: 'dictType', 
        label: '字典类型', 
        component: 'input',
        span: 12,
        disabled: true
      },
      { 
        prop: 'dictLabel', 
        label: '字典标签', 
        component: 'input',
        placeholder: '请输入字典标签',
        span: 12 
      },
      { 
        prop: 'dictValue', 
        label: '字典键值', 
        component: 'input',
        placeholder: '请输入字典键值',
        span: 12 
      },
      { 
        prop: 'dictSort', 
        label: '字典排序', 
        component: 'input-number',
        span: 12,
        min: 0
      },
      { 
        prop: 'listClass', 
        label: '回显样式', 
        component: 'select', 
        span: 12,
        options: listClassOptions
      },
      { 
        prop: 'cssClass', 
        label: 'CSS样式', 
        component: 'input',
        placeholder: '请输入CSS样式类',
        span: 12 
      },
      { 
        prop: 'isDefault', 
        label: '是否默认', 
        component: 'radio-group', 
        span: 12,
        options: [
          { label: '是', value: 'Y' },
          { label: '否', value: 'N' }
        ]
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
  dictLabel: [
    { required: true, message: '请输入字典标签', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value && value.trim().length === 0) {
          callback(new Error('字典标签不能为空白字符'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  dictValue: [
    { required: true, message: '请输入字典键值', trigger: 'blur' },
    { 
      validator: (rule: any, value: string, callback: any) => {
        if (value && value.trim().length === 0) {
          callback(new Error('字典键值不能为空白字符'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  dictSort: [
    { required: true, message: '请输入字典排序', trigger: 'blur' },
    { type: 'number', message: '字典排序必须为数字', trigger: 'blur' }
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
const initFormData = (data?: DictDataOperateParams) => {
  if (data) {
    formData.value = { ...data }
  } else {
    formData.value = {
      dictCode: undefined,
      dictSort: 0,
      dictLabel: '',
      dictValue: '',
      dictType: '',
      cssClass: '',
      listClass: 'default',
      isDefault: 'N',
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
