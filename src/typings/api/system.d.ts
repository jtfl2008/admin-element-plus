/**
 * 系统管理模块 API 类型定义
 */

import type { PageQuery } from '../api'

/**
 * 用户搜索参数
 */
export interface UserSearchParams extends PageQuery {
  userName?: string
  nickName?: string
  phonenumber?: string
  status?: string
  deptId?: number
}

/**
 * 用户实体
 */
export interface User {
  userId: number
  userName: string
  nickName: string
  deptId: number
  deptName?: string
  phonenumber?: string
  email?: string
  sex: string
  avatar?: string
  status: string
  postIds?: number[]
  roleIds?: number[]
  remark?: string
  createTime?: string
  updateTime?: string
}

/**
 * 用户操作参数（新增/编辑）
 */
export interface UserOperateParams {
  userId?: number
  userName: string
  nickName: string
  password?: string
  deptId?: number
  phonenumber?: string
  email?: string
  sex?: string
  postIds?: number[]
  roleIds?: number[]
  status: string
  remark?: string
}

/**
 * 部门实体
 */
export interface Dept {
  deptId: number
  parentId: number
  deptName: string
  orderNum: number
  leader: string
  phone: string
  email: string
  status: '0' | '1'  // 0:正常 1:停用
  children?: Dept[]
  createTime?: string
  updateTime?: string
  remark?: string
}

/**
 * 部门搜索参数
 */
export interface DeptSearchParams {
  deptName?: string
  status?: '0' | '1'
}

/**
 * 部门操作参数（新增/编辑）
 */
export interface DeptOperateParams {
  deptId?: number
  parentId: number
  deptName: string
  orderNum: number
  leader?: string
  phone?: string
  email?: string
  status: '0' | '1'
  remark?: string
}

/**
 * 部门树节点
 */
export interface DeptTree {
  id: number
  label: string
  children?: DeptTree[]
}

/**
 * 岗位实体
 */
export interface Post {
  postId: number
  postCode: string
  postName: string
  postSort: number
  status: string
  remark?: string
}

/**
 * 角色实体
 */
export interface Role {
  roleId: number
  roleName: string
  roleKey: string
  roleSort: number
  status: string
  remark?: string
}

/**
 * 重置密码参数
 */
export interface ResetPasswordParams {
  userId: number
  password: string
}

/**
 * 更新用户状态参数
 */
export interface UpdateUserStatusParams {
  userId: number
  status: string
}

/**
 * 角色搜索参数
 */
export interface RoleSearchParams extends PageQuery {
  roleName?: string
  roleKey?: string
  status?: string
  createTime?: [string, string]
}

/**
 * 角色实体（完整）
 */
export interface RoleDetail extends Role {
  dataScope: string
  delFlag?: string
  createTime?: string
  updateTime?: string
  menuIds?: number[]
  deptIds?: number[]
}

/**
 * 角色操作参数（新增/编辑）
 */
export interface RoleOperateParams {
  roleId?: number
  roleName: string
  roleKey: string
  roleSort: number
  status: string
  menuIds: number[]
  remark?: string
}

/**
 * 数据权限配置参数
 */
export interface DataScopeParams {
  roleId: number
  roleName: string
  roleKey: string
  dataScope: string
  deptIds?: number[]
}

/**
 * 菜单树节点
 */
export interface MenuTreeNode {
  id: number
  label: string
  children?: MenuTreeNode[]
}

/**
 * 角色菜单树
 */
export interface RoleMenuTree {
  menus: MenuTreeNode[]
  checkedKeys: number[]
}

/**
 * 部门树节点（用于数据权限）
 */
export interface DeptTreeNode {
  id: number
  label: string
  children?: DeptTreeNode[]
}

/**
 * 角色部门树
 */
export interface RoleDeptTree {
  depts: DeptTreeNode[]
  checkedKeys: number[]
}

/**
 * 角色用户搜索参数
 */
export interface RoleUserSearchParams extends PageQuery {
  roleId: number
  userName?: string
  phonenumber?: string
}

/**
 * 菜单搜索参数
 */
export interface MenuSearchParams {
  menuName?: string
  menuType?: 'M' | 'C' | 'F'
  status?: '0' | '1'
  visible?: '0' | '1'
}

/**
 * 菜单实体
 */
export interface Menu {
  menuId: number
  parentId: number
  menuName: string
  orderNum: number
  path: string
  component: string
  queryParam: string
  isFrame: '0' | '1' | '2'  // 0:是 1:否 2:iframe
  isCache: '0' | '1'         // 0:缓存 1:不缓存
  menuType: 'M' | 'C' | 'F'  // M:目录 C:菜单 F:按钮
  visible: '0' | '1'         // 0:显示 1:隐藏
  status: '0' | '1'          // 0:正常 1:停用
  perms: string
  icon: string
  iconType: '1' | '2'        // 1:Iconify 2:本地
  children?: Menu[]
  createTime?: string
  updateTime?: string
  remark?: string
}

/**
 * 菜单操作参数（新增/编辑）
 */
export interface MenuOperateParams {
  menuId?: number
  parentId: number
  menuName: string
  orderNum: number
  path?: string
  component?: string
  queryParam?: string
  isFrame?: '0' | '1' | '2'
  isCache?: '0' | '1'
  menuType: 'M' | 'C' | 'F'
  visible: '0' | '1'
  status: '0' | '1'
  perms?: string
  icon?: string
  iconType?: '1' | '2'
  remark?: string
}

/**
 * 菜单树选择节点（扩展版本，包含图标）
 */
export interface MenuTreeSelectNode {
  id: number
  label: string
  icon?: string
  iconType?: '1' | '2'
  children?: MenuTreeSelectNode[]
}

/**
 * 租户套餐菜单树
 */
export interface TenantPackageMenuTree {
  menus: MenuTreeNode[]
  checkedKeys: number[]
}
