/**
 * 字典数据管理 API
 */

import type {
  DictData,
  DictDataSearchParams,
  DictDataOperateParams
} from '@/typings/api/system'
import type { PageResponse } from '@/typings/api'
import httpClient from '@/service/request/request'

/**
 * 根据字典类型查询字典数据信息
 */
export function fetchGetDictDataByType(dictType: string) {
  return httpClient.get<DictData[]>(`/system/dict/data/type/${dictType}`)
}

/**
 * 获取字典数据列表（分页）
 */
export function fetchGetDictDataList(params?: DictDataSearchParams) {
  return httpClient.get<PageResponse<DictData>>('/system/dict/data/list', { params })
}

/**
 * 新增字典数据
 */
export function fetchCreateDictData(data: DictDataOperateParams) {
  return httpClient.post('/system/dict/data', data)
}

/**
 * 更新字典数据
 */
export function fetchUpdateDictData(data: DictDataOperateParams) {
  return httpClient.put('/system/dict/data', data)
}

/**
 * 批量删除字典数据
 */
export function fetchBatchDeleteDictData(dictCodes: number[]) {
  return httpClient.delete(`/system/dict/data/${dictCodes.join(',')}`)
}

/**
 * 导出字典数据
 */
export function fetchExportDictData(params?: DictDataSearchParams) {
  return httpClient.get('/system/dict/data/export', { 
    params,
    responseType: 'blob'
  })
}
