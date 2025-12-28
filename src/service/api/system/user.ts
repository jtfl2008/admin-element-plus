/**
 * 用户管理 API
 */

import httpClient from '@/service/request/request'
import type { PageResponse } from '@/typings/api'
import type {
  UserSearchParams,
  User,
  UserOperateParams,
  DeptTree,
  Post,
  Role,
  ResetPasswordParams,
  UpdateUserStatusParams
} from '@/typings/api/system'

/**
 * 获取用户列表
 */
export function fetchGetUserList(params: UserSearchParams) {
  return httpClient.get<PageResponse<User>>('/system/user/list', { params })
}

/**
 * 获取部门树
 */
export function fetchGetDeptTree() {
  return httpClient.get<DeptTree[]>('/system/user/deptTree')
}

/**
 * 新增用户
 */
export function fetchCreateUser(data: UserOperateParams) {
  return httpClient.post('/system/user', data)
}

/**
 * 更新用户
 */
export function fetchUpdateUser(data: UserOperateParams) {
  return httpClient.put('/system/user', data)
}

/**
 * 批量删除用户
 */
export function fetchBatchDeleteUser(userIds: number[]) {
  return httpClient.delete(`/system/user/${userIds.join(',')}`)
}

/**
 * 获取用户详情
 */
export function fetchGetUserInfo(userId: number) {
  return httpClient.get<User>(`/system/user/${userId}`)
}

/**
 * 重置用户密码
 */
export function fetchResetUserPassword(data: ResetPasswordParams) {
  return httpClient.put('/system/user/resetPwd', data)
}

/**
 * 更新用户状态
 */
export function fetchUpdateUserStatus(data: UpdateUserStatusParams) {
  return httpClient.put('/system/user/changeStatus', data)
}

/**
 * 获取岗位列表（选项）
 */
export function fetchGetPostList() {
  return httpClient.get<Post[]>('/system/post/optionSelect')
}

/**
 * 获取角色列表（选项）
 */
export function fetchGetRoleList() {
  return httpClient.get<Role[]>('/system/role/optionSelect')
}

/**
 * 导出用户
 */
export function fetchExportUser(params: UserSearchParams) {
  return httpClient.get('/system/user/export', { 
    params,
    responseType: 'blob'
  })
}

/**
 * 导入用户
 */
export function fetchImportUser(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return httpClient.post('/system/user/import', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}
