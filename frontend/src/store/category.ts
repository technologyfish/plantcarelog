import { create } from 'zustand'
import { api } from '../services/api'

// 字段与后端 API 返回一致（下划线命名）
export interface Category {
  id: number
  name: string
  icon: string
  plant_count: number
}

interface CategoryState {
  categories: Category[]
  loading: boolean
  fetchCategories: () => Promise<void>
  addCategory: (category: Partial<Category>) => Promise<void>
  updateCategory: (id: number, category: Partial<Category>) => Promise<void>
  deleteCategory: (id: number) => Promise<void>
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  categories: [],
  loading: false,

  fetchCategories: async () => {
    set({ loading: true })
    try {
      const res = await api.get<Category[]>('/categories')
      set({ categories: res.data || [] })
    } catch (error) {
      console.error('获取分类列表失败', error)
      set({ categories: [] })
    } finally {
      set({ loading: false })
    }
  },

  addCategory: async (category: Partial<Category>) => {
    try {
      await api.post('/categories', category)
      await get().fetchCategories()
    } catch (error) {
      console.error('添加分类失败', error)
      throw error
    }
  },

  updateCategory: async (id: number, category: Partial<Category>) => {
    try {
      await api.put(`/categories/${id}`, category)
      await get().fetchCategories()
    } catch (error) {
      console.error('更新分类失败', error)
      throw error
    }
  },

  deleteCategory: async (id: number) => {
    try {
      await api.delete(`/categories/${id}`)
      await get().fetchCategories()
    } catch (error) {
      console.error('删除分类失败', error)
      throw error
    }
  },
}))
