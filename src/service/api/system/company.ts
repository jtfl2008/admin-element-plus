/**
 * 公司管理 API
 */

import httpClient from '@/service/request/request'
import type {
  Company,
  CompanySearchParams,
  CompanyOperateParams,
  CompanyTree
} from '@/typings/api/system'

/**
 * 获取公司列表
 */
export function fetchGetCompanyList(params?: CompanySearchParams) {
  return httpClient.get<Company[]>('/system/company/list', { params })
}

/**
 * 获取排除公司列表（用于编辑时选择上级公司）
 */
export function fetchGetExcludeCompanyList(companyId: number) {
  return httpClient.get<Company[]>(`/system/company/list/exclude/${companyId}`)
}

/**
 * 新增公司
 */
export function fetchCreateCompany(data: CompanyOperateParams) {
  return httpClient.post('/system/company', data)
}

/**
 * 更新公司
 */
export function fetchUpdateCompany(data: CompanyOperateParams) {
  return httpClient.put('/system/company', data)
}

/**
 * 删除公司
 */
export function fetchDeleteCompany(companyId: number) {
  return httpClient.delete(`/system/company/${companyId}`)
}

/**
 * 批量删除公司
 */
export function fetchBatchDeleteCompany(companyIds: number[]) {
  return httpClient.delete(`/system/company/${companyIds.join(',')}`)
}

/**
 * 获取公司选择框列表（用于其他模块）
 */
export function fetchGetCompanySelect() {
  return httpClient.get<CompanyTree[]>('/system/company/optionselect')
}

/**
 * 导出公司
 */
export function fetchExportCompany(params?: CompanySearchParams) {
  return httpClient.post('/system/company/export', params, {
    responseType: 'blob'
  })
}
