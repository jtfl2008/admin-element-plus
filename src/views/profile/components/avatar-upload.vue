<script setup lang="ts">
/**
 * 头像上传组件
 * @description 支持头像显示、上传、预览和验证
 */

import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Loading } from '@element-plus/icons-vue'
import { uploadAvatar } from '@/service/api/profile'

// 定义组件名称
defineOptions({
  name: 'AvatarUpload',
})

// 定义 Props
interface Props {
  /** 头像 URL */
  avatar?: string
  /** 头像尺寸 */
  size?: number
  /** 是否禁用 */
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  avatar: '',
  size: 120,
  disabled: false,
})

// 定义 Emits
interface Emits {
  (e: 'change', file: File): void
  (e: 'success', url: string): void
  (e: 'error', error: Error): void
}

const emit = defineEmits<Emits>()

// 响应式数据
const uploading = ref(false)
const imageUrl = ref(props.avatar)

// 计算属性
const avatarStyle = computed(() => ({
  width: `${props.size}px`,
  height: `${props.size}px`,
}))

// 文件验证配置
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif']
const MAX_SIZE = 2 * 1024 * 1024 // 2MB

/**
 * 验证文件
 */
function validateFile(file: File): { valid: boolean; message?: string } {
  // 验证文件类型
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      message: '只能上传 JPG、PNG、GIF 格式的图片',
    }
  }

  // 验证文件大小
  if (file.size > MAX_SIZE) {
    return {
      valid: false,
      message: '图片大小不能超过 2MB',
    }
  }

  return { valid: true }
}

/**
 * 文件选择前的钩子
 */
function beforeUpload(rawFile: File) {
  const validation = validateFile(rawFile)

  if (!validation.valid) {
    ElMessage.error(validation.message!)
    return false
  }

  return true
}

/**
 * 处理文件上传
 */
async function handleUpload(file: File) {
  // 验证文件
  const validation = validateFile(file)
  if (!validation.valid) {
    ElMessage.error(validation.message!)
    emit('error', new Error(validation.message!))
    return
  }

  uploading.value = true

  try {
    // 调用上传 API
    const { imgUrl } = await uploadAvatar(file)

    // 更新头像显示
    imageUrl.value = imgUrl

    // 触发成功事件
    emit('success', imgUrl)
    emit('change', file)

    ElMessage.success('头像上传成功')
  } catch (error) {
    console.error('头像上传失败:', error)
    ElMessage.error('头像上传失败，请重试')
    emit('error', error as Error)
  } finally {
    uploading.value = false
  }
}

/**
 * 处理文件变化
 */
function handleChange(file: any) {
  if (file.raw) {
    handleUpload(file.raw)
  }
}
</script>

<template>
  <div class="avatar-upload">
    <el-upload
      class="avatar-uploader"
      :show-file-list="false"
      :before-upload="beforeUpload"
      :on-change="handleChange"
      :disabled="disabled || uploading"
      :auto-upload="false"
      accept="image/jpeg,image/jpg,image/png,image/gif"
    >
      <div class="avatar-container" :style="avatarStyle">
        <el-image
          v-if="imageUrl"
          :src="imageUrl"
          fit="cover"
          class="avatar-image"
        >
          <template #error>
            <div class="avatar-error">
              <el-icon><Plus /></el-icon>
            </div>
          </template>
        </el-image>

        <div v-else class="avatar-placeholder">
          <el-icon><Plus /></el-icon>
          <div class="avatar-text">上传头像</div>
        </div>

        <!-- 上传遮罩层 -->
        <div v-if="!disabled" class="avatar-overlay">
          <el-icon v-if="uploading" class="is-loading">
            <Loading />
          </el-icon>
          <el-icon v-else>
            <Plus />
          </el-icon>
          <div class="overlay-text">
            {{ uploading ? '上传中...' : '更换头像' }}
          </div>
        </div>
      </div>
    </el-upload>

    <div class="avatar-tips">
      <div class="tip-item">支持 JPG、PNG、GIF 格式</div>
      <div class="tip-item">文件大小不超过 2MB</div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;

  .avatar-uploader {
    :deep(.el-upload) {
      cursor: pointer;
      position: relative;
      overflow: hidden;
      border-radius: 50%;
      transition: all 0.3s;

      &:hover {
        .avatar-overlay {
          opacity: 1;
        }
      }
    }
  }

  .avatar-container {
    position: relative;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid var(--el-border-color);
    background-color: var(--el-fill-color-light);
  }

  .avatar-image {
    width: 100%;
    height: 100%;
    display: block;
  }

  .avatar-placeholder,
  .avatar-error {
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-secondary);

    .el-icon {
      font-size: 32px;
      margin-bottom: 8px;
    }
  }

  .avatar-text {
    font-size: 14px;
  }

  .avatar-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s;
    color: #fff;

    .el-icon {
      font-size: 24px;
      margin-bottom: 4px;

      &.is-loading {
        animation: rotating 2s linear infinite;
      }
    }

    .overlay-text {
      font-size: 12px;
    }
  }

  .avatar-tips {
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-size: 12px;
    color: var(--el-text-color-secondary);
    text-align: center;

    .tip-item {
      line-height: 1.5;
    }
  }
}

@keyframes rotating {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
