/**
 * 环境变量配置
 * 统一管理项目中使用的环境变量
 */

export const ENV_CONFIG = {
  // 应用标题
  APP_TITLE: import.meta.env.VITE_APP_TITLE,

  // API 基础地址
  BASE_API: import.meta.env.VITE_APP_BASE_API,

  // 应用基础地址
  BASE_URL: import.meta.env.VITE_APP_BASE_URL,

  // 上传地址
  UPLOAD_URL: import.meta.env.VITE_APP_UPLOAD_URL,

  // 当前环境
  MODE: import.meta.env.MODE,

  // 是否开发环境
  isDev: import.meta.env.DEV,

  // 是否生产环境
  isProd: import.meta.env.PROD,
} as const

export default ENV_CONFIG
