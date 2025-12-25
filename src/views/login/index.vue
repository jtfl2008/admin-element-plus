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
              <el-link type="primary" underline="never" @click="handleForgotPassword">
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


<style scoped lang="scss">
/* ===== 基础变量 ===== */
.login-page {
  --login-bg: var(--bg-dark);
  --login-card-bg: var(--bg-elevated);
  --login-input-bg: var(--bg-secondary);
  --login-text: var(--text-primary);
  --login-text-secondary: var(--text-secondary);
  --login-text-muted: var(--text-tertiary);
  --login-border: var(--border-base);
  --login-border-focus: var(--color-primary);
  --login-primary: var(--color-primary);
  --login-primary-hover: var(--color-primary-dark);
}

/* ===== 页面容器 ===== */
.login-page {
  position: relative;
  width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: var(--login-bg);
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
  padding: var(--spacing-2xl) var(--spacing-lg);
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
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.logo-icon {
  color: var(--login-primary);
}

.logo-text {
  font-size: var(--font-size-2xl);
  font-weight: 700;
  color: var(--login-text);
  letter-spacing: -0.5px;
}

.brand-title {
  font-size: 42px;
  font-weight: 700;
  color: var(--login-text);
  line-height: 1.2;
  margin: 0 0 var(--spacing-md) 0;
  letter-spacing: -1px;
}

.brand-desc {
  font-size: var(--font-size-lg);
  color: var(--login-text-secondary);
  margin: 0 0 var(--spacing-2xl) 0;
  line-height: 1.6;
}

.brand-features {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.feature-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-md);
  background: var(--color-primary-light);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-primary);
  transition: all var(--transition-normal);
}

.feature-item:hover {
  background: var(--color-primary-lighter);
  transform: translateX(4px);
}

.feature-icon {
  color: var(--login-primary);
}

.feature-text {
  font-size: var(--font-size-base);
  color: var(--login-text-secondary);
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
  padding: var(--spacing-2xl);
  background: var(--login-card-bg);
  backdrop-filter: blur(20px);
  border-radius: var(--radius-xl);
  border: 1px solid var(--login-border);
  box-shadow: var(--shadow-xl);
}

.card-header {
  text-align: center;
  margin-bottom: var(--spacing-xl);
}

.card-title {
  font-size: var(--font-size-2xl);
  font-weight: 600;
  color: var(--login-text);
  margin: 0 0 var(--spacing-sm) 0;
}

.card-subtitle {
  font-size: var(--font-size-sm);
  color: var(--login-text-muted);
  margin: 0;
}

/* ===== 表单样式 ===== */
.login-form {
  display: flex;
  flex-direction: column;
}

/* Element Plus 表单项自定义样式 */
.form-item-custom {
  margin-bottom: var(--spacing-lg);
}

.form-item-custom :deep(.el-form-item__label) {
  padding: 0;
  margin-bottom: var(--spacing-sm);
  line-height: 48px;
  height: 48px;
  display: flex;
  align-items: center;
}

.form-label {
  font-size: var(--font-size-sm);
  font-weight: 500;
  color: var(--login-text-secondary);
  line-height: 1;
}

/* Element Plus 输入框自定义样式 */
.form-item-custom :deep(.el-input) {
  --el-input-bg-color: var(--login-input-bg);
  --el-input-border-color: var(--login-border);
  --el-input-hover-border-color: var(--login-border-focus);
  --el-input-focus-border-color: var(--login-border-focus);
  --el-input-text-color: var(--login-text);
  --el-input-placeholder-color: var(--login-text-muted);
  --el-input-icon-color: var(--login-text-muted);
  --el-input-clear-hover-color: var(--login-text-secondary);
}

.form-item-custom :deep(.el-input__wrapper) {
  background: var(--login-input-bg);
  border-radius: var(--radius-md);
  padding: var(--spacing-sm) var(--spacing-md);
  box-shadow: none;
  transition: all var(--transition-normal);
}

.form-item-custom :deep(.el-input__wrapper:hover) {
  box-shadow: none;
}

.form-item-custom :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.form-item-custom :deep(.el-input__inner) {
  color: var(--login-text);
  font-size: var(--font-size-base);
}

.form-item-custom :deep(.el-input__inner::placeholder) {
  color: var(--login-text-muted);
}

.form-item-custom :deep(.el-input__prefix) {
  color: var(--login-text-muted);
}

.form-item-custom :deep(.el-input__suffix) {
  color: var(--login-text-muted);
}

/* 密码切换图标 */
.password-toggle {
  cursor: pointer;
  transition: color var(--transition-fast);
}

.password-toggle:hover {
  color: var(--login-text-secondary);
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
  margin-bottom: var(--spacing-lg);
}

/* Element Plus 复选框自定义样式 */
.remember-checkbox {
  --el-checkbox-text-color: var(--login-text-secondary);
  --el-checkbox-input-border-color: var(--login-border);
  --el-checkbox-checked-bg-color: var(--login-primary);
  --el-checkbox-checked-input-border-color: var(--login-primary);
}

.remember-checkbox :deep(.el-checkbox__label) {
  color: var(--login-text-secondary);
  font-size: var(--font-size-sm);
}

.remember-checkbox :deep(.el-checkbox__inner) {
  background-color: transparent;
  border-color: var(--login-border);
}

.remember-checkbox :deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: var(--login-primary);
  border-color: var(--login-primary);
}

/* Element Plus 链接自定义样式 */
.form-options :deep(.el-link) {
  --el-link-text-color: var(--login-primary);
  --el-link-hover-text-color: var(--login-primary-hover);
  font-size: var(--font-size-sm);
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
  background: linear-gradient(135deg, var(--login-primary) 0%, var(--login-primary-hover) 100%);
  border: none;
  border-radius: var(--radius-md);
  font-size: var(--font-size-md);
  font-weight: 600;
  transition: all var(--transition-normal);
  box-shadow: var(--shadow-md);
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
  background: linear-gradient(135deg, var(--login-primary-hover) 0%, var(--login-primary) 100%);
  opacity: 0;
  transition: opacity var(--transition-normal);
  border-radius: var(--radius-md);
}

.login-button:hover::before {
  opacity: 1;
}

.login-button:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
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
  gap: var(--spacing-md);
  margin: var(--spacing-xl) 0;
}

.divider::before,
.divider::after {
  content: '';
  flex: 1;
  height: 1px;
  background: var(--login-border);
}

.divider-text {
  font-size: var(--font-size-sm);
  color: var(--login-text-muted);
  white-space: nowrap;
}

/* ===== 第三方登录 ===== */
.social-login {
  display: flex;
  justify-content: center;
  gap: var(--spacing-md);
}

.social-btn {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--login-input-bg);
  border: 1px solid var(--login-border);
  border-radius: var(--radius-md);
  color: var(--login-text-secondary);
  cursor: pointer;
  transition: all var(--transition-normal);
}

.social-btn:hover {
  background: var(--color-primary-light);
  border-color: var(--login-primary);
  color: var(--login-primary);
  transform: translateY(-2px);
}

/* ===== 底部链接 ===== */
.card-footer {
  text-align: center;
  margin-top: var(--spacing-xl);
  padding-top: var(--spacing-lg);
  border-top: 1px solid var(--login-border);
}

.footer-text {
  font-size: var(--font-size-sm);
  color: var(--login-text-muted);
}

.register-link {
  font-size: var(--font-size-sm);
  color: var(--login-primary);
  text-decoration: none;
  font-weight: 500;
  margin-left: var(--spacing-xs);
  transition: color var(--transition-fast);
}

.register-link:hover {
  color: var(--login-primary-hover);
}

/* ===== 版权信息 ===== */
.copyright {
  text-align: center;
  padding: var(--spacing-lg);
  position: relative;
  z-index: 1;
}

.copyright p {
  font-size: var(--font-size-sm);
  color: var(--login-text-muted);
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
