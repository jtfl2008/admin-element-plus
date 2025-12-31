/**
 * 公司管理验证和工具函数
 */

import type { Company, CompanyOperateParams } from '@/typings/api/system'

/**
 * 验证结果接口
 */
export interface ValidationResult {
  valid: boolean
  errors: string[]
}

/**
 * 验证公司表单数据
 * @param formData 表单数据
 * @returns 验证结果
 */
export function validateCompanyForm(formData: CompanyOperateParams): ValidationResult {
  const errors: string[] = []

  // 验证必填字段
  if (formData.parentId === undefined || formData.parentId === null) {
    errors.push('上级公司不能为空')
  }

  if (!formData.companyCode || formData.companyCode.trim() === '') {
    errors.push('公司编码不能为空')
  }

  if (!formData.companyName || formData.companyName.trim() === '') {
    errors.push('公司名称不能为空')
  }

  if (formData.orderNum === undefined || formData.orderNum === null) {
    errors.push('显示顺序不能为空')
  }

  // 验证公司编码长度（2-32字符）
  if (formData.companyCode && (formData.companyCode.length < 2 || formData.companyCode.length > 32)) {
    errors.push('公司编码长度必须在2-32个字符之间')
  }

  // 验证公司名称长度（2-90字符）
  if (formData.companyName && (formData.companyName.length < 2 || formData.companyName.length > 90)) {
    errors.push('公司名称长度必须在2-90个字符之间')
  }

  // 验证公司简称长度（最大30字符）
  if (formData.companyShortName && formData.companyShortName.length > 30) {
    errors.push('公司简称长度不能超过30个字符')
  }

  // 验证排序号为非负整数
  if (formData.orderNum !== undefined && formData.orderNum !== null) {
    if (!Number.isInteger(formData.orderNum) || formData.orderNum < 0) {
      errors.push('显示顺序必须为非负整数')
    }
  }

  // 验证电话号码格式（可选）
  if (formData.phone && formData.phone.trim() !== '') {
    const phoneRegex = /^1[3-9]\d{9}$|^0\d{2,3}-?\d{7,8}$/
    if (!phoneRegex.test(formData.phone)) {
      errors.push('联系电话格式不正确')
    }
  }

  // 验证邮箱格式（可选）
  if (formData.email && formData.email.trim() !== '') {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    if (!emailRegex.test(formData.email)) {
      errors.push('邮箱格式不正确')
    }
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 生成公司层级路径
 * @param parentPath 父公司路径
 * @param companyCode 公司编码
 * @returns 完整的公司路径
 */
export function generateCompanyPath(parentPath: string | undefined, companyCode: string): string {
  // 将公司编码补齐到6位（左侧补0）
  const paddedCode = companyCode.padStart(6, '0')
  
  // 如果没有父路径，说明是根公司
  if (!parentPath || parentPath.trim() === '') {
    return paddedCode
  }
  
  // 拼接父路径和当前编码
  return `${parentPath}.${paddedCode}`
}

/**
 * 更新公司及其所有子公司的路径
 * @param company 要更新的公司
 * @param newPath 新的路径
 * @param companyList 所有公司列表（扁平）
 * @returns 更新后的公司列表
 */
export function updateCompanyPaths(
  company: Company,
  newPath: string,
  companyList: Company[]
): Company[] {
  const updatedList = [...companyList]
  
  // 更新当前公司的路径
  const currentCompany = updatedList.find(c => c.companyId === company.companyId)
  if (currentCompany) {
    const oldPath = currentCompany.companyPath
    currentCompany.companyPath = newPath
    
    // 递归更新所有子公司的路径
    if (oldPath) {
      updatedList.forEach(c => {
        // 如果是子公司（路径以当前公司的旧路径开头）
        if (c.companyPath && c.companyPath.startsWith(oldPath + '.')) {
          // 替换路径前缀
          c.companyPath = c.companyPath.replace(oldPath, newPath)
        }
      })
    }
  }
  
  return updatedList
}

/**
 * 检查是否存在循环引用
 * @param companyId 当前公司ID
 * @param newParentId 新的父公司ID
 * @param companyTree 公司树
 * @returns 是否存在循环引用
 */
export function checkCircularReference(
  companyId: number,
  newParentId: number,
  companyTree: Company[]
): boolean {
  // 如果新父公司ID为0，说明是设置为根公司，不存在循环引用
  if (newParentId === 0) {
    return false
  }
  
  // 如果新父公司ID等于当前公司ID，存在循环引用
  if (newParentId === companyId) {
    return true
  }
  
  /**
   * 递归检查指定公司是否是当前公司的子孙公司
   * @param nodes 节点数组
   * @param targetId 目标公司ID
   * @returns 是否找到目标公司
   */
  const isDescendant = (nodes: Company[], targetId: number): boolean => {
    for (const node of nodes) {
      if (node.companyId === targetId) {
        return true
      }
      
      if (node.children && node.children.length > 0) {
        if (isDescendant(node.children, targetId)) {
          return true
        }
      }
    }
    return false
  }
  
  /**
   * 查找指定ID的公司节点
   * @param nodes 节点数组
   * @param targetId 目标公司ID
   * @returns 找到的公司节点
   */
  const findCompany = (nodes: Company[], targetId: number): Company | null => {
    for (const node of nodes) {
      if (node.companyId === targetId) {
        return node
      }
      
      if (node.children && node.children.length > 0) {
        const found = findCompany(node.children, targetId)
        if (found) {
          return found
        }
      }
    }
    return null
  }
  
  // 查找当前公司节点
  const currentCompany = findCompany(companyTree, companyId)
  if (!currentCompany) {
    return false
  }
  
  // 检查新父公司是否是当前公司的子孙公司
  if (currentCompany.children && currentCompany.children.length > 0) {
    return isDescendant(currentCompany.children, newParentId)
  }
  
  return false
}
