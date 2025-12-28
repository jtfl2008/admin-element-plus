/**
 * 角色管理 API
 */

import httpClient from '@/service/request/request'
import type { PageResponse } from '@/typings/api'
import type {
  RoleSearchParams,
  Role,
  RoleOperateParams,
  DataScopeParams,
  RoleMenuTree,
  RoleDeptTree,
  RoleUserSearchParams,
  User
} from '@/typings/api/system'

/**
 * 获取角色列表
 */
export function fetchGetRoleList(params?: RoleSearchParams) {
  return httpClient.get<PageResponse<Role>>('/system/role/list', { params })
}

/**
 * 新增角色
 */
export function fetchCreateRole(data: RoleOperateParams) {
  return httpClient.post('/system/role', data)
}

/**
 * 更新角色
 */
export function fetchUpdateRole(data: RoleOperateParams) {
  return httpClient.put('/system/role', data)
}

/**
 * 批量删除角色
 */
export function fetchBatchDeleteRole(roleIds: number[]) {
  return httpClient.delete(`/system/role/${roleIds.join(',')}`)
}

/**
 * 获取角色详情
 */
export function fetchGetRoleInfo(roleId: number) {
  return httpClient.get<Role>(`/system/role/${roleId}`)
}

/**
 * 更新角色状态
 */
export function fetchUpdateRoleStatus(data: { roleId: number; status: string }) {
  return httpClient.put('/system/role/changeStatus', data)
}

/**
 * 获取角色菜单树
 */
export function fetchGetRoleMenuTreeSelect(roleId: number) {
  return httpClient.get<RoleMenuTree>(`/system/role/roleMenuTreeselect/${roleId}`)
}

/**
 * 获取角色部门树
 */
export function fetchGetRoleDeptTreeSelect(roleId: number) {
  return httpClient.get<RoleDeptTree>(`/system/role/deptTree/${roleId}`)
}

/**
 * 配置数据权限
 */
export function fetchUpdateDataScope(data: DataScopeParams) {
  return httpClient.put('/system/role/dataScope', data)
}

/**
 * 获取角色已分配用户列表
 */
export function fetchGetRoleUserList(params: RoleUserSearchParams) {
  return httpClient.get<PageResponse<User>>('/system/role/authUser/allocatedList', { params })
}

/**
 * 获取角色未分配用户列表
 */
export function fetchGetRoleUnallocatedUserList(params: RoleUserSearchParams) {
  return httpClient.get<PageResponse<User>>('/system/role/authUser/unallocatedList', { params })
}

/**
 * 批量授权用户
 */
export function fetchAuthUserSelectAll(data: { roleId: number; userIds: number[] }) {
  return httpClient.put('/system/role/authUser/selectAll', data)
}

/**
 * 取消授权用户
 */
export function fetchCancelAuthUser(data: { roleId: number; userId: number }) {
  return httpClient.put('/system/role/authUser/cancel', data)
}

/**
 * 批量取消授权用户
 */
export function fetchCancelAuthUserAll(data: { roleId: number; userIds: number[] }) {
  return httpClient.put('/system/role/authUser/cancelAll', data)
}

/**
 * 导出角色
 */
export function fetchExportRole(params?: RoleSearchParams) {
  return httpClient.get('/system/role/export', { 
    params,
    responseType: 'blob'
  })
}
