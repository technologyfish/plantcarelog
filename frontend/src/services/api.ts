import Taro from '@tarojs/taro'

const BASE_URL = 'http://localhost:8000/api'

interface RequestOptions {
  params?: Record<string, any>
  data?: Record<string, any>
  header?: Record<string, string>
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

class ApiService {
  baseUrl = BASE_URL

  private async request<T>(method: 'GET' | 'POST' | 'PUT' | 'DELETE', url: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { params, data, header = {} } = options

    // 构建完整 URL
    let fullUrl = `${BASE_URL}${url}`
    if (params) {
      const queryString = Object.keys(params)
        .filter(key => params[key] !== undefined && params[key] !== null)
        .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
        .join('&')
      if (queryString) {
        fullUrl += `?${queryString}`
      }
    }

    // 获取 token
    const token = Taro.getStorageSync('token')
    if (token) {
      header['Authorization'] = `Bearer ${token}`
    }
    header['Content-Type'] = 'application/json'

    try {
      const response = await Taro.request({
        url: fullUrl,
        method,
        data,
        header,
      })

      if (response.statusCode >= 200 && response.statusCode < 300) {
        return response.data as ApiResponse<T>
      }

      if (response.statusCode === 401) {
        // Token 过期，跳转登录
        Taro.removeStorageSync('token')
        Taro.showToast({ title: '请重新登录', icon: 'none' })
      }

      throw new Error(response.data?.message || '请求失败')
    } catch (error: any) {
      console.error('API Error:', error)
      throw error
    }
  }

  get<T>(url: string, options?: RequestOptions) {
    return this.request<T>('GET', url, options)
  }

  post<T>(url: string, data?: Record<string, any>, options?: RequestOptions) {
    return this.request<T>('POST', url, { ...options, data })
  }

  put<T>(url: string, data?: Record<string, any>, options?: RequestOptions) {
    return this.request<T>('PUT', url, { ...options, data })
  }

  delete<T>(url: string, options?: RequestOptions) {
    return this.request<T>('DELETE', url, options)
  }
}

export const api = new ApiService()
