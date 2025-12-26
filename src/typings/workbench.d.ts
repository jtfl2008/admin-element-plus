/**
 * 工作台相关类型定义
 */

/**
 * 数据卡片属性
 */
export interface DataCardProps {
  title: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
  compareText?: string
  icon?: any // Vue 组件
  color?: string
  loading?: boolean
  clickable?: boolean
}

/**
 * 快捷操作项
 */
export interface QuickAction {
  id: string
  title: string
  description: string
  icon: any // Vue 组件或图标组件
  color: string
  route?: string
  action?: () => void
  permission?: string
}

/**
 * 图表数据
 */
export interface ChartData {
  labels: string[]
  datasets: {
    name: string
    data: number[]
    color?: string
  }[]
}

/**
 * 时间范围
 */
export interface TimeRange {
  type: 'today' | 'week' | 'month' | 'custom'
  start?: Date
  end?: Date
}

/**
 * 活动记录
 */
export interface Activity {
  id: string
  type: 'create' | 'update' | 'delete' | 'login' | 'other'
  content: string
  user: string
  timestamp: Date
  icon?: string
  color?: string
}

/**
 * 通知
 */
export interface Notification {
  id: string
  title: string
  content: string
  type: 'important' | 'normal' | 'info'
  read: boolean
  timestamp: Date
  link?: string
}

/**
 * 布局项
 */
export interface LayoutItem {
  id: string
  component: string
  x: number
  y: number
  w: number
  h: number
  visible: boolean
  minW?: number
  minH?: number
}

/**
 * 布局配置
 */
export interface LayoutConfig {
  items: LayoutItem[]
  cols: { lg: number; md: number; sm: number; xs: number }
  rowHeight: number
}

/**
 * 趋势数据
 */
export interface TrendData {
  current: number
  previous: number
  change: number
  changePercent: number
}

/**
 * 工作台数据
 */
export interface WorkbenchData {
  statistics: {
    totalUsers: number
    activeUsers: number
    totalOrders: number
    revenue: number
  }
  trends: {
    userTrend: TrendData
    orderTrend: TrendData
    revenueTrend: TrendData
  }
  activities: Activity[]
  notifications: Notification[]
}
