/**
 * 认证工具模块
 */

import { localStorage } from './storage'
import { TOKEN_KEY } from '@/constants'

/**
 * 简单的 Base64 加密（用于演示，生产环境建议使用更安全的加密方式）
 */
function encryptToken(token: string): string {
  try {
    return btoa(encodeURIComponent(token))
  } catch (error) {
    console.error('Token encryption error:', error)
    throw error
  }
}

/**
 * Base64 解密
 */
function decryptToken(encryptedToken: string): string {
  try {
    return decodeURIComponent(atob(encryptedToken))
  } catch (error) {
    console.error('Token decryption error:', error)
    throw error
  }
}

/**
 * 获取 Token
 */
export function getToken(): string | null {
  const encryptedToken = localStorage.getItem<string>(TOKEN_KEY)
  if (!encryptedToken) {
    return null
  }

  try {
    return decryptToken(encryptedToken)
  } catch (error) {
    // 如果解密失败，清除无效的 token
    removeToken()
    return null
  }
}

/**
 * 设置 Token
 */
export function setToken(token: string): void {
  const encryptedToken = encryptToken(token)
  localStorage.setItem(TOKEN_KEY, encryptedToken)
}

/**
 * 删除 Token
 */
export function removeToken(): void {
  localStorage.removeItem(TOKEN_KEY)
}

// 导出加密解密函数供测试使用
export { encryptToken, decryptToken }
