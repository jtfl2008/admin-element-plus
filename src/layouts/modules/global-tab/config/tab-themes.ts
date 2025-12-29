/**
 * 标签页主题配置
 * 
 * 本文件定义了标签页组件的主题系统，支持多种视觉风格和浅色/深色模式。
 * 提供三种内置主题：card（卡片）、button（按钮）、underline（下划线）
 */

/**
 * 主题颜色配置接口
 * 
 * 定义单个主题在特定模式（浅色/深色）下的所有样式属性
 */
export interface TabThemeColors {
  /** 标签页背景色 */
  tabBg: string
  /** 标签页文字色 */
  tabText: string
  /** 标签页边框色 */
  tabBorder: string
  /** 活动状态背景色 */
  activeBg: string
  /** 活动状态文字色 */
  activeText: string
  /** 活动状态边框色 */
  activeBorder: string
  /** 悬停状态背景色 */
  hoverBg: string
  /** 悬停状态文字色 */
  hoverText: string
  /** 悬停状态边框色 */
  hoverBorder: string
  /** 圆角半径 */
  borderRadius: string
  /** 内边距 */
  padding: string
  /** 标签页间距 */
  gap: string
  /** 阴影效果（可选） */
  shadow?: string
  /** 下划线颜色（仅 underline 主题使用） */
  underlineColor?: string
  /** 下划线高度（仅 underline 主题使用） */
  underlineHeight?: string
}

/**
 * 主题配置接口
 * 
 * 定义完整的主题配置，包含浅色和深色两种模式
 */
export interface TabThemeConfig {
  /** 主题名称（用于内部标识） */
  name: string
  /** 主题显示名称（用于 UI 展示） */
  displayName: string
  /** 浅色模式配置 */
  light: TabThemeColors
  /** 深色模式配置 */
  dark: TabThemeColors
}

/**
 * 主题类型
 * 
 * 支持的主题类型：
 * - card: 卡片风格，带背景色和边框，视觉分隔明显
 * - button: 按钮风格，紧凑现代，适合空间有限的场景
 * - underline: 下划线风格，简洁优雅，适合极简设计
 */
export type TabThemeType = 'card' | 'button' | 'underline'

/**
 * 卡片主题配置
 * 
 * 特点：
 * - 明显的背景色和边框
 * - 较大的圆角（8px）
 * - 活动状态带阴影效果
 * - 适合需要清晰视觉分隔的场景
 */
export const cardTheme: TabThemeConfig = {
  name: 'card',
  displayName: '卡片',
  light: {
    tabBg: 'transparent',
    tabText: '#333333',
    tabBorder: 'transparent',
    activeBg: '#e6f7ff',
    activeText: '#1890ff',
    activeBorder: '#1890ff',
    hoverBg: '#f5f5f5',
    hoverText: '#333333',
    hoverBorder: '#e5e5e5',
    borderRadius: '8px',
    padding: '0 16px',
    gap: '8px',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },
  dark: {
    tabBg: 'transparent',
    tabText: '#e8e8e8',
    tabBorder: 'transparent',
    activeBg: '#1890ff',
    activeText: '#ffffff',
    activeBorder: '#1890ff',
    hoverBg: '#2c2c2c',
    hoverText: '#e8e8e8',
    hoverBorder: '#3c3c3c',
    borderRadius: '8px',
    padding: '0 16px',
    gap: '8px',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
  }
}

/**
 * 按钮主题配置
 * 
 * 特点：
 * - 类似按钮的外观
 * - 较小的圆角（4px）
 * - 紧凑的内边距
 * - 活动状态使用主题色背景
 * - 适合现代化、紧凑的界面设计
 */
export const buttonTheme: TabThemeConfig = {
  name: 'button',
  displayName: '按钮',
  light: {
    tabBg: '#f0f0f0',
    tabText: '#666666',
    tabBorder: 'transparent',
    activeBg: '#1890ff',
    activeText: '#ffffff',
    activeBorder: 'transparent',
    hoverBg: '#e0e0e0',
    hoverText: '#333333',
    hoverBorder: 'transparent',
    borderRadius: '4px',
    padding: '8px 12px',
    gap: '6px',
    shadow: 'none'
  },
  dark: {
    tabBg: '#2c2c2c',
    tabText: '#a8a8a8',
    tabBorder: 'transparent',
    activeBg: '#1890ff',
    activeText: '#ffffff',
    activeBorder: 'transparent',
    hoverBg: '#3c3c3c',
    hoverText: '#e8e8e8',
    hoverBorder: 'transparent',
    borderRadius: '4px',
    padding: '8px 12px',
    gap: '6px',
    shadow: 'none'
  }
}

/**
 * 下划线主题配置
 * 
 * 特点：
 * - 透明背景，无边框
 * - 活动状态显示底部下划线
 * - 极简设计，视觉干扰最小
 * - 适合优雅、简洁的界面风格
 */
export const underlineTheme: TabThemeConfig = {
  name: 'underline',
  displayName: '下划线',
  light: {
    tabBg: 'transparent',
    tabText: '#666666',
    tabBorder: 'transparent',
    activeBg: 'transparent',
    activeText: '#1890ff',
    activeBorder: 'transparent',
    hoverBg: 'transparent',
    hoverText: '#333333',
    hoverBorder: 'transparent',
    borderRadius: '0',
    padding: '0 12px',
    gap: '4px',
    shadow: 'none',
    underlineColor: '#1890ff',
    underlineHeight: '3px'
  },
  dark: {
    tabBg: 'transparent',
    tabText: '#a8a8a8',
    tabBorder: 'transparent',
    activeBg: 'transparent',
    activeText: '#1890ff',
    activeBorder: 'transparent',
    hoverBg: 'transparent',
    hoverText: '#e8e8e8',
    hoverBorder: 'transparent',
    borderRadius: '0',
    padding: '0 12px',
    gap: '4px',
    shadow: 'none',
    underlineColor: '#1890ff',
    underlineHeight: '3px'
  }
}

/**
 * 主题映射表
 * 
 * 将主题类型映射到对应的主题配置对象
 */
export const themeMap: Record<TabThemeType, TabThemeConfig> = {
  card: cardTheme,
  button: buttonTheme,
  underline: underlineTheme
}

/**
 * 获取主题配置
 * 
 * @param themeName - 主题名称
 * @param customConfig - 自定义配置（可选），用于覆盖默认配置
 * @returns 完整的主题配置对象
 * 
 * @example
 * ```typescript
 * // 获取默认卡片主题
 * const theme = getThemeConfig('card')
 * 
 * // 自定义卡片主题的颜色
 * const customTheme = getThemeConfig('card', {
 *   light: {
 *     activeBg: '#ff0000',
 *     activeText: '#ffffff'
 *   }
 * })
 * ```
 */
export function getThemeConfig(
  themeName: TabThemeType,
  customConfig?: Partial<TabThemeConfig>
): TabThemeConfig {
  const baseTheme = themeMap[themeName]
  
  // 如果主题不存在，回退到默认 card 主题
  if (!baseTheme) {
    console.warn(`主题 "${themeName}" 不存在，使用默认 card 主题`)
    return themeMap.card
  }
  
  // 如果没有自定义配置，直接返回基础主题
  if (!customConfig) {
    return baseTheme
  }
  
  // 深度合并自定义配置
  return {
    ...baseTheme,
    name: customConfig.name || baseTheme.name,
    displayName: customConfig.displayName || baseTheme.displayName,
    light: { ...baseTheme.light, ...customConfig.light },
    dark: { ...baseTheme.dark, ...customConfig.dark }
  }
}
