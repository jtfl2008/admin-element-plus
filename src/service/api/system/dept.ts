/**
 * 部门管理 API
 */

import httpClient from '@/service/request/request'
import type {
  Dept,
  DeptSearchParams,
  DeptOperateParams,
  DeptTree
} from '@/typings/api/system'

/**
 * 获取部门列表
 */
export function fetchGetDeptList(params?: DeptSearchParams) {
  return httpClient.get<Dept[]>('/system/dept/list', { params })
}

/**
 * 获取排除部门列表（用于编辑时选择上级部门）
 */
export function fetchGetExcludeDeptList(deptId: number) {
  return httpClient.get<Dept[]>(`/system/dept/list/exclude/${deptId}`)
}

/**
 * 新增部门
 */
export function fetchCreateDept(data: DeptOperateParams) {
  return httpClient.post('/system/dept', data)
}

/**
 * 更新部门
 */
export function fetchUpdateDept(data: DeptOperateParams) {
  return httpClient.put('/system/dept', data)
}

/**
 * 删除部门
 */
export function fetchDeleteDept(deptId: number) {
  return httpClient.delete(`/system/dept/${deptId}`)
}

/**
 * 批量删除部门
 */
export function fetchBatchDeleteDept(deptIds: number[]) {
  return httpClient.delete(`/system/dept/${deptIds.join(',')}`)
}

/**
 * 获取部门选择框列表（用于其他模块）
 */
export function fetchGetDeptSelect() {
  return httpClient.get<DeptTree[]>('/system/dept/optionselect')
}
