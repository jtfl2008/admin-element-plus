/**
 * HTTP 客户端封装
 * 基于 Axios 实现统一的请求和响应处理
 */

import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
} from 'axios'
import { ElMessage } from 'element-plus'
import { getToken, removeToken } from '@/utils/auth'
import { REQUEST_TIMEOUT } from '@/constants'
import { HTTP_STATUS, BUSINESS_CODE } from '@/constants/status'
import ENV_CONFIG from '@/config/env'
import type { ApiResponse } from '@/typings/api'

/**
 * 扩展的请求配置
 */
interface RequestConfig extends AxiosRequestConfig {
  skipErrorHandler?: boolean // 跳过统一错误处理
  skipAuth?: boolean // 跳过认证
}

// 扩展 Axios 请求配置类型
declare module 'axios' {
  interface AxiosRequestConfig {
    skipErrorHandler?: boolean
    skipAuth?: boolean
  }
}

/**
 * HTTP 客户端类
 */
class HttpClient {
  private instance: AxiosInstance

  constructor(config?: AxiosRequestConfig) {
    // 创建 Axios 实例
    this.instance = axios.create({
      baseURL: ENV_CONFIG.API_BASE_URL + ENV_CONFIG.API_PREFIX,
      timeout: REQUEST_TIMEOUT,
      headers: {
        'Content-Type': 'application/json;charset=utf-8',
      },
      ...config,
    })

    // 注册拦截器
    this.setupInterceptors()
  }

  /**
   * 设置拦截器
   */
  private setupInterceptors(): void {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config) => {
        // 添加 Authorization 请求头
        const token = getToken()
        if (token && !config.skipAuth) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 添加时间戳防止缓存
        if (config.method === 'get') {
          config.params = {
            ...config.params,
            _t: Date.now(),
          }
        }

        return config
      },
      (error) => {
        console.error('Request error:', error)
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { data } = response

        // 提取响应数据
        if (data.code === BUSINESS_CODE.SUCCESS) {
          return data.data
        }

        // 处理业务错误
        ElMessage.error(data.msg || '请求失败')
        return Promise.reject(new Error(data.msg || '请求失败'))
      },
      (error: AxiosError<ApiResponse>) => {
        return this.handleError(error)
      }
    )
  }

  /**
   * 统一错误处理
   */
  private handleError(error: AxiosError<ApiResponse>): Promise<never> {
    // 如果配置了跳过错误处理，直接返回
    if (error.config?.skipErrorHandler) {
      return Promise.reject(error)
    }

    let message = '请求失败'

    if (error.response) {
      // HTTP 错误
      const { status, data } = error.response

      switch (status) {
        case HTTP_STATUS.UNAUTHORIZED:
          message = '登录已过期，请重新登录'
          removeToken()
          // 跳转到登录页
          window.location.href = '/login'
          break

        case HTTP_STATUS.FORBIDDEN:
          message = '权限不足，无法访问该资源'
          break

        case HTTP_STATUS.NOT_FOUND:
          message = '请求的资源不存在'
          break

        case HTTP_STATUS.INTERNAL_SERVER_ERROR:
          message = '服务器内部错误，请稍后重试'
          break

        case HTTP_STATUS.BAD_GATEWAY:
        case HTTP_STATUS.SERVICE_UNAVAILABLE:
        case HTTP_STATUS.GATEWAY_TIMEOUT:
          message = '服务暂时不可用，请稍后重试'
          break

        default:
          message = data?.msg || `请求失败 (${status})`
      }
    } else if (error.code === 'ECONNABORTED') {
      // 超时错误
      message = '请求超时，请稍后重试'
    } else if (error.message === 'Network Error') {
      // 网络错误
      message = '网络连接失败，请检查网络设置'
    } else if (axios.isCancel(error)) {
      // 请求取消，静默处理
      return Promise.reject(error)
    }

    ElMessage.error(message)
    return Promise.reject(error)
  }

  /**
   * 通用请求方法
   */
  request<T = any>(config: RequestConfig): Promise<T> {
    return this.instance.request(config)
  }

  /**
   * GET 请求
   */
  get<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.get(url, config)
  }

  /**
   * POST 请求
   */
  post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.post(url, data, config)
  }

  /**
   * PUT 请求
   */
  put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<T> {
    return this.instance.put(url, data, config)
  }

  /**
   * DELETE 请求
   */
  delete<T = any>(url: string, config?: RequestConfig): Promise<T> {
    return this.instance.delete(url, config)
  }
}

// 创建默认实例
const httpClient = new HttpClient()

// 导出实例和类
export default httpClient
export { HttpClient }
export type { RequestConfig }
