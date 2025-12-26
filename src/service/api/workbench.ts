/**
 * 工作台相关 API
 * 
 * 注意: 这些接口目前尚未实现,仅作为接口定义保留
 * 当后端接口准备好后,可以直接在 Store 中调用这些方法
 */

import httpClient from '../request/request'
import type { WorkbenchData } from '@/typings/workbench'

/**
 * 获取工作台数据
 */
export function getWorkbenchDataApi() {
  return httpClient.get<WorkbenchData>('/workbench/data')
}

/**
 * 获取统计数据
 */
export function getStatisticsApi() {
  return httpClient.get<WorkbenchData['statistics']>('/workbench/statistics')
}

/**
 * 获取趋势数据
 */
export function getTrendsApi() {
  return httpClient.get<WorkbenchData['trends']>('/workbench/trends')
}

/**
 * 获取活动记录
 * @param limit 限制返回数量
 */
export function getActivitiesApi(limit?: number) {
  return httpClient.get<WorkbenchData['activities']>('/workbench/activities', {
    params: { limit },
  })
}

/**
 * 获取通知列表
 * @param limit 限制返回数量
 */
export function getNotificationsApi(limit?: number) {
  return httpClient.get<WorkbenchData['notifications']>('/workbench/notifications', {
    params: { limit },
  })
}

/**
 * 标记通知为已读
 * @param notificationId 通知 ID
 */
export function markNotificationReadApi(notificationId: string) {
  return httpClient.put(`/workbench/notifications/${notificationId}/read`)
}

/**
 * 标记所有通知为已读
 */
export function markAllNotificationsReadApi() {
  return httpClient.put('/workbench/notifications/read-all')
}
