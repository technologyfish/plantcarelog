import axios from 'axios'
import { ElMessage } from 'element-plus'

// 统一 API 封装：后端响应格式 {code, message, data}
const http = axios.create({
  baseURL: '/api',
  timeout: 10000,
})

http.interceptors.response.use(
  (res) => {
    const body = res.data
    if (body && body.code === 200) {
      return body.data
    }
    const msg = (body && body.message) || '请求失败'
    ElMessage.error(msg)
    return Promise.reject(new Error(msg))
  },
  (err) => {
    let msg = '网络错误，请检查后端服务是否启动'
    if (err.response) {
      msg = `HTTP ${err.response.status}`
      const body = err.response.data
      if (body && body.message) msg = body.message
      // Lumen 验证错误格式 {errors: {字段: [msg]}}
      if (body && body.errors) {
        const first = Object.values(body.errors)[0]
        if (Array.isArray(first) && first[0]) msg = String(first[0])
      }
    }
    ElMessage.error(msg)
    return Promise.reject(err)
  }
)

// ---- 用户 ----
export const getProfile = () => http.get('/user/profile')
export const updateProfile = (data) => http.put('/user/profile', data)

// ---- 用户管理（管理后台） ----
export const getUsers = (params) => http.get('/users', { params })
export const createUser = (data) => http.post('/users', data)
export const updateUser = (id, data) => http.put(`/users/${id}`, data)
export const deleteUser = (id) => http.delete(`/users/${id}`)

// ---- 植物 ----
export const getPlants = (params) => http.get('/plants', { params })
export const createPlant = (data) => http.post('/plants', data)
export const getPlant = (id) => http.get(`/plants/${id}`)
export const updatePlant = (id, data) => http.put(`/plants/${id}`, data)
export const deletePlant = (id) => http.delete(`/plants/${id}`)
export const getPlantCareRecords = (id) => http.get(`/plants/${id}/care-records`)
export const getPlantPhotos = (id) => http.get(`/plants/${id}/photos`)

// ---- 分类 ----
export const getCategories = () => http.get('/categories')
export const createCategory = (data) => http.post('/categories', data)
export const updateCategory = (id, data) => http.put(`/categories/${id}`, data)
export const deleteCategory = (id) => http.delete(`/categories/${id}`)

// ---- 养护记录 ----
export const getCareRecords = (params) => http.get('/care-records', { params })
export const createCareRecord = (data) => http.post('/care-records', data)
export const updateCareRecord = (id, data) => http.put(`/care-records/${id}`, data)
export const deleteCareRecord = (id) => http.delete(`/care-records/${id}`)
export const getLogs = (params) => http.get('/logs', { params })

// ---- 文件上传 ----
export const uploadFile = (file) => {
  const formData = new FormData()
  formData.append('file', file)
  return http.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

// 养护类型映射
export const CARE_TYPES = {
  water: '浇水',
  fertilize: '施肥',
  prune: '修剪',
  pest: '除虫',
  soil: '换土',
  other: '其他',
}

export default http
