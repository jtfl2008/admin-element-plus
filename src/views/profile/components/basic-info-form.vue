<script setup lang="ts">
/**
 * 个人资料表单组件
 * @description 显示和编辑个人资料，区分只读和可编辑字段
 */

import { ref, reactive, watch } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { UserProfile, UpdateProfileParams } from '@/typings/profile'

// 定义组件名称
defineOptions({
  name: 'BasicInfoForm',
})

// 定义 Props
interface Props {
  /** 用户信息 */
  userInfo: UserProfile
  /** 加载状态 */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// 定义 Emits
interface Emits {
  (e: 'submit', data: UpdateProfileParams): void
  (e: 'cancel'): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const isEditing = ref(false)
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive<UpdateProfileParams>({
  nickName: '',
  phonenumber: '',
  email: '',
  sex: '0',
})

// 原始数据（用于取消时恢复）
const originalData = reactive<UpdateProfileParams>({
  nickName: '',
  phonenumber: '',
  email: '',
  sex: '0',
})

// 表单验证规则
const formRules: FormRules = {
  nickName: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' },
  ],
  phonenumber: [
    {
      pattern: /^1[3-9]\d{9}$/,
      message: '请输入正确的手机号码',
      trigger: 'blur',
    },
  ],
  email: [
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: 'blur',
    },
  ],
}

/**
 * 初始化表单数据
 */
function initFormData() {
  formData.nickName = props.userInfo.nickName || ''
  formData.phonenumber = props.userInfo.phonenumber || ''
  formData.email = props.userInfo.email || ''
  formData.sex = props.userInfo.sex || '0'

  // 保存原始数据
  Object.assign(originalData, formData)
}

/**
 * 进入编辑模式
 */
function handleEdit() {
  isEditing.value = true
}

/**
 * 取消编辑
 */
function handleCancel() {
  // 恢复原始数据
  Object.assign(formData, originalData)

  // 清除验证
  formRef.value?.clearValidate()

  // 退出编辑模式
  isEditing.value = false

  emit('cancel')
}

/**
 * 提交表单
 */
async function handleSubmit() {
  if (!formRef.value) return

  try {
    // 验证表单
    await formRef.value.validate()

    // 触发提交事件
    emit('submit', { ...formData })

    // 更新原始数据
    Object.assign(originalData, formData)

    // 退出编辑模式
    isEditing.value = false
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.warning('请检查表单输入')
  }
}

// 监听用户信息变化
watch(
  () => props.userInfo,
  () => {
    initFormData()
  },
  { immediate: true, deep: true }
)
</script>

<template>
  <div class="basic-info-form">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>基本资料</span>
          <div class="card-header-actions">
            <el-button
              v-if="!isEditing"
              type="primary"
              :loading="loading"
              @click="handleEdit"
            >
              编辑
            </el-button>
            <template v-else>
              <el-button @click="handleCancel">取消</el-button>
              <el-button
                type="primary"
                :loading="loading"
                @click="handleSubmit"
              >
                保存
              </el-button>
            </template>
          </div>
        </div>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <!-- 只读信息 -->
        <div class="form-section">
          <div class="section-title">账号信息</div>

          <el-form-item label="用户账号">
            <span class="readonly-text">{{ userInfo.userName }}</span>
          </el-form-item>

          <el-form-item label="所属部门">
            <span class="readonly-text">{{ userInfo.deptName || '-' }}</span>
          </el-form-item>

          <el-form-item label="所属岗位">
            <span class="readonly-text">
              {{ userInfo.postNames?.join('、') || '-' }}
            </span>
          </el-form-item>

          <el-form-item label="所属角色">
            <span class="readonly-text">
              {{ userInfo.roleNames?.join('、') || '-' }}
            </span>
          </el-form-item>

          <el-form-item label="创建时间">
            <span class="readonly-text">{{ userInfo.createTime || '-' }}</span>
          </el-form-item>
        </div>

        <!-- 可编辑信息 -->
        <div class="form-section">
          <div class="section-title">个人信息</div>

          <el-form-item label="用户昵称" prop="nickName">
            <el-input
              v-model="formData.nickName"
              :disabled="!isEditing"
              placeholder="请输入用户昵称"
              maxlength="20"
              show-word-limit
            />
          </el-form-item>

          <el-form-item label="手机号码" prop="phonenumber">
            <el-input
              v-model="formData.phonenumber"
              :disabled="!isEditing"
              placeholder="请输入手机号码"
              maxlength="11"
            />
          </el-form-item>

          <el-form-item label="邮箱地址" prop="email">
            <el-input
              v-model="formData.email"
              :disabled="!isEditing"
              placeholder="请输入邮箱地址"
            />
          </el-form-item>

          <el-form-item label="性别">
            <el-radio-group v-model="formData.sex" :disabled="!isEditing">
              <el-radio label="0">男</el-radio>
              <el-radio label="1">女</el-radio>
              <el-radio label="2">未知</el-radio>
            </el-radio-group>
          </el-form-item>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.basic-info-form {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;

    &-actions {
      display: flex;
      gap: 8px;
    }
  }

  .form-section {
    margin-bottom: 24px;

    &:last-child {
      margin-bottom: 0;
    }

    .section-title {
      font-size: 16px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 16px;
      padding-bottom: 8px;
      border-bottom: 1px solid var(--el-border-color-lighter);
    }
  }

  .readonly-text {
    color: var(--el-text-color-regular);
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  :deep(.el-input.is-disabled .el-input__wrapper) {
    background-color: transparent;
    box-shadow: none;
  }

  :deep(.el-radio-group.is-disabled .el-radio) {
    cursor: default;
  }

  // 响应式布局
  @media (max-width: 768px) {
    :deep(.el-form) {
      .el-form-item__label {
        width: 80px !important;
      }
    }
  }
}
</style>
