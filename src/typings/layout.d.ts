/**
 * 布局系统类型定义
 */

/**
 * 布局模式
 */
export type LayoutMode = 'vertical' | 'horizontal' | 'mix'

/**
 * 设备类型（仅支持 desktop）
 */
export type DeviceType = 'desktop'

/**
 * 布局配置
 */
export interface LayoutConfig {
  /** 布局模式 */
  layoutMode: LayoutMode
  /** 侧边栏折叠状态 */
  sidebarCollapsed: boolean
  /** 侧边栏宽度（展开时） */
  sidebarWidth: number
  /** 侧边栏宽度（折叠时） */
  collapsedWidth: number
  /** 是否显示标签页 */
  showTab: boolean
  /** 是否显示面包屑 */
  showBreadcrumb: boolean
  /** 是否显示页脚 */
  showFooter: boolean
  /** 是否固定头部 */
  fixedHeader: boolean
  /** 是否固定侧边栏 */
  fixedSidebar: boolean
  /** 是否启用动画 */
  enableAnimation: boolean
  /** 最小窗口宽度 */
  minWidth: number
  /** 主题色 */
  themeColor?: string
  /** 标签页主题 */
  tabTheme?: 'card' | 'button' | 'underline'
}

/**
 * 菜单项
 */
export interface MenuItem {
  /** 菜单唯一标识 */
  key: string
  /** 菜单标题 */
  label: string
  /** 菜单图标 */
  icon?: string
  /** 路由路径 */
  path?: string
  /** 子菜单 */
  children?: MenuItem[]
  /** 是否隐藏 */
  hidden?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 徽章内容 */
  badge?: string | number
}

/**
 * 标签页项
 */
export interface TabItem {
  /** 标签页唯一标识 */
  key: string
  /** 标签页标题 */
  label: string
  /** 路由路径 */
  path: string
  /** 是否可关闭 */
  closable: boolean
  /** 是否固定（固定的标签页不可关闭） */
  affix?: boolean
  /** 路由查询参数 */
  query?: Record<string, any>
}

/**
 * 面包屑项
 */
export interface BreadcrumbItem {
  /** 面包屑标题 */
  label: string
  /** 路由路径（可选，最后一项通常没有路径） */
  path?: string
}
