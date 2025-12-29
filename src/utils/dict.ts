/**
 * 字典管理工具函数
 */

import type { DictType, DictData, DictTreeNode } from '@/typings/api/system'
import { fetchGetDictTypeList } from '@/service/api/system/dict'
import { fetchGetDictDataByType } from '@/service/api/system/dict-data'

/**
 * 构建字典树形结构
 * @param dictTypes 字典类型列表
 * @param dictDataMap 字典数据映射表
 * @returns 树形节点数组
 */
export function buildDictTree(
  dictTypes: DictType[],
  dictDataMap: Map<string, DictData[]>
): DictTreeNode[] {
  return dictTypes.map(dictType => {
    const dictDataList = dictDataMap.get(dictType.dictType) || []

    // 按排序值排序字典数据
    const sortedDictData = dictDataList.sort((a, b) => {
      if (a.dictSort !== b.dictSort) {
        return a.dictSort - b.dictSort
      }
      // 相同排序值时按创建时间排序
      const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
      const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
      return timeA - timeB
    })

    const node: DictTreeNode = {
      id: `type-${dictType.dictId}`,
      type: 'dict-type' as const,
      data: dictType,
      children: sortedDictData.map(dictData => ({
        id: `data-${dictData.dictCode}`,
        type: 'dict-data' as const,
        data: dictData
      })),
      hasChildren: sortedDictData.length > 0
    }
    
    return node
  })
}

/**
 * 加载完整的字典树数据
 * @returns 树形节点数组
 */
export async function loadDictTree(): Promise<DictTreeNode[]> {
  try {
    // 1. 获取所有字典类型
    const dictTypesResponse = await fetchGetDictTypeList()
    const dictTypes = dictTypesResponse.rows || []

    // 2. 并行获取所有字典数据
    const dictDataPromises = dictTypes.map(dictType =>
      fetchGetDictDataByType(dictType.dictType)
        .then((data: DictData[]) => ({ dictType: dictType.dictType, data }))
        .catch(() => ({ dictType: dictType.dictType, data: [] as DictData[] }))
    )

    const dictDataResults = await Promise.all(dictDataPromises)

    // 3. 构建字典数据映射表
    const dictDataMap = new Map<string, DictData[]>()
    dictDataResults.forEach((result: { dictType: string; data: DictData[] }) => {
      dictDataMap.set(result.dictType, result.data)
    })

    // 4. 构建树形结构
    return buildDictTree(dictTypes, dictDataMap)
  } catch (error) {
    console.error('加载字典树失败:', error)
    throw error
  }
}

/**
 * 验证字典类型表单
 * @param formData 表单数据
 * @returns 验证结果
 */
export function validateDictTypeForm(formData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 验证字典名称
  if (!formData.dictName || formData.dictName.trim() === '') {
    errors.push('请输入字典名称')
  } else if (formData.dictName.length < 2 || formData.dictName.length > 50) {
    errors.push('字典名称长度在 2 到 50 个字符')
  }

  // 验证字典类型
  if (!formData.dictType || formData.dictType.trim() === '') {
    errors.push('请输入字典类型')
  } else if (formData.dictType.length < 2 || formData.dictType.length > 50) {
    errors.push('字典类型长度在 2 到 50 个字符')
  } else if (!/^[a-z_]+$/.test(formData.dictType)) {
    errors.push('字典类型只能包含小写字母和下划线')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 验证字典数据表单
 * @param formData 表单数据
 * @returns 验证结果
 */
export function validateDictDataForm(formData: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  // 验证字典标签
  if (!formData.dictLabel || formData.dictLabel.trim() === '') {
    errors.push('请输入字典标签')
  } else if (formData.dictLabel.length < 1 || formData.dictLabel.length > 50) {
    errors.push('字典标签长度在 1 到 50 个字符')
  }

  // 验证字典键值
  if (!formData.dictValue || formData.dictValue.trim() === '') {
    errors.push('请输入字典键值')
  } else if (formData.dictValue.length > 100) {
    errors.push('字典键值长度不能超过 100 个字符')
  }

  // 验证字典排序
  if (formData.dictSort === undefined || formData.dictSort === null) {
    errors.push('请输入字典排序')
  } else if (typeof formData.dictSort !== 'number' || formData.dictSort < 0) {
    errors.push('字典排序必须为非负整数')
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

/**
 * 搜索字典类型
 * @param dictTypes 字典类型列表
 * @param keyword 搜索关键词
 * @returns 匹配的字典类型列表
 */
export function searchDictTypes(dictTypes: DictType[], keyword: string): DictType[] {
  if (!keyword || keyword.trim() === '') {
    return dictTypes
  }

  const lowerKeyword = keyword.toLowerCase()
  return dictTypes.filter(
    dict =>
      dict.dictName.toLowerCase().includes(lowerKeyword) ||
      dict.dictType.toLowerCase().includes(lowerKeyword)
  )
}

/**
 * 排序字典数据
 * @param dictDataList 字典数据列表
 * @returns 排序后的字典数据列表
 */
export function sortDictData(dictDataList: DictData[]): DictData[] {
  return [...dictDataList].sort((a, b) => {
    if (a.dictSort !== b.dictSort) {
      return a.dictSort - b.dictSort
    }
    // 相同排序值时按创建时间排序
    const timeA = a.createTime ? new Date(a.createTime).getTime() : 0
    const timeB = b.createTime ? new Date(b.createTime).getTime() : 0
    return timeA - timeB
  })
}

/**
 * 过滤字典选择器数据（只返回启用状态）
 * @param dictDataList 字典数据列表
 * @returns 启用状态的字典数据列表
 */
export function filterDictDataForSelector(dictDataList: DictData[]): DictData[] {
  return dictDataList.filter(dict => dict.status === '0')
}
