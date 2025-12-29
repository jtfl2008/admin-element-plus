/**
 * 岗位管理 API
 */

import httpClient from '@/service/request/request'
import type { PageResponse } from '@/typings/api'
import type {
  Post,
  PostSearchParams,
  PostOperateParams
} from '@/typings/api/system'

/**
 * 获取岗位列表
 */
export function fetchGetPostList(params: PostSearchParams) {
  return httpClient.get<PageResponse<Post>>('/system/post/list', { params })
}

/**
 * 获取岗位详情
 */
export function fetchGetPostDetail(postId: number) {
  return httpClient.get<Post>(`/system/post/${postId}`)
}

/**
 * 新增岗位
 */
export function fetchCreatePost(data: PostOperateParams) {
  return httpClient.post('/system/post', data)
}

/**
 * 更新岗位
 */
export function fetchUpdatePost(data: PostOperateParams) {
  return httpClient.put('/system/post', data)
}

/**
 * 删除岗位
 */
export function fetchDeletePost(postId: number) {
  return httpClient.delete(`/system/post/${postId}`)
}

/**
 * 批量删除岗位
 */
export function fetchBatchDeletePost(postIds: number[]) {
  return httpClient.delete(`/system/post/${postIds.join(',')}`)
}

/**
 * 导出岗位
 */
export function fetchExportPost(params: PostSearchParams) {
  return httpClient.post('/system/post/export', params, {
    responseType: 'blob'
  })
}
