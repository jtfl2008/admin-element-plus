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
  postId: number              // 岗位ID
  tenantId?: number           // 租户编号
  deptId?: number             // 部门ID
  deptName?: string           // 部门名称
  postCode: string            // 岗位编码
  postCategory?: string       // 类别编码
  postName: string            // 岗位名称
  postSort: number            // 显示顺序
  status: '0' | '1'           // 状态（0:正常 1:停用）
  remark?: string             // 备注
  createTime?: string         // 创建时间
  updateTime?: string         // 更新时间
}

/**
 * 岗位搜索参数
 */
export interface PostSearchParams extends PageQuery {
  postCode?: string           // 岗位编码
  postName?: string           // 岗位名称
  status?: '0' | '1'          // 状态
  deptId?: number             // 归属部门ID
}

/**
 * 岗位操作参数（新增/编辑）
 */
export interface PostOperateParams {
  postId?: number             // 岗位ID（编辑时必填）
  deptId?: number             // 部门ID
  postCode: string            // 岗位编码
  postCategory?: string       // 类别编码
  postName: string            // 岗位名称
  postSort: number            // 显示顺序
  status: '0' | '1'           // 状态
  remark?: string             // 备注
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

/**
 * 字典类型实体
 */
export interface DictType {
  dictId: number              // 字典主键
  dictName: string            // 字典名称
  dictType: string            // 字典类型
  status: '0' | '1'           // 状态（0:正常 1:停用）
  remark?: string             // 备注
  createTime?: string         // 创建时间
  updateTime?: string         // 更新时间
}

/**
 * 字典类型搜索参数
 */
export interface DictTypeSearchParams extends PageQuery {
  dictName?: string           // 字典名称
  dictType?: string           // 字典类型
  status?: '0' | '1'          // 状态
}

/**
 * 字典类型操作参数（新增/编辑）
 */
export interface DictTypeOperateParams {
  dictId?: number             // 字典主键（编辑时必填）
  dictName: string            // 字典名称
  dictType: string            // 字典类型
  remark?: string             // 备注
}

/**
 * 字典数据实体
 */
export interface DictData {
  dictCode: number            // 字典编码
  dictType: string            // 字典类型
  dictLabel: string           // 字典标签
  dictValue: string           // 字典键值
  dictSort: number            // 字典排序
  listClass: string           // 表格回显样式
  cssClass?: string           // CSS样式类名
  isDefault: 'Y' | 'N'        // 是否默认（Y:是 N:否）
  status: '0' | '1'           // 状态（0:正常 1:停用）
  remark?: string             // 备注
  createTime?: string         // 创建时间
  updateTime?: string         // 更新时间
}

/**
 * 字典数据搜索参数
 */
export interface DictDataSearchParams extends PageQuery {
  dictType?: string           // 字典类型
  dictLabel?: string          // 字典标签
  status?: '0' | '1'          // 状态
}

/**
 * 字典数据操作参数（新增/编辑）
 */
export interface DictDataOperateParams {
  dictCode?: number           // 字典编码（编辑时必填）
  dictType: string            // 字典类型
  dictLabel: string           // 字典标签
  dictValue: string           // 字典键值
  dictSort: number            // 字典排序
  listClass: string           // 表格回显样式
  cssClass?: string           // CSS样式类名
  isDefault?: 'Y' | 'N'       // 是否默认
  status: '0' | '1'           // 状态
  remark?: string             // 备注
}

/**
 * 字典树形节点
 */
export interface DictTreeNode {
  id: string                      // 唯一标识（字典类型: `type-${dictId}`, 字典数据: `data-${dictCode}`）
  type: 'dict-type' | 'dict-data' // 节点类型
  data: DictType | DictData       // 节点数据
  children?: DictTreeNode[]       // 子节点（仅字典类型有子节点）
  hasChildren?: boolean           // 是否有子节点
}
