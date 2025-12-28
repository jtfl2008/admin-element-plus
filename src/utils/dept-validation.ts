/**
 * 部门管理验证工具函数
 */

import type { DeptOperateParams, Dept } from '@/typings/api/system'

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 验证部门表单数据
 * @param form 表单数据
 * @returns 验证结果
 */
export function validateDeptForm(form: DeptOperateParams): ValidationResult {
  const errors: string[] = []

  // 验证必填字段 - 上级部门
  if (form.parentId === undefined || form.parentId === null) {
    errors.push('请选择上级部门')
  }

  // 验证必填字段 - 部门名称
  if (!form.deptName || form.deptName.trim() === '') {
    errors.push('请输入部门名称')
  } else if (form.deptName.length < 2 || form.deptName.length > 50) {
    errors.push('部门名称长度在 2 到 50 个字符')
  }

  // 验证必填字段 - 显示顺序
  if (form.orderNum === undefined || form.orderNum === null) {
    errors.push('请输入显示顺序')
  } else if (typeof form.orderNum !== 'number' || form.orderNum < 0 || !Number.isInteger(form.orderNum)) {
    errors.push('显示顺序必须为非负整数')
  }

  // 验证联系电话格式（可选字段）
  if (form.phone && form.phone.trim() !== '') {
    if (!/^1[3-9]\d{9}$/.test(form.phone)) {
      errors.push('请输入正确的手机号码')
    }
  }

  // 验证邮箱格式（可选字段）
  if (form.email && form.email.trim() !== '') {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.push('请输入正确的邮箱地址')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 检测是否存在循环引用
 * @param deptId 当前部门ID
 * @param parentId 要设置的父部门ID
 * @param deptTree 部门树
 * @returns 是否存在循环引用
 */
export function checkCircularReference(
  deptId: number,
  parentId: number,
  deptTree: Dept[]
): boolean {
  // 如果父部门ID为0，不存在循环引用
  if (parentId === 0) return false

  // 查找指定ID的部门
  const findDept = (depts: Dept[], id: number): Dept | null => {
    for (const dept of depts) {
      if (dept.deptId === id) return dept
      if (dept.children) {
        const found = findDept(dept.children, id)
        if (found) return found
      }
    }
    return null
  }

  // 检查某个部门是否是指定部门的子孙部门
  const isDescendant = (dept: Dept, ancestorId: number): boolean => {
    if (dept.deptId === ancestorId) return true
    if (dept.children) {
      return dept.children.some(child => isDescendant(child, ancestorId))
    }
    return false
  }

  const currentDept = findDept(deptTree, deptId)
  if (!currentDept) return false

  // 检查父部门是否是当前部门的子孙部门
  return isDescendant(currentDept, parentId)
}
