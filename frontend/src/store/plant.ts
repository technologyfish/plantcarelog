import { create } from 'zustand'
import { api } from '../services/api'

// 字段与后端 API 返回一致（下划线命名）
export interface Plant {
  id: number
  name: string
  image: string
  category_id: number | null
  category_name: string
  plant_date: string
  care_cycle: number
  description: string
  days: number
  need_water: boolean
  last_care: string
  care_count: number
}

interface PlantState {
  plants: Plant[]
  currentPlant: Plant | null
  loading: boolean
  fetchPlants: () => Promise<void>
  fetchPlantById: (id: number) => Promise<void>
  addPlant: (plant: Partial<Plant>) => Promise<void>
  updatePlant: (id: number, plant: Partial<Plant>) => Promise<void>
  deletePlant: (id: number) => Promise<void>
}

export const usePlantStore = create<PlantState>((set, get) => ({
  plants: [],
  currentPlant: null,
  loading: false,

  fetchPlants: async () => {
    set({ loading: true })
    try {
      const res = await api.get<Plant[]>('/plants')
      set({ plants: res.data || [] })
    } catch (error) {
      console.error('获取植物列表失败', error)
      set({ plants: [] })
    } finally {
      set({ loading: false })
    }
  },

  fetchPlantById: async (id: number) => {
    set({ loading: true })
    try {
      const res = await api.get<Plant>(`/plants/${id}`)
      set({ currentPlant: res.data })
    } catch (error) {
      console.error('获取植物详情失败', error)
    } finally {
      set({ loading: false })
    }
  },

  addPlant: async (plant: Partial<Plant>) => {
    try {
      await api.post('/plants', plant)
      await get().fetchPlants()
    } catch (error) {
      console.error('添加植物失败', error)
      throw error
    }
  },

  updatePlant: async (id: number, plant: Partial<Plant>) => {
    try {
      await api.put(`/plants/${id}`, plant)
      await get().fetchPlants()
    } catch (error) {
      console.error('更新植物失败', error)
      throw error
    }
  },

  deletePlant: async (id: number) => {
    try {
      await api.delete(`/plants/${id}`)
      await get().fetchPlants()
    } catch (error) {
      console.error('删除植物失败', error)
      throw error
    }
  },
}))
