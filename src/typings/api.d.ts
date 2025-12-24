/**
 * API 相关类型定义
 */

/**
 * 基础 API 响应类型
 */
export interface ApiResponse<T = any> {
  code: number
  msg: string
  data: T
}

/**
 * 分页响应类型
 */
export interface PageResponse<T = any> {
  rows: T[]
  total: number
}

/**
 * 分页查询参数类型
 */
export interface PageQuery {
  pageNum: number
  pageSize: number
  orderByColumn?: string
  isAsc?: 'asc' | 'desc'
}

/**
 * 用户信息类型
 */
export interface UserInfo {
  userId: number
  userName: string
  nickName: string
  email: string
  phonenumber: string
  sex: string
  avatar: string
  roles: string[]
  permissions: string[]
}

/**
 * 登录参数类型
 */
export interface LoginParams {
  username: string
  password: string
  code?: string
  uuid?: string
}

/**
 * 登录响应类型
 */
export interface LoginResponse {
  token: string
}
