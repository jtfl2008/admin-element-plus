/**
 * 本地存储工具类
 */

interface StorageOptions {
  encrypt?: boolean
  expire?: number // 过期时间（秒）
}

interface StorageData<T> {
  value: T
  expire?: number
}

class StorageUtil {
  private storage: Storage

  constructor(storageType: 'localStorage' | 'sessionStorage' = 'localStorage') {
    this.storage = storageType === 'localStorage' ? window.localStorage : window.sessionStorage
  }

  /**
   * 存储数据
   */
  setItem<T>(key: string, value: T, options?: StorageOptions): void {
    try {
      const data: StorageData<T> = {
        value,
      }

      // 设置过期时间
      if (options?.expire) {
        data.expire = Date.now() + options.expire * 1000
      }

      const jsonStr = JSON.stringify(data)
      this.storage.setItem(key, jsonStr)
    } catch (error) {
      console.error('Storage setItem error:', error)
    }
  }

  /**
   * 获取数据
   */
  getItem<T>(key: string): T | null {
    try {
      const jsonStr = this.storage.getItem(key)
      if (!jsonStr) {
        return null
      }

      const data: StorageData<T> = JSON.parse(jsonStr)

      // 检查是否过期
      if (data.expire && Date.now() > data.expire) {
        this.removeItem(key)
        return null
      }

      return data.value
    } catch (error) {
      console.error('Storage getItem error:', error)
      return null
    }
  }

  /**
   * 删除数据
   */
  removeItem(key: string): void {
    try {
      this.storage.removeItem(key)
    } catch (error) {
      console.error('Storage removeItem error:', error)
    }
  }

  /**
   * 清空存储
   */
  clear(): void {
    try {
      this.storage.clear()
    } catch (error) {
      console.error('Storage clear error:', error)
    }
  }
}

// 导出实例
export const localStorage = new StorageUtil('localStorage')
export const sessionStorage = new StorageUtil('sessionStorage')
