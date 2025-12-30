/**
 * 个人中心相关 API
 */

import httpClient from '../request/request'
import type { PageResponse } from '@/typings/api'
import type {
  UserProfile,
  UpdateProfileParams,
  ChangePasswordParams,
  LoginLog,
  LoginLogQuery,
} from '@/typings/profile'

/**
 * 获取个人资料
 */
export function fetchUserProfile() {
  return httpClient.get<UserProfile>('/system/user/profile')
}

/**
 * 更新个人资料
 * @param data 更新参数
 */
export function updateUserProfile(data: UpdateProfileParams) {
  return httpClient.put<void>('/system/user/profile', data)
}

/**
 * 上传头像
 * @param file 头像文件
 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatarfile', file)

  return httpClient.post<{ imgUrl: string }>('/system/user/profile/avatar', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
}

/**
 * 修改密码
 * @param data 密码修改参数
 */
export function changePassword(data: ChangePasswordParams) {
  return httpClient.put<void>('/system/user/profile/updatePwd', data)
}

/**
 * 获取登录日志
 * @param params 查询参数
 */
export function fetchLoginLog(params: LoginLogQuery) {
  return httpClient.get<PageResponse<LoginLog>>('/system/user/profile/loginLog', {
    params,
  })
}
