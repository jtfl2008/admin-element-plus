/**
 * 菜单表单验证工具函数
 */

import type { MenuOperateParams } from '@/typings/api/system'

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 验证菜单表单数据
 * @param form 菜单表单数据
 * @returns 验证结果
 */
export function validateMenuForm(form: MenuOperateParams): ValidationResult {
  const errors: string[] = []

  // 1. 验证必填字段
  if (!form.menuName || form.menuName.trim() === '') {
    errors.push('菜单名称不能为空')
  }

  if (!form.menuType) {
    errors.push('菜单类型不能为空')
  }

  // 2. 验证菜单类型为菜单（C）时的特定字段
  if (form.menuType === 'C') {
    if (!form.path || form.path.trim() === '') {
      errors.push('菜单类型为菜单时，路由地址不能为空')
    }

    if (!form.component || form.component.trim() === '') {
      errors.push('菜单类型为菜单时，组件路径不能为空')
    }
  }

  // 3. 验证菜单类型为按钮（F）时的权限标识
  if (form.menuType === 'F') {
    if (!form.perms || form.perms.trim() === '') {
      errors.push('菜单类型为按钮时，权限标识不能为空')
    }
  }

  // 4. 验证显示顺序为非负整数
  if (form.orderNum !== undefined && form.orderNum !== null) {
    if (!Number.isInteger(form.orderNum) || form.orderNum < 0) {
      errors.push('显示顺序必须为非负整数')
    }
  }

  // 5. 验证外链菜单的 URL 格式
  if (form.isFrame === '0' && form.path) {
    if (!isValidUrl(form.path)) {
      errors.push('外链菜单的路由地址必须为有效的 URL 格式')
    }
  }

  // 6. 验证权限标识格式（如果有值）
  if (form.perms && form.perms.trim() !== '') {
    if (!isValidPermission(form.perms)) {
      errors.push('权限标识格式不正确，应为类似 system:menu:add 的格式')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证 URL 格式
 * @param url URL 字符串
 * @returns 是否为有效的 URL
 */
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url)
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:'
  } catch {
    return false
  }
}

/**
 * 验证权限标识格式
 * @param permission 权限标识字符串
 * @returns 是否为有效的权限标识
 */
function isValidPermission(permission: string): boolean {
  // 权限标识格式：模块:功能:操作，例如 system:menu:add
  // 允许使用字母、数字、下划线、冒号
  const permissionRegex = /^[a-zA-Z0-9_]+:[a-zA-Z0-9_]+:[a-zA-Z0-9_]+$/
  return permissionRegex.test(permission)
}

/**
 * 检查菜单是否可以删除（是否包含子菜单）
 * @param menu 菜单对象
 * @returns 是否可以删除
 */
export function canDeleteMenu(menu: any): boolean {
  return !menu.children || menu.children.length === 0
}
