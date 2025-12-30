/**
 * 个人中心相关类型定义
 */

import type { PageQuery } from './api'

/**
 * 用户个人资料
 */
export interface UserProfile {
  userId: number
  userName: string
  nickName: string
  deptName?: string
  postNames?: string[]
  roleNames?: string[]
  phonenumber?: string
  email?: string
  sex: string
  avatar?: string
  createTime?: string
}

/**
 * 更新个人资料参数
 */
export interface UpdateProfileParams {
  nickName: string
  phonenumber?: string
  email?: string
  sex: string
}

/**
 * 修改密码参数
 */
export interface ChangePasswordParams {
  oldPassword: string
  newPassword: string
}

/**
 * 登录日志
 */
export interface LoginLog {
  infoId: number
  userName: string
  ipaddr: string
  loginLocation: string
  browser: string
  os: string
  status: '0' | '1'  // 0:成功 1:失败
  msg?: string
  loginTime: string
}

/**
 * 登录日志查询参数
 */
export interface LoginLogQuery extends PageQuery {
  // 可以扩展其他查询参数
}
