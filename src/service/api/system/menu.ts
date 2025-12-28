/**
 * 菜单管理 API
 */

import httpClient from '@/service/request/request'
import type {
  MenuSearchParams,
  Menu,
  MenuOperateParams,
  MenuTreeNode,
  MenuTreeSelectNode,
  RoleMenuTree,
  TenantPackageMenuTree
} from '@/typings/api/system'

/**
 * 获取菜单列表
 */
export function fetchGetMenuList(
  params?: MenuSearchParams,
  signal?: AbortSignal
) {
  return httpClient.get<Menu[]>('/system/menu/list', { params, signal })
}

/**
 * 新增菜单
 */
export function fetchCreateMenu(data: MenuOperateParams) {
  return httpClient.post('/system/menu', data)
}

/**
 * 更新菜单
 */
export function fetchUpdateMenu(data: MenuOperateParams) {
  return httpClient.put('/system/menu', data)
}

/**
 * 删除菜单
 */
export function fetchDeleteMenu(menuId: number) {
  return httpClient.delete(`/system/menu/${menuId}`)
}

/**
 * 获取菜单详情
 */
export function fetchGetMenuInfo(menuId: number) {
  return httpClient.get<Menu>(`/system/menu/${menuId}`)
}

/**
 * 获取菜单树（用于选择父菜单）
 */
export function fetchGetMenuTreeSelect() {
  return httpClient.get<MenuTreeSelectNode[]>('/system/menu/treeselect')
}

/**
 * 获取角色菜单树（用于角色权限分配）
 */
export function fetchGetRoleMenuTreeSelect(roleId: number) {
  return httpClient.get<RoleMenuTree>(`/system/menu/roleMenuTreeselect/${roleId}`)
}

/**
 * 获取租户套餐菜单树
 */
export function fetchGetTenantPackageMenuTreeSelect(packageId: number) {
  return httpClient.get<TenantPackageMenuTree>(
    `/system/menu/tenantPackageMenuTreeselect/${packageId}`
  )
}
