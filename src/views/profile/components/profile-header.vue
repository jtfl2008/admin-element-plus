<script setup lang="ts">
/**
 * 用户信息头部组件
 * @description 显示用户头像和基本信息，集成头像上传功能
 */

import { computed } from 'vue'
import AvatarUpload from './avatar-upload.vue'
import type { UserProfile } from '@/typings/profile'

// 定义组件名称
defineOptions({
  name: 'ProfileHeader',
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
  (e: 'avatar-success', url: string): void
}

const emit = defineEmits<Emits>()

// 计算属性
const displayName = computed(() => {
  return props.userInfo.nickName || props.userInfo.userName || '未知用户'
})

/**
 * 头像上传成功
 */
function handleAvatarSuccess(url: string) {
  emit('avatar-success', url)
}
</script>

<template>
  <div class="profile-header">
    <el-card>
      <div class="header-content">
        <!-- 头像区域 -->
        <div class="avatar-section">
          <avatar-upload
            :avatar="userInfo.avatar"
            :size="120"
            @success="handleAvatarSuccess"
          />
        </div>

        <!-- 用户信息区域 -->
        <div class="info-section">
          <div class="user-name">{{ displayName }}</div>

          <div class="user-details">
            <div class="detail-item">
              <span class="detail-label">用户账号：</span>
              <span class="detail-value">{{ userInfo.userName }}</span>
            </div>

            <div class="detail-item">
              <span class="detail-label">所属部门：</span>
              <span class="detail-value">{{ userInfo.deptName || '-' }}</span>
            </div>

            <div v-if="userInfo.postNames?.length" class="detail-item">
              <span class="detail-label">所属岗位：</span>
              <span class="detail-value">
                {{ userInfo.postNames.join('、') }}
              </span>
            </div>

            <div v-if="userInfo.roleNames?.length" class="detail-item">
              <span class="detail-label">所属角色：</span>
              <span class="detail-value">
                {{ userInfo.roleNames.join('、') }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.profile-header {
  margin-bottom: 20px;

  .header-content {
    display: flex;
    gap: 32px;
    align-items: flex-start;

    @media (max-width: 768px) {
      flex-direction: column;
      align-items: center;
      gap: 20px;
    }
  }

  .avatar-section {
    flex-shrink: 0;
  }

  .info-section {
    flex: 1;
    min-width: 0;

    @media (max-width: 768px) {
      width: 100%;
      text-align: center;
    }
  }

  .user-name {
    font-size: 24px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 16px;
  }

  .user-details {
    display: flex;
    flex-direction: column;
    gap: 12px;

    @media (max-width: 768px) {
      align-items: center;
    }
  }

  .detail-item {
    display: flex;
    align-items: center;
    font-size: 14px;
    line-height: 1.6;

    .detail-label {
      color: var(--el-text-color-secondary);
      margin-right: 8px;
      flex-shrink: 0;
    }

    .detail-value {
      color: var(--el-text-color-regular);
      word-break: break-all;
    }
  }
}
</style>
