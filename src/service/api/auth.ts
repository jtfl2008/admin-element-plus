/**
 * 认证相关 API
 */

import httpClient from '../request'
import type { LoginParams, LoginResponse, UserInfo, ApiResponse } from '@/typings/api'

/**
 * 登录
 */
export function loginApi(data: LoginParams) {
  return httpClient.post<LoginResponse>('/auth/login', data)
}

/**
 * 登出
 */
export function logoutApi() {
  return httpClient.post('/auth/logout')
}

/**
 * 获取用户信息
 */
export function getUserInfoApi() {
  return httpClient.get<UserInfo>('/auth/userinfo')
}

/**
 * 刷新 Token
 */
export function refreshTokenApi(refreshToken: string) {
  return httpClient.post<LoginResponse>('/auth/refresh', { refreshToken })
}
