import { View, Text, Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro, { useRouter, useReachBottom } from '@tarojs/taro'
import { api } from '../../services/api'
import backIcon from '../../assets/images/icon-back.png'
import bg3Img from '../../assets/images/bg3.png'
import topBannerImg from '../../assets/images/top2.png'
import careWater from '../../assets/images/water-3.png' // 浇水
import careFertilize from '../../assets/images/16.png'    // 施肥
import carePrune from '../../assets/images/17.png'        // 修剪
import careMedicine from '../../assets/images/18.png'    // 用药
import careSoil from '../../assets/images/19.png'        // 换土
import './index.scss'

interface CareRecord {
  id: number
  plant_id: number
  type: string
  care_date: string
  care_time: string
  note: string
}

const PAGE_SIZE = 10

/** 养护类型 → 中文名 */
const careTypeName = (type: string) => {
  const names: Record<string, string> = {
    water: '浇水', fertilize: '施肥', prune: '修剪', pest: '用药', soil: '换土', other: '其他'
  }
  return names[type] || '养护'
}

/** 养护类型 → 图标 */
const careTypeIcon = (type: string) => {
  const icons: Record<string, string> = {
    water: careWater, fertilize: careFertilize, prune: carePrune, pest: careMedicine, soil: careSoil
  }
  return icons[type] || careWater
}

export default function CareRecords() {
  const router = useRouter()
  const plantId = router.params.plantId
  const [records, setRecords] = useState<CareRecord[]>([])
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [loading, setLoading] = useState(false)

  const fetchRecords = async () => {
    setLoading(true)
    try {
      const res = await api.get('/care-records', { params: { plant_id: plantId || undefined } })
      const list: CareRecord[] = res.data || []
      list.sort((a, b) => {
        const da = `${a.care_date} ${a.care_time || ''}`
        const db = `${b.care_date} ${b.care_time || ''}`
        return db.localeCompare(da)
      })
      setRecords(list)
      setVisibleCount(PAGE_SIZE)
    } catch (error) {
      setRecords([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchRecords() }, [plantId])

  const hasMore = visibleCount < records.length

  /** 上拉到底加载下一页 */
  const loadMore = () => {
    if (!hasMore || loading) return
    setVisibleCount(c => c + PAGE_SIZE)
  }
  useReachBottom(loadMore)

  const handleBack = () => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/plants/index' })
    }
  }

  return (
    <View className='care-records-page'>
      {/* 整页背景图（设计稿 bg3） */}
      <Image className='page-bg' src={bg3Img} mode='aspectFill' />

      {/* 左上角返回按钮 */}
      <View className='back-btn' onClick={handleBack}>
        <Image className='back-icon' src={backIcon} mode='aspectFit' />
      </View>

      {/* 顶部居中标题（与返回按钮同水平线） */}
      <View className='page-title-bar'>
        <Text className='page-title-text'>养护记录</Text>
      </View>

      <View className='page-content'>
        {/* 顶部横幅（设计稿 top2） */}
        <Image className='page-banner' src={topBannerImg} mode='widthFix' />

        <View className='record-list'>
          {records.slice(0, visibleCount).map(record => (
            <View key={record.id} className='record-card'>
              <Image className='record-icon' src={careTypeIcon(record.type)} mode='aspectFit' />
              <View className='record-info'>
                <Text className='record-type'>{careTypeName(record.type)}</Text>
                <Text className='record-time'>{record.care_date} {record.care_time || ''}</Text>
              </View>
              {record.note ? <Text className='record-note'>{record.note}</Text> : null}
            </View>
          ))}

          {records.length === 0 && !loading && (
            <View className='record-empty'><Text>暂无维护记录</Text></View>
          )}
        </View>

        {hasMore && (
          <View className='load-more' onClick={loadMore}>
            <Text>上拉或点击加载更多</Text>
          </View>
        )}
        {!hasMore && records.length > 0 && (
          <View className='load-end'><Text>— 没有更多了 —</Text></View>
        )}
      </View>
    </View>
  )
}
