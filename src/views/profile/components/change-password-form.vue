<script setup lang="ts">
/**
 * 密码修改表单组件
 * @description 修改用户密码，包含旧密码、新密码和确认密码验证
 */

import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import type { ChangePasswordParams } from '@/typings/profile'

// 定义组件名称
defineOptions({
  name: 'ChangePasswordForm',
})

// 定义 Props
interface Props {
  /** 加载状态 */
  loading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
})

// 定义 Emits
interface Emits {
  (e: 'submit', data: ChangePasswordParams): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const formRef = ref<FormInstance>()

// 表单数据
const formData = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: '',
})

// 自定义验证器：新密码不能与旧密码相同
const validateNewPassword = (rule: any, value: string, callback: any) => {
  if (value === formData.oldPassword) {
    callback(new Error('新密码不能与旧密码相同'))
  } else {
    callback()
  }
}

// 自定义验证器：确认密码必须与新密码一致
const validateConfirmPassword = (rule: any, value: string, callback: any) => {
  if (value !== formData.newPassword) {
    callback(new Error('两次输入的密码不一致'))
  } else {
    callback()
  }
}

// 表单验证规则
const formRules: FormRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' },
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { validator: validateNewPassword, trigger: 'blur' },
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { validator: validateConfirmPassword, trigger: 'blur' },
  ],
}

/**
 * 重置表单
 */
function resetForm() {
  formRef.value?.resetFields()
  formData.oldPassword = ''
  formData.newPassword = ''
  formData.confirmPassword = ''
}

/**
 * 取消修改
 */
function handleCancel() {
  resetForm()
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
    emit('submit', {
      oldPassword: formData.oldPassword,
      newPassword: formData.newPassword,
    })

    // 提交成功后重置表单
    resetForm()
  } catch (error) {
    console.error('表单验证失败:', error)
    ElMessage.warning('请检查表单输入')
  }
}
</script>

<template>
  <div class="change-password-form">
    <el-card>
      <template #header>
        <span>修改密码</span>
      </template>

      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input
            v-model="formData.oldPassword"
            type="password"
            placeholder="请输入旧密码"
            show-password
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="新密码" prop="newPassword">
          <el-input
            v-model="formData.newPassword"
            type="password"
            placeholder="请输入新密码"
            show-password
            maxlength="20"
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入新密码"
            show-password
            maxlength="20"
          />
        </el-form-item>

        <el-form-item>
          <div class="password-tips">
            <div class="tips-title">密码要求：</div>
            <ul class="tips-list">
              <li>长度在 6-20 个字符之间</li>
              <li>新密码不能与旧密码相同</li>
              <li>两次输入的新密码必须一致</li>
            </ul>
          </div>
        </el-form-item>

        <el-form-item>
          <el-button @click="handleCancel">取消</el-button>
          <el-button
            type="primary"
            :loading="loading"
            @click="handleSubmit"
          >
            确定修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.change-password-form {
  .password-tips {
    padding: 12px 16px;
    background-color: var(--el-fill-color-light);
    border-radius: 4px;
    border: 1px solid var(--el-border-color-lighter);

    .tips-title {
      font-size: 14px;
      font-weight: 500;
      color: var(--el-text-color-primary);
      margin-bottom: 8px;
    }

    .tips-list {
      margin: 0;
      padding-left: 20px;
      font-size: 13px;
      color: var(--el-text-color-regular);

      li {
        line-height: 1.8;
      }
    }
  }

  :deep(.el-form-item) {
    margin-bottom: 20px;
  }

  // 响应式布局
  @media (max-width: 768px) {
    :deep(.el-form) {
      .el-form-item__label {
        width: 80px !important;
      }
    }

    .password-tips {
      padding: 10px 12px;

      .tips-list {
        font-size: 12px;
      }
    }
  }
}
</style>
