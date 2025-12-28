/**
 * 图标选择器类型定义
 */

/**
 * 图标类型
 */
export type IconType = '1' | '2' // 1: Iconify, 2: 本地图标

/**
 * 图标选择器 Props
 */
export interface IconSelectorProps {
  modelValue: string
  iconType?: IconType
}

/**
 * 图标选择器 Emits
 */
export interface IconSelectorEmits {
  'update:modelValue': (value: string) => void
  'update:iconType': (value: IconType) => void
}

/**
 * 本地图标选项
 */
export interface LocalIconOption {
  label: string
  value: string
}
