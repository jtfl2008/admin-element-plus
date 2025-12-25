/**
 * 路由相关类型定义
 */

import type { Component } from 'vue'

/**
 * 路由元信息类型
 */
export interface RouteMeta {
  title?: string
  icon?: string
  requiresAuth?: boolean
  permissions?: string[]
  keepAlive?: boolean
  hidden?: boolean
  affix?: boolean
  order?: number
  disabled?: boolean
  badge?: string | number
}

/**
 * 路由配置类型
 */
export interface RouteConfig {
  path: string
  name?: string
  component?: Component | string
  redirect?: string
  meta?: RouteMeta
  children?: RouteConfig[]
}
