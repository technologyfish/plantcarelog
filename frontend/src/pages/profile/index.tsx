import { View, Text, Image } from '@tarojs/components'
import { useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { api } from '../../services/api'
import './index.scss'

// 本地图片素材（均为绿色主题圆底图标，与设计稿一致）
import leafBadge from '../../assets/images/leaf-3.png'
import plantIcon from '../../assets/images/01.png'   // 我的植物：植物圆标
import waterIcon from '../../assets/images/water-1.png' // 今日养护：水滴
import calendarIcon from '../../assets/images/04.png'   // 累计养护：日历
import starIcon from '../../assets/images/03.png'       // 记录天数：星星
import sectionLeaf from '../../assets/images/leaf-2.png' // 标题叶子
import decoLeaf from '../../assets/images/leaf-4.png'   // 右上角装饰叶子
import defaultAvatar from '../../assets/images/01.png'  // 默认头像

interface UserProfile {
  id: number
  nickname: string
  avatar: string
  signature: string
  plantCount: number
  todayCare: number
  totalCare: number
  recordDays: number
}

// 后端字段为下划线命名：last_care / care_count
interface Plant {
  id: number
  name: string
  image: string
  last_care?: string
  care_count?: number
}

export default function Profile() {
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [plants, setPlants] = useState<Plant[]>([])

  // tab 页面会被小程序缓存，useEffect([]) 只在首次挂载执行；
  // 从「编辑个人信息」返回时页面不会重新挂载，改用 useDidShow 每次显示都刷新
  useDidShow(() => {
    fetchProfile()
    fetchMyPlants()
  })

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile')
      setProfile(res.data)
    } catch (error) {
      setProfile({
        id: 1,
        nickname: '小绿同学',
        avatar: '',
        signature: '和植物一起，记录生活',
        plantCount: 0,
        todayCare: 0,
        totalCare: 0,
        recordDays: 0
      })
    }
  }

  const fetchMyPlants = async () => {
    try {
      const res = await api.get('/plants')
      setPlants(res.data?.slice(0, 6) || [])
    } catch (error) {
      setPlants([])
    }
  }

  const goToEditProfile = () => {
    Taro.navigateTo({ url: '/pages/edit-profile/index' })
  }

  const goToPlantDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/plant-detail/index?id=${id}` })
  }

  const goToAllPlants = () => {
    Taro.switchTab({ url: '/pages/plants/index' })
  }

  return (
    <View className='profile-page'>
      {/* 顶部标题 */}
      <View className='header'>
        <Image className='deco-leaf deco-1' src={decoLeaf} mode='aspectFit' />
        <Image className='deco-leaf deco-2' src={decoLeaf} mode='aspectFit' />
        <Text className='title'>我的</Text>
        <Text className='subtitle'>记录植物 · 也记录生活</Text>
      </View>

      {/* 个人信息卡片（白色，点击进入编辑） */}
      <View className='user-card' onClick={goToEditProfile}>
        <View className='user-info'>
          <View className='avatar-wrap'>
            <Image
              className='avatar'
              src={profile?.avatar || defaultAvatar}
              mode='aspectFill'
            />
            <View className='avatar-edit-badge'>
              <Text className='avatar-edit-icon'>✎</Text>
            </View>
          </View>
          <View className='user-detail'>
            <View className='name-row'>
              <Text className='nickname'>{profile?.nickname || '小绿同学'}</Text>
              <Image className='leaf-badge' src={leafBadge} mode='aspectFit' />
            </View>
            <View className='signature-row'>
              <Text className='signature'>{profile?.signature || '和植物一起，记录生活'}</Text>
              <View className='sig-edit-icon'>
                <Text className='sig-edit-text'>✎</Text>
              </View>
            </View>
          </View>
        </View>
        <Text className='arrow'>›</Text>
      </View>

      {/* 统计卡片：植物 / 今日养护 / 累计养护 / 记录天数 */}
      <View className='stats-card'>
        <View className='stat-item'>
          <Image className='stat-icon' src={plantIcon} mode='aspectFit' />
          <Text className='stat-value'>{profile?.plantCount || 0}</Text>
          <Text className='stat-label'>我的植物</Text>
        </View>
        <View className='stat-item'>
          <Image className='stat-icon' src={waterIcon} mode='aspectFit' />
          <Text className='stat-value'>{profile?.todayCare || 0}</Text>
          <Text className='stat-label'>今日养护</Text>
        </View>
        <View className='stat-item'>
          <Image className='stat-icon' src={calendarIcon} mode='aspectFit' />
          <Text className='stat-value'>{profile?.totalCare || 0}</Text>
          <Text className='stat-label'>累计养护</Text>
        </View>
        <View className='stat-item'>
          <Image className='stat-icon' src={starIcon} mode='aspectFit' />
          <Text className='stat-value'>{profile?.recordDays || 0}</Text>
          <Text className='stat-label'>记录天数</Text>
        </View>
      </View>

      {/* 我的植物 */}
      <View className='plants-section'>
        <View className='section-header'>
          <View className='section-title'>
            <Image className='leaf-icon' src={sectionLeaf} mode='aspectFit' />
            <Text className='title-text'>我的植物</Text>
          </View>
          <Text className='view-all' onClick={goToAllPlants}>查看全部 ›</Text>
        </View>

        {plants.length > 0 ? (
          <View className='plant-grid'>
            {plants.map(plant => (
              <View key={plant.id} className='plant-item' onClick={() => goToPlantDetail(plant.id)}>
                <Image
                  className='plant-image'
                  src={plant.image || defaultAvatar}
                  mode='aspectFill'
                />
                <View className='plant-info'>
                  <View className='plant-name-row'>
                    <Image className='plant-leaf' src={sectionLeaf} mode='aspectFit' />
                    <Text className='plant-name'>{plant.name}</Text>
                  </View>
                  <Text className='plant-stats'>{plant.last_care || '暂无记录'} · {plant.care_count ?? 0}次</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View className='empty-tip'>
            <Text className='empty-text'>还没有植物，去「植物」页添加第一株吧 🌱</Text>
          </View>
        )}
      </View>

      {/* 底部安全区域 */}
      <View className='safe-area-bottom' />
    </View>
  )
}
