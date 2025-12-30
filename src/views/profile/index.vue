<script setup lang="ts">
/**
 * 个人中心主页面
 * @description 集成所有子组件，管理标签页切换和数据流
 */

import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useAuthStore } from '@/stores/modules/auth'
import ProfileHeader from './components/profile-header.vue'
import BasicInfoForm from './components/basic-info-form.vue'
import ChangePasswordForm from './components/change-password-form.vue'
import LoginLogTable from './components/login-log-table.vue'
import {
  fetchUserProfile,
  updateUserProfile,
  changePassword,
} from '@/service/api/profile'
import type { UserProfile, UpdateProfileParams, ChangePasswordParams } from '@/typings/profile'

// 定义组件名称
defineOptions({
  name: 'ProfileIndex',
})

// Store
const authStore = useAuthStore()

// 响应式数据
const loading = ref(false)
const submitLoading = ref(false)
const activeTab = ref<'basic' | 'password' | 'log'>('basic')
const userInfo = ref<UserProfile>({
  userId: 0,
  userName: '',
  nickName: '',
  sex: '0',
})

/**
 * 加载用户资料
 */
async function loadUserProfile() {
  loading.value = true
  try {
    const data = await fetchUserProfile()
    userInfo.value = data
  } catch (error) {
    console.error('加载用户资料失败:', error)
    ElMessage.error('加载用户资料失败')
  } finally {
    loading.value = false
  }
}

/**
 * 更新个人资料
 */
async function handleUpdateProfile(data: UpdateProfileParams) {
  submitLoading.value = true
  try {
    await updateUserProfile(data)
    ElMessage.success('更新个人资料成功')

    // 重新加载用户资料
    await loadUserProfile()

    // 同步更新全局用户信息
    authStore.updateUserInfo({
      nickName: data.nickName,
      phonenumber: data.phonenumber,
      email: data.email,
      sex: data.sex,
    })
  } catch (error) {
    console.error('更新个人资料失败:', error)
    ElMessage.error('更新个人资料失败')
  } finally {
    submitLoading.value = false
  }
}

/**
 * 修改密码
 */
async function handleChangePassword(data: ChangePasswordParams) {
  submitLoading.value = true
  try {
    await changePassword(data)
    ElMessage.success('修改密码成功')
  } catch (error) {
    console.error('修改密码失败:', error)
    ElMessage.error('修改密码失败，请检查旧密码是否正确')
  } finally {
    submitLoading.value = false
  }
}

/**
 * 头像上传成功
 */
async function handleAvatarSuccess(url: string) {
  // 更新本地用户信息
  userInfo.value.avatar = url

  // 同步更新全局头像
  authStore.updateAvatar(url)

  // 重新加载用户资料以同步最新数据
  await loadUserProfile()

  ElMessage.success('头像更新成功')
}

// 组件挂载时加载数据
onMounted(() => {
  loadUserProfile()
})
</script>

<template>
  <div class="profile-page">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator="/" class="breadcrumb">
      <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>个人中心</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 用户信息头部 -->
    <profile-header
      :user-info="userInfo"
      :loading="loading"
      @avatar-success="handleAvatarSuccess"
    />

    <!-- 标签页内容 -->
    <el-card>
      <el-tabs v-model="activeTab">
        <!-- 基本资料标签页 -->
        <el-tab-pane label="基本资料" name="basic">
          <basic-info-form
            :user-info="userInfo"
            :loading="submitLoading"
            @submit="handleUpdateProfile"
          />
        </el-tab-pane>

        <!-- 修改密码标签页 -->
        <el-tab-pane label="修改密码" name="password">
          <change-password-form
            :loading="submitLoading"
            @submit="handleChangePassword"
          />
        </el-tab-pane>

        <!-- 登录日志标签页 -->
        <el-tab-pane label="登录日志" name="log">
          <login-log-table />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.profile-page {
  padding: 20px;

  .breadcrumb {
    margin-bottom: 20px;
  }

  @media (max-width: 768px) {
    padding: 12px;

    .breadcrumb {
      margin-bottom: 12px;
    }
  }
}
</style>
