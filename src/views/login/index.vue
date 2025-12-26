<template>
  <div class="login-page">
    <!-- 动态背景层 -->
    <div class="bg-layers">
      <div class="bg-gradient-mesh"></div>
      <div class="bg-noise"></div>
      <div class="bg-grid"></div>
      <div class="floating-orb orb-1"></div>
      <div class="floating-orb orb-2"></div>
      <div class="floating-orb orb-3"></div>
    </div>

    <!-- 主容器 -->
    <div class="login-container">
      <!-- 左侧视觉区域 (60%) -->
      <div class="visual-section">
        <div class="visual-content">
          <!-- Logo 区域 -->
          <div class="brand-header">
            <div class="logo-wrapper">
              <div class="logo-shape">
                <el-icon :size="32">
                  <Platform />
                </el-icon>
              </div>
              <div class="logo-text">
                <span class="logo-main">NEXUS</span>
                <span class="logo-sub">Admin</span>
              </div>
            </div>
          </div>

          <!-- 主标题区域 -->
          <div class="hero-content">
            <h1 class="hero-title">
              <span class="title-line">构建未来</span>
              <span class="title-line">数字化管理</span>
            </h1>
            <p class="hero-description">
              为现代企业打造的智能管理平台<br />
              让数据驱动决策，让效率成为常态
            </p>
          </div>

          <!-- 装饰性统计数据 -->
          <div class="stats-grid">
            <div class="stat-item" style="animation-delay: 0.1s">
              <div class="stat-value">10K+</div>
              <div class="stat-label">活跃用户</div>
            </div>
            <div class="stat-item" style="animation-delay: 0.2s">
              <div class="stat-value">99.9%</div>
              <div class="stat-label">系统稳定性</div>
            </div>
            <div class="stat-item" style="animation-delay: 0.3s">
              <div class="stat-value">24/7</div>
              <div class="stat-label">技术支持</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧表单区域 (40%) -->
      <div class="form-section">
        <div class="form-container">
          <!-- 表单头部 -->
          <div class="form-header">
            <h2 class="form-title">登录账户</h2>
            <p class="form-subtitle">输入凭据以访问您的工作空间</p>
          </div>

          <!-- 登录表单 -->
          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @submit.prevent="handleLogin(loginFormRef)"
          >
            <!-- 用户名 -->
            <el-form-item prop="username" label="账号">
                <el-input
                  v-model="loginForm.username"
                  placeholder="输入您的用户名"
                  size="large"
                  autocomplete="username"
                >
                  <template #prefix>
                    <el-icon><User /></el-icon>
                  </template>
                </el-input>
            </el-form-item>

            <!-- 密码 -->
            <el-form-item prop="password" label="密码">
                <el-input
                  v-model="loginForm.password"
                  :type="showPassword ? 'text' : 'password'"
                  placeholder="输入您的密码"
                  size="large"
                  autocomplete="current-password"
                  @keyup.enter="handleLogin(loginFormRef)"
                >
                  <template #prefix>
                    <el-icon><Lock /></el-icon>
                  </template>
                  <template #suffix>
                    <el-icon class="password-toggle" @click="showPassword = !showPassword">
                      <View v-if="!showPassword" />
                      <Hide v-else />
                    </el-icon>
                  </template>
                </el-input>
            </el-form-item>

            <!-- 选项行 -->
            <div class="form-options">
              <el-checkbox v-model="loginForm.rememberMe">
                <span class="checkbox-label">保持登录</span>
              </el-checkbox>
              <button type="button" class="link-button" @click="handleForgotPassword">
                忘记密码?
              </button>
            </div>

            <!-- 登录按钮 -->
            <el-form-item>
              <button
                type="submit"
                class="submit-button"
                :disabled="loading"
                @click.prevent="handleLogin(loginFormRef)"
              >
                <span v-if="!loading" class="button-content">
                  <span>登录</span>
                  <el-icon class="button-icon"><Right /></el-icon>
                </span>
                <span v-else class="button-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                  <span>登录中...</span>
                </span>
              </button>
            </el-form-item>
          </el-form>

          <!-- 分隔线 -->
          <div class="divider-line">
            <span class="divider-text">或通过以下方式</span>
          </div>

          <!-- 社交登录 -->
          <div class="social-buttons">
            <button type="button" class="social-button" @click="handleSocialLogin('wechat')">
              <el-icon :size="20"><ChatDotRound /></el-icon>
            </button>
            <button type="button" class="social-button" @click="handleSocialLogin('dingtalk')">
              <el-icon :size="20"><Message /></el-icon>
            </button>
            <button type="button" class="social-button" @click="handleSocialLogin('work-wechat')">
              <el-icon :size="20"><ChatLineRound /></el-icon>
            </button>
          </div>

          <!-- 注册链接 -->
          <div class="form-footer">
            <span class="footer-text">还没有账户？</span>
            <button type="button" class="link-button primary" @click="handleRegister">
              创建账户
            </button>
          </div>
        </div>

        <!-- 底部版权 -->
        <div class="copyright">
          © 2024 NEXUS Admin. All rights reserved.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/modules/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import {
  User,
  Lock,
  View,
  Hide,
  Platform,
  Right,
  Loading,
  ChatDotRound,
  Message,
  ChatLineRound
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const loginFormRef = ref<FormInstance>()

const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  rememberMe: false
})

const loginRules = reactive<FormRules>({
  username: [
    { required: true, message: '请输入账户', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在 3 到 50 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

const loading = ref(false)
const showPassword = ref(false)

async function handleLogin(formEl: FormInstance | undefined) {
  if (!formEl) return
  
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      try {
        loading.value = true
        await authStore.login({
          username: loginForm.username,
          password: loginForm.password
        })
        
        ElMessage.success('登录成功')
        
        const redirect = (route.query.redirect as string) || '/'
        router.push(redirect)
      } catch (error) {
        console.error('Login error:', error)
        ElMessage.error('登录失败，请检查用户名和密码')
      } finally {
        loading.value = false
      }
    } else {
      console.log('表单验证失败', fields)
    }
  })
}

function handleForgotPassword() {
  ElMessage.info('忘记密码功能开发中...')
}

function handleRegister() {
  ElMessage.info('注册功能开发中...')
}

function handleSocialLogin(type: string) {
  ElMessage.info(`${type} 登录功能开发中...`)
}
</script>


<style scoped lang="scss">
@import url('https://fonts.googleapis.com/css2?family=Crimson+Pro:wght@400;600;700&family=DM+Sans:wght@400;500;600;700&display=swap');

/* ===== CSS 变量定义 - 云端蓝调配色 ===== */
.login-page {
  /* 天空蓝主色调 */
  --sky-400: #38bdf8;
  --sky-500: #0ea5e9;
  --sky-600: #0284c7;
  --sky-700: #0369a1;
  
  /* 深蓝强调色 */
  --blue-500: #3b82f6;
  --blue-600: #2563eb;
  
  /* 浅色背景 */
  --slate-50: #f8fafc;
  --slate-100: #f1f5f9;
  --slate-200: #e2e8f0;
  --slate-300: #cbd5e1;
  
  /* 文字颜色 */
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #94a3b8;
  
  /* 主题色 */
  --primary: var(--sky-500);
  --primary-dark: var(--sky-600);
  --accent: var(--blue-500);
}


/* ===== 页面容器 ===== */
.login-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, var(--slate-50) 0%, var(--slate-100) 100%);
  overflow: hidden;
  font-family: 'DM Sans', -apple-system, sans-serif;
}

/* ===== 背景层 ===== */
.bg-layers {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.bg-gradient-mesh {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 100% 60% at 0% 0%, rgba(14, 165, 233, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse 80% 50% at 100% 100%, rgba(59, 130, 246, 0.06) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 50% 50%, rgba(14, 165, 233, 0.04) 0%, transparent 50%);
}

.bg-noise {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.02'/%3E%3C/svg%3E");
  opacity: 0.5;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(14, 165, 233, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(14, 165, 233, 0.03) 1px, transparent 1px);
  background-size: 60px 60px;
  mask-image: radial-gradient(ellipse 80% 60% at 50% 50%, black 0%, transparent 80%);
}

.floating-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(100px);
  opacity: 0.4;
  animation: float 20s ease-in-out infinite;
}

.orb-1 {
  width: 600px;
  height: 600px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.15), transparent);
  top: -15%;
  left: -10%;
  animation-delay: 0s;
}

.orb-2 {
  width: 500px;
  height: 500px;
  background: radial-gradient(circle, rgba(59, 130, 246, 0.12), transparent);
  bottom: -10%;
  right: -10%;
  animation-delay: -7s;
}

.orb-3 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(14, 165, 233, 0.1), transparent);
  top: 40%;
  left: 40%;
  animation-delay: -14s;
}

@keyframes float {
  0%, 100% { transform: translate(0, 0) scale(1); }
  33% { transform: translate(30px, -30px) scale(1.05); }
  66% { transform: translate(-20px, 20px) scale(0.95); }
}


/* ===== 主容器 ===== */
.login-container {
  position: relative;
  display: flex;
  min-height: 100vh;
  z-index: 1;
}

/* ===== 左侧视觉区域 ===== */
.visual-section {
  flex: 0 0 60%;
  display: flex;
  align-items: center;
  padding: 80px 100px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(241, 245, 249, 0.6) 100%);
  backdrop-filter: blur(20px);
  border-right: 1px solid rgba(14, 165, 233, 0.1);
}

.visual-content {
  max-width: 600px;
  animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInLeft {
  from {
    opacity: 0;
    transform: translateX(-40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Logo 区域 */
.brand-header {
  margin-bottom: 80px;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.logo-wrapper {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo-shape {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--sky-500), var(--blue-500));
  border-radius: 14px;
  box-shadow: 0 8px 32px rgba(14, 165, 233, 0.25);
  color: white;
  transform: rotate(-5deg);
  transition: transform 0.3s ease;
}

.logo-shape:hover {
  transform: rotate(0deg) scale(1.05);
}

.logo-text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.logo-main {
  font-family: 'Crimson Pro', serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
  line-height: 1;
}

.logo-sub {
  font-size: 13px;
  font-weight: 500;
  color: var(--sky-600);
  letter-spacing: 2px;
  text-transform: uppercase;
}


/* 主标题区域 */
.hero-content {
  margin-bottom: 60px;
}

.hero-title {
  font-family: 'Crimson Pro', serif;
  font-size: 72px;
  font-weight: 700;
  line-height: 1.1;
  margin: 0 0 32px 0;
  color: var(--text-primary);
  letter-spacing: -2px;
}

.title-line {
  display: block;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--sky-600) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  animation: slideUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

.title-line:nth-child(1) { animation-delay: 0.1s; }
.title-line:nth-child(2) { animation-delay: 0.2s; }

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.hero-description {
  font-size: 18px;
  line-height: 1.7;
  color: var(--text-secondary);
  margin: 0;
  animation: fadeIn 0.8s ease-out 0.3s backwards;
}

/* 统计数据网格 */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

.stat-item {
  padding: 24px;
  background: rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(14, 165, 233, 0.12);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  transition: all 0.3s ease;
  animation: scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) backwards;
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.stat-item:hover {
  background: rgba(255, 255, 255, 0.9);
  border-color: rgba(14, 165, 233, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(14, 165, 233, 0.15);
}

.stat-value {
  font-family: 'Crimson Pro', serif;
  font-size: 32px;
  font-weight: 700;
  color: var(--sky-600);
  margin-bottom: 8px;
  line-height: 1;
}

.stat-label {
  font-size: 13px;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}


/* ===== 右侧表单区域 ===== */
.form-section {
  flex: 0 0 40%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 80px 60px 40px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40px);
  box-shadow: -20px 0 60px rgba(14, 165, 233, 0.05);
}

.form-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 440px;
  margin: 0 auto;
  width: 100%;
  animation: slideInRight 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(40px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* 表单头部 */
.form-header {
  margin-bottom: 40px;
  animation: fadeIn 0.6s ease-out 0.2s backwards;
}

.form-title {
  font-family: 'Crimson Pro', serif;
  font-size: 36px;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 12px 0;
  letter-spacing: -0.5px;
}

.form-subtitle {
  font-size: 15px;
  color: var(--text-muted);
  margin: 0;
  line-height: 1.5;
}

/* 表单样式 */
.login-form {
  animation: fadeIn 0.6s ease-out 0.3s backwards;
}

.login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.login-form :deep(.el-form-item__content) {
  line-height: normal;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-label {
  font-size: 14px;
  font-weight: 600;
  color: var(--text-secondary);
  letter-spacing: 0.3px;
}

/* Element Plus 输入框自定义 */
.login-form :deep(.el-input__wrapper) {
  background: var(--slate-50);
  border: 1.5px solid var(--slate-200);
  border-radius: 12px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.login-form :deep(.el-input__wrapper:hover) {
  background: white;
  border-color: var(--slate-300);
}

.login-form :deep(.el-input__wrapper.is-focus) {
  background: white;
  border-color: var(--sky-500);
  box-shadow: 0 0 0 4px rgba(14, 165, 233, 0.1);
}

.login-form :deep(.el-input__inner) {
  color: var(--text-primary);
  font-size: 15px;
  font-weight: 500;
}

.login-form :deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

.login-form :deep(.el-input__prefix) {
  color: var(--text-muted);
  margin-right: 8px;
}

.login-form :deep(.el-input__suffix) {
  color: var(--text-muted);
}

.password-toggle {
  cursor: pointer;
  transition: all 0.2s ease;
}

.password-toggle:hover {
  color: var(--sky-500);
  transform: scale(1.1);
}


/* 表单选项 */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}

.login-form :deep(.el-checkbox) {
  --el-checkbox-checked-bg-color: var(--sky-500);
  --el-checkbox-checked-input-border-color: var(--sky-500);
}

.login-form :deep(.el-checkbox__inner) {
  background: var(--slate-50);
  border-color: var(--slate-300);
  border-radius: 6px;
  width: 18px;
  height: 18px;
}

.login-form :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background: var(--sky-500);
  border-color: var(--sky-500);
}

.checkbox-label {
  font-size: 14px;
  color: var(--text-secondary);
  font-weight: 500;
  margin-left: 8px;
}

.link-button {
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.2s ease;
  padding: 0;
}

.link-button:hover {
  color: var(--sky-500);
}

.link-button.primary {
  color: var(--sky-600);
}

.link-button.primary:hover {
  color: var(--sky-500);
}

/* 提交按钮 */
.submit-button {
  width: 100%;
  height: 56px;
  background: linear-gradient(135deg, var(--sky-500) 0%, var(--blue-500) 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 24px rgba(14, 165, 233, 0.3);
  position: relative;
  overflow: hidden;
}

.submit-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--sky-600) 0%, var(--blue-600) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.submit-button:hover::before {
  opacity: 1;
}

.submit-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(14, 165, 233, 0.4);
}

.submit-button:active {
  transform: translateY(0);
}

.submit-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.button-content,
.button-loading {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.button-icon {
  transition: transform 0.3s ease;
}

.submit-button:hover .button-icon {
  transform: translateX(4px);
}

.button-loading .is-loading {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}


/* 分隔线 */
.divider-line {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 32px 0;
}

.divider-line::before,
.divider-line::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, var(--slate-200), transparent);
}

.divider-text {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 社交登录按钮 */
.social-buttons {
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 32px;
}

.social-button {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--slate-50);
  border: 1.5px solid var(--slate-200);
  border-radius: 12px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-button:hover {
  background: white;
  border-color: var(--sky-500);
  color: var(--sky-500);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(14, 165, 233, 0.2);
}

/* 表单底部 */
.form-footer {
  text-align: center;
  padding-top: 24px;
  border-top: 1px solid var(--slate-200);
}

.footer-text {
  font-size: 14px;
  color: var(--text-muted);
  margin-right: 8px;
}

/* 版权信息 */
.copyright {
  text-align: center;
  font-size: 13px;
  color: var(--text-muted);
  padding-top: 20px;
}

/* 表单验证错误 */
.login-form :deep(.el-form-item__error) {
  color: #f87171;
  font-size: 13px;
  margin-top: 6px;
  font-weight: 500;
}


/* ===== 响应式设计 ===== */
@media (max-width: 1280px) {
  .visual-section {
    padding: 60px 60px;
  }
  
  .hero-title {
    font-size: 56px;
  }
  
  .form-section {
    padding: 60px 40px 40px;
  }
}

@media (max-width: 1024px) {
  .login-container {
    flex-direction: column;
  }
  
  .visual-section {
    flex: 0 0 auto;
    padding: 60px 40px;
    border-right: none;
    border-bottom: 1px solid rgba(14, 165, 233, 0.1);
  }
  
  .visual-content {
    max-width: 100%;
  }
  
  .hero-title {
    font-size: 48px;
  }
  
  .stats-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
  
  .stat-item {
    padding: 20px;
  }
  
  .stat-value {
    font-size: 28px;
  }
  
  .form-section {
    flex: 0 0 auto;
    padding: 60px 40px 40px;
  }
}

@media (max-width: 768px) {
  .visual-section {
    padding: 40px 24px;
  }
  
  .brand-header {
    margin-bottom: 40px;
  }
  
  .logo-shape {
    width: 48px;
    height: 48px;
  }
  
  .logo-main {
    font-size: 28px;
  }
  
  .hero-content {
    margin-bottom: 40px;
  }
  
  .hero-title {
    font-size: 40px;
  }
  
  .hero-description {
    font-size: 16px;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }
  
  .form-section {
    padding: 40px 24px 32px;
  }
  
  .form-title {
    font-size: 32px;
  }
  
  .submit-button {
    height: 52px;
  }
}

@media (max-width: 480px) {
  .visual-section {
    padding: 32px 20px;
  }
  
  .hero-title {
    font-size: 32px;
  }
  
  .form-section {
    padding: 32px 20px 24px;
  }
  
  .form-title {
    font-size: 28px;
  }
  
  .social-buttons {
    gap: 12px;
  }
  
  .social-button {
    width: 48px;
    height: 48px;
  }
}
</style>
