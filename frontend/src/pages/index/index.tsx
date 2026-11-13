import { View, Text, Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { usePlantStore } from '../../store/plant'
import './index.scss'

// 本地图片引用
import topBannerImg from '../../assets/images/top2.png'
import leafIcon from '../../assets/images/leaf-2.png'
import waterIcon from '../../assets/images/water-1.png'
import defaultPlantImg from '../../assets/images/08.png' // 植物默认图
import iconArrowRight from '../../assets/images/icon-arrow-right.png' // 右箭头

export default function Index() {
  const [currentDate] = useState(new Date())
  const [weekDays, setWeekDays] = useState<Date[]>([])
  const [calendarExpanded, setCalendarExpanded] = useState(false)
  const [monthDays, setMonthDays] = useState<(Date | null)[]>([])
  const { plants, fetchPlants } = usePlantStore()

  useEffect(() => {
    generateWeekDays()
    generateMonthDays()
    fetchPlants()
  }, [])

  // tab 页会被缓存，切回首页时刷新植物数据（如从添加植物返回）
  useDidShow(() => {
    fetchPlants()
  })

  // 生成当前周的日期
  const generateWeekDays = () => {
    const today = new Date()
    const days: Date[] = []
    const dayOfWeek = today.getDay()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - dayOfWeek)
    
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    setWeekDays(days)
  }

  // 生成当月所有日期（用于展开视图）
  const generateMonthDays = () => {
    const today = new Date()
    const year = today.getFullYear()
    const month = today.getMonth()
    
    // 获取本月第一天是星期几
    const firstDay = new Date(year, month, 1)
    const firstDayOfWeek = firstDay.getDay()
    
    // 获取本月天数
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days: (Date | null)[] = []
    
    // 填充月初空白
    for (let i = 0; i < firstDayOfWeek; i++) {
      days.push(null)
    }
    
    // 填充日期
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    setMonthDays(days)
  }

  const isToday = (date: Date | null) => {
    if (!date) return false
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const weekDayNames = ['日', '一', '二', '三', '四', '五', '六']

  const goToPlantDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/plant-detail/index?id=${id}` })
  }

  const goToAllPlants = () => {
    Taro.switchTab({ url: '/pages/plants/index' })
  }

  const toggleCalendar = () => {
    setCalendarExpanded(!calendarExpanded)
  }

  return (
    <View className='index-page'>
      {/* 第一部分：顶部 Logo + Slogan */}
      <View className='header-section'>
        <View className='logo-container'>
          <View className='slogan-container'>
            <Text className='title'>植物日记</Text>
            <Text className='subtitle'>记录你的的一株绿意</Text>
          </View>
        </View>
      </View>

      {/* 第二部分：顶部 Banner 图片 */}
      <View className='banner-section'>
        <Image className='banner-image' src={topBannerImg} mode='widthFix' />
      </View>

      {/* 第三部分：日历 */}
      <View className='calendar-section'>
        <View className='calendar-card'>
          <View className='calendar-header'>
            <Text className='month'>{currentDate.getMonth() + 1}月</Text>
            <View className='expand-btn' onClick={toggleCalendar}>
              <Text className='expand-icon'>♥</Text>
              <Text className='expand-text'>{calendarExpanded ? '收起' : '展开'}</Text>
            </View>
          </View>
          
          {/* 星期标题行 */}
          <View className='week-header'>
            {weekDayNames.map((name, index) => (
              <View key={index} className='week-name'>
                <Text>{name}</Text>
              </View>
            ))}
          </View>

          {/* 日期显示 */}
          {!calendarExpanded ? (
            // 收起状态：只显示当前周
            <View className='week-days'>
              {weekDays.map((day, index) => (
                <View 
                  key={index} 
                  className={`day-item ${isToday(day) ? 'today' : ''}`}
                >
                  <Text className='day-number'>{day.getDate()}</Text>
                  {isToday(day) && <View className='today-dot' />}
                </View>
              ))}
            </View>
          ) : (
            // 展开状态：显示整月
            <View className='month-days'>
              {monthDays.map((day, index) => (
                <View 
                  key={index} 
                  className={`day-item ${day ? (isToday(day) ? 'today' : '') : 'empty'}`}
                >
                  {day && (
                    <>
                      <Text className='day-number'>{day.getDate()}</Text>
                      {isToday(day) && <View className='today-dot' />}
                    </>
                  )}
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* 第四部分：我的植物 */}
      <View className='plants-section'>
        <View className='section-header'>
          <View className='section-title'>
            <Text className='title-text'>我的植物</Text>
          </View>
          <View className='view-all' onClick={goToAllPlants}>
            <Text>全部 {plants.length}</Text>
            <Image className='view-all-arrow' src={iconArrowRight} mode='aspectFit' />
          </View>
        </View>
        
        <View className='plant-grid'>
          {plants.slice(0, 2).map((plant) => (
            <View 
              key={plant.id} 
              className='plant-card'
              onClick={() => goToPlantDetail(plant.id)}
            >
              <View className='plant-image-wrapper'>
                <Image className='plant-image' src={plant.image || defaultPlantImg} mode='aspectFill' />
              </View>
              <View className='plant-info'>
                <View className='plant-name-row'>
                  <Image className='plant-leaf-icon' src={leafIcon} mode='aspectFit' />
                  <Text className='plant-name'>{plant.name}</Text>
                  <Image className='name-arrow' src={iconArrowRight} mode='aspectFit' />
                </View>
                <Text className='plant-days'>已陪伴 {plant.days} 天</Text>
                <View className='plant-status-row'>
                  <View className={`water-pill ${plant.need_water ? 'need' : 'no-need'}`}>
                    <Text>{plant.need_water ? '今天需要浇水' : '无需浇水'}</Text>
                  </View>
                  <Image
                    className={`water-icon ${plant.need_water ? 'need' : ''}`}
                    src={waterIcon}
                    mode='aspectFit'
                  />
                </View>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 底部安全区域 */}
      <View className='safe-area-bottom' />
    </View>
  )
}
