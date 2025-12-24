/**
 * 全局类型定义
 */

/**
 * 环境变量类型
 */
interface ImportMetaEnv {
  readonly VITE_APP_TITLE: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_PREFIX: string
  readonly VITE_UPLOAD_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/**
 * 通用对象类型
 */
export type Recordable<T = any> = Record<string, T>

/**
 * 可为空类型
 */
export type Nullable<T> = T | null

/**
 * 设备类型
 */
export type DeviceType = 'mobile' | 'desktop'

/**
 * 主题类型
 */
export type ThemeType = 'light' | 'dark'
