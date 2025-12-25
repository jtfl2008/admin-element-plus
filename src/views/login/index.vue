<template>
  <div class="login-page">
    <!-- 背景装饰 -->
    <div class="bg-decoration">
      <div class="bg-gradient"></div>
      <div class="bg-pattern"></div>
    </div>

    <!-- 主内容区域 -->
    <div class="login-wrapper">
      <!-- 左侧品牌区域 -->
      <div class="brand-section">
        <div class="brand-content">
          <div class="brand-logo">
            <el-icon class="logo-icon" :size="48">
              <Platform />
            </el-icon>
            <span class="logo-text">Admin Pro</span>
          </div>
          <h1 class="brand-title">企业级管理平台</h1>
          <p class="brand-desc">安全、高效、智能的一站式解决方案</p>
          <div class="brand-features">
            <div class="feature-item">
              <el-icon class="feature-icon" :size="20">
                <Lock />
              </el-icon>
              <span class="feature-text">安全可靠</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon" :size="20">
                <Lightning />
              </el-icon>
              <span class="feature-text">高效便捷</span>
            </div>
            <div class="feature-item">
              <el-icon class="feature-icon" :size="20">
                <Aim />
              </el-icon>
              <span class="feature-text">精准管理</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧登录表单区域 -->
      <div class="form-section">
        <div class="login-card">
          <div class="card-header">
            <h2 class="card-title">欢迎回来</h2>
            <p class="card-subtitle">请输入您的账户信息登录系统</p>
          </div>

          <el-form
            ref="loginFormRef"
            :model="loginForm"
            :rules="loginRules"
            class="login-form"
            @submit.prevent="handleLogin(loginFormRef)"
          >
            <!-- 账户输入框 -->
            <el-form-item prop="username" class="form-item-custom">
              <template #label>
                <span class="form-label">账户</span>
              </template>
              <el-input
                v-model="loginForm.username"
                :prefix-icon="User"
                placeholder="请输入账户"
                size="large"
                clearable
                autocomplete="username"
              />
            </el-form-item>

            <!-- 密码输入框 -->
            <el-form-item prop="password" class="form-item-custom">
              <template #label>
                <span class="form-label">密码</span>
              </template>
              <el-input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                :prefix-icon="Lock"
                placeholder="请输入密码"
                size="large"
                clearable
                autocomplete="current-password"
                @keyup.enter="handleLogin(loginFormRef)"
              >
                <template #suffix>
                  <el-icon class="password-toggle" @click="showPassword = !showPassword">
                    <View v-if="!showPassword" />
                    <Hide v-else />
                  </el-icon>
                </template>
              </el-input>
            </el-form-item>

            <!-- 记住我 & 忘记密码 -->
            <div class="form-options">
              <el-checkbox v-model="loginForm.rememberMe" class="remember-checkbox">
                记住我
              </el-checkbox>
              <el-link type="primary" :underline="false" @click="handleForgotPassword">
                忘记密码？
              </el-link>
            </div>

            <!-- 登录按钮 -->
            <el-form-item class="form-item-button">
              <el-button
                type="primary"
                size="large"
                :loading="loading"
                class="login-button"
                native-type="submit"
                @click="handleLogin(loginFormRef)"
              >
                {{ loading ? '登录中...' : '登录' }}
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 分隔线 -->
          <div class="divider">
            <span class="divider-text">或使用以下方式登录</span>
          </div>

          <!-- 第三方登录 -->
          <div class="social-login">
            <el-tooltip content="微信登录" placement="top">
              <button type="button" class="social-btn" @click="handleSocialLogin('wechat')">
                <el-icon :size="22">
                  <ChatDotRound />
                </el-icon>
              </button>
            </el-tooltip>
            <el-tooltip content="钉钉登录" placement="top">
              <button type="button" class="social-btn" @click="handleSocialLogin('dingtalk')">
                <el-icon :size="22">
                  <Message />
                </el-icon>
              </button>
            </el-tooltip>
            <el-tooltip content="企业微信登录" placement="top">
              <button type="button" class="social-btn" @click="handleSocialLogin('work-wechat')">
                <el-icon :size="22">
                  <ChatLineRound />
                </el-icon>
              </button>
            </el-tooltip>
          </div>

          <!-- 底部链接 -->
          <div class="card-footer">
            <span class="footer-text">还没有账户？</span>
            <a href="#" class="register-link" @click.prevent="handleRegister">立即注册</a>
          </div>
        </div>
      </div>
    </div>

    <!-- 版权信息 -->
    <div class="copyright">
      <p>© 2024 Admin Pro. All rights reserved.</p>
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
  Lightning,
  Aim,
  ChatDotRound,
  Message,
  ChatLineRound
} from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// 表单引用
const loginFormRef = ref<FormInstance>()

// 表单数据
const loginForm = reactive({
  username: 'admin',
  password: 'admin123',
  rememberMe: false
})

// 表单验证规则
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

// 登录处理
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

// 重置表单
function resetForm(formEl: FormInstance | undefined) {
  if (!formEl) return
  formEl.resetFields()
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


<style scoped>
/* ===== 基础变量 ===== */
.login-page {
  --primary: #3b82f6;
  --primary-dark: #2563eb;
  --primary-light: #60a5fa;
  --bg-dark: #0f172a;
  --bg-card: rgba(30, 41, 59, 0.8);
  --bg-input: rgba(51, 65, 85, 0.5);
  --text-primary: #f1f5f9;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border-color: rgba(148, 163, 184, 0.2);
  --border-focus: rgba(59, 130, 246, 0.5);
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);
}

/* ===== 页面容器 ===== */
.login-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--bg-dark);
  overflow: hidden;
}

/* ===== 背景装饰 ===== */
.bg-decoration {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-gradient {
  position: absolute;
  inset: 0;
  background: 
    radial-gradient(ellipse 80% 50% at 20% 40%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse 60% 40% at 80% 60%, rgba(139, 92, 246, 0.1) 0%, transparent 50%),
    radial-gradient(ellipse 50% 30% at 50% 90%, rgba(6, 182, 212, 0.08) 0%, transparent 50%);
}

.bg-pattern {
  position: absolute;
  inset: 0;
  background-image: 
    linear-gradient(rgba(148, 163, 184, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(148, 163, 184, 0.03) 1px, transparent 1px);
  background-size: 50px 50px;
}

/* ===== 主内容区域 ===== */
.login-wrapper {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  gap: 80px;
  position: relative;
  z-index: 1;
}

/* ===== 品牌区域 ===== */
.brand-section {
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 480px;
}

.brand-content {
  text-align: left;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 32px;
}

.logo-icon {
  color: var(--primary);
}

.logo-text {
  font-size: 24px;
  font-weight: 700;
  color: var(--text-primary);
  letter-spacing: -0.5px;
}

.brand-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--text-primary);
  line-height: 1.2;
  margin: 0 0 16px 0;
  letter-spacing: -1px;
}

.brand-desc {
  font-size: 18px;
  color: var(--text-secondary);
  margin: 0 0 40px 0;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
}

.feature-item:hover {
  background: rgba(59, 130, 246, 0.15);
  transform: translateX(4px);
}

.feature-icon {
  color: var(--primary-light);
}

.feature-text {
  font-size: 15px;
  color: var(--text-secondary);
  font-weight: 500;
}

/* ===== 表单区域 ===== */
.form-section {
  display: flex;
  align-items: center;
  justify-content: center;
}

.login-card {
  width: 420px;
  padding: 40px;
  background: var(--bg-card);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-lg);
}

.card-header {
  text-align: center;
  margin-bottom: 32px;
}

.card-title {
  font-size: 28px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 8px 0;
}

.card-subtitle {
  font-size: 14px;
  color: var(--text-muted);
  margin: 0;
}

/* ===== 表单样式 ===== */
.login-form {
  display: flex;
  flex-direction: column;
}

/* Element Plus 表单项自定义样式 */
.form-item-custom {
  margin-bottom: 24px;
}

.form-item-custom :deep(.el-form-item__label) {
  padding: 0;
  margin-bottom: 8px;
  line-height: 48px;
  height: 48px;
  display: flex;
  align-items: center;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-secondary);
  line-height: 1;
}

/* Element Plus 输入框自定义样式 */
.form-item-custom :deep(.el-input) {
  --el-input-bg-color: var(--bg-input);
  --el-input-border-color: var(--border-color);
  --el-input-hover-border-color: var(--border-focus);
  --el-input-focus-border-color: var(--border-focus);
  --el-input-text-color: var(--text-primary);
  --el-input-placeholder-color: var(--text-muted);
  --el-input-icon-color: var(--text-muted);
  --el-input-clear-hover-color: var(--text-secondary);
}

.form-item-custom :deep(.el-input__wrapper) {
  background: var(--bg-input);
  border-radius: 10px;
  padding: 12px 16px;
  box-shadow: none;
  transition: all 0.3s ease;
}

.form-item-custom :deep(.el-input__wrapper:hover) {
  box-shadow: none;
}

.form-item-custom :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-item-custom :deep(.el-input__inner) {
  color: var(--text-primary);
  font-size: 15px;
}

.form-item-custom :deep(.el-input__inner::placeholder) {
  color: var(--text-muted);
}

.form-item-custom :deep(.el-input__prefix) {
  color: var(--text-muted);
}

.form-item-custom :deep(.el-input__suffix) {
  color: var(--text-muted);
}

/* 密码切换图标 */
.password-toggle {
  cursor: pointer;
  transition: color 0.2s;
}

.password-toggle:hover {
  color: var(--text-secondary);
}

/* 表单验证错误样式 */
.form-item-custom :deep(.el-form-item__error) {
  color: #f56c6c;
  font-size: 12px;
  padding-top: 4px;
}


/* ===== 表单选项 ===== */
.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

/* Element Plus 复选框自定义样式 */
.remember-checkbox {
  --el-checkbox-text-color: var(--text-secondary);
  --el-checkbox-input-border-color: var(--border-color);
  --el-checkbox-checked-bg-color: var(--primary);
  --el-checkbox-checked-input-border-color: var(--primary);
}

.remember-checkbox :deep(.el-checkbox__label) {
  color: var(--text-secondary);
  font-size: 14px;
}

.remember-checkbox :deep(.el-checkbox__inner) {
  background-color: transparent;
  border-color: var(--border-color);
}

.remember-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--primary);
  border-color: var(--primary);
}

/* Element Plus 链接自定义样式 */
.form-options :deep(.el-link) {
  --el-link-text-color: var(--primary-light);
  --el-link-hover-text-color: var(--primary);
  font-size: 14px;
}

/* ===== 登录按钮 ===== */
.form-item-button {
  margin-bottom: 0;
}

.form-item-button :deep(.el-form-item__content) {
  margin-left: 0 !important;
}

.login-button {
  width: 100%;
  height: 50px;
  background: linear-gradient(135deg, var(--primary) 0%, var(--primary-dark) 100%);
  border: none;
  border-radius: 10px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  box-shadow: var(--shadow-md), var(--shadow-glow);
  --el-button-bg-color: transparent;
  --el-button-border-color: transparent;
  --el-button-hover-bg-color: transparent;
  --el-button-hover-border-color: transparent;
  --el-button-active-bg-color: transparent;
  --el-button-active-border-color: transparent;
}

.login-button::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--primary-light) 0%, var(--primary) 100%);
  opacity: 0;
  transition: opacity 0.3s;
  border-radius: 10px;
}

.login-button:hover::before {
  opacity: 1;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg), 0 0 30px rgba(59, 130, 246, 0.4);
}

.login-button:active {
  transform: translateY(0);
}

.login-button :deep(.el-button__text) {
  position: relative;
  z-index: 1;
}

/* ===== 分隔线 ===== */
.divider {
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 28px 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--border-color);
}

.divider-text {
  font-size: 13px;
  color: var(--text-muted);
  white-space: nowrap;
}

/* ===== 第三方登录 ===== */
.social-login {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.social-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-input);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.social-btn:hover {
  background: rgba(59, 130, 246, 0.1);
  border-color: var(--primary);
  color: var(--primary);
  transform: translateY(-2px);
}

/* ===== 底部链接 ===== */
.card-footer {
  text-align: center;
  margin-top: 28px;
  padding-top: 24px;
  border-top: 1px solid var(--border-color);
}

.footer-text {
  font-size: 14px;
  color: var(--text-muted);
}

.register-link {
  font-size: 14px;
  color: var(--primary-light);
  text-decoration: none;
  font-weight: 500;
  margin-left: 4px;
  transition: color 0.2s;
}

.register-link:hover {
  color: var(--primary);
}

/* ===== 版权信息 ===== */
.copyright {
  text-align: center;
  padding: 20px;
  position: relative;
  z-index: 1;
}

.copyright p {
  font-size: 13px;
  color: var(--text-muted);
  margin: 0;
}

/* ===== 响应式设计 ===== */
@media (max-width: 1024px) {
  .login-wrapper {
    flex-direction: column;
    gap: 40px;
    padding: 30px 20px;
  }

  .brand-section {
    max-width: 100%;
  }

  .brand-content {
    text-align: center;
  }

  .brand-title {
    font-size: 32px;
  }

  .brand-desc {
    margin-bottom: 24px;
  }

  .brand-features {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }

  .feature-item {
    flex: 0 0 auto;
  }

  .feature-item:hover {
    transform: translateY(-2px);
  }
}

@media (max-width: 768px) {
  .brand-section {
    display: none;
  }

  .login-card {
    width: 100%;
    max-width: 400px;
    padding: 32px 24px;
  }

  .card-title {
    font-size: 24px;
  }

  .login-form {
    gap: 20px;
  }

  .social-login {
    gap: 12px;
  }

  .social-btn {
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .login-wrapper {
    padding: 20px 16px;
  }

  .login-card {
    padding: 28px 20px;
    border-radius: 12px;
  }

  .card-title {
    font-size: 22px;
  }

  .form-input {
    height: 46px;
  }

  .login-btn {
    height: 48px;
  }
}
</style>
