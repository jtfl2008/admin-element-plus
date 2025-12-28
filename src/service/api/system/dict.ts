/**
 * 字典类型管理 API
 */

import httpClient from '@/service/request/request'
import type { PageResponse } from '@/typings/api'
import type {
  DictTypeSearchParams,
  DictType,
  DictTypeOperateParams
} from '@/typings/api/system'

/**
 * 获取字典类型选择框列表
 */
export function fetchGetDictTypeOptionSelect() {
  return httpClient.get<DictType[]>('/system/dict/type/optionselect')
}

/**
 * 获取字典类型列表（分页）
 */
export function fetchGetDictTypeList(params?: DictTypeSearchParams) {
  return httpClient.get<PageResponse<DictType>>('/system/dict/type/list', { params })
}

/**
 * 新增字典类型
 */
export function fetchCreateDictType(data: DictTypeOperateParams) {
  return httpClient.post('/system/dict/type', data)
}

/**
 * 更新字典类型
 */
export function fetchUpdateDictType(data: DictTypeOperateParams) {
  return httpClient.put('/system/dict/type', data)
}

/**
 * 批量删除字典类型
 */
export function fetchBatchDeleteDictType(dictIds: number[]) {
  return httpClient.delete(`/system/dict/type/${dictIds.join(',')}`)
}

/**
 * 刷新字典缓存
 */
export function fetchRefreshDictCache() {
  return httpClient.delete('/system/dict/type/refreshCache')
}

/**
 * 导出字典类型
 */
export function fetchExportDictType(params?: DictTypeSearchParams) {
  return httpClient.get('/system/dict/type/export', { 
    params,
    responseType: 'blob'
  })
}
