import { View, Text, Image, ScrollView } from '@tarojs/components'
import { useEffect, useState } from 'react'
import { useDidShow } from '@tarojs/taro'
import { api } from '../../services/api'
import ICONS from '../../constants/icons'
import './index.scss'

interface LogItem {
  id: number
  plantId: number
  plantName: string
  plantImage: string
  type: string
  amount: string
  date: string
  time: string
  note: string
  month: string
}

interface GroupedLogs {
  month: string
  items: LogItem[]
}

export default function Logs() {
  const [logs, setLogs] = useState<GroupedLogs[]>([])
  const [selectedType, setSelectedType] = useState('all')

  const careTypes = [
    { type: 'all', name: '全部', icon: ICONS.all },
    { type: 'water', name: '浇水', icon: ICONS.water },
    { type: 'fertilize', name: '施肥', icon: ICONS.fertilize },
    { type: 'prune', name: '修剪', icon: ICONS.prune },
    { type: 'pest', name: '病虫害', icon: ICONS.pest },
    { type: 'other', name: '其他', icon: ICONS.other },
  ]

  useEffect(() => {
    fetchLogs()
  }, [selectedType])

  // tab 页会被缓存，切回日志页时重新拉取（新增养护记录后保持最新）
  useDidShow(() => {
    fetchLogs()
  })

  const fetchLogs = async () => {
    try {
      const res = await api.get('/logs', {
        params: { type: selectedType === 'all' ? undefined : selectedType }
      })
      const grouped = groupByMonth(res.data)
      setLogs(grouped)
    } catch (error) {
      console.error('获取日志失败', error)
    }
  }

  const groupByMonth = (data: LogItem[]): GroupedLogs[] => {
    const groups: { [key: string]: LogItem[] } = {}
    data.forEach(item => {
      const month = item.date.substring(0, 7).replace('-', '年') + '月'
      if (!groups[month]) groups[month] = []
      groups[month].push(item)
    })
    return Object.keys(groups).map(month => ({ month, items: groups[month] }))
  }

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      water: ICONS.water, fertilize: ICONS.fertilize, prune: ICONS.prune,
      pest: ICONS.pest, other: ICONS.other,
    }
    return icons[type] || ICONS.water
  }

  const getTypeName = (type: string) => {
    const names: Record<string, string> = {
      water: '浇水', fertilize: '施肥', prune: '修剪', pest: '病虫害', other: '其他',
    }
    return names[type] || type
  }

  return (
    <View className='logs-page'>
      <View className='header'>
        <View className='header-left'>
          <Image className='header-icon' src={ICONS.log} />
          <View className='header-title'>
            <Text className='title'>养护记录</Text>
          </View>
        </View>
      </View>

      <View className='filter-row'>
        <View className='filter-item'>
          <Image className='filter-icon' src={ICONS.plantSmall} />
          <Text>波士顿蕨</Text>
          <Image className='arrow' src={ICONS.arrowDown} />
        </View>
        <View className='filter-item'>
          <Text>全部</Text>
          <Image className='arrow' src={ICONS.arrowDown} />
        </View>
        <View className='filter-item'>
          <Image className='filter-icon' src={ICONS.calendar} />
          <Text>时间排序</Text>
        </View>
      </View>

      <ScrollView className='type-tabs' scrollX>
        {careTypes.map(item => (
          <View 
            key={item.type}
            className={`tab-item ${selectedType === item.type ? 'active' : ''}`}
            onClick={() => setSelectedType(item.type)}
          >
            <Image className='tab-icon' src={item.icon} />
            <Text className='tab-name'>{item.name}</Text>
          </View>
        ))}
      </ScrollView>

      <View className='timeline'>
        {logs.map(group => (
          <View key={group.month} className='month-group'>
            <View className='month-header'>
              <View className='month-dot' />
              <Text className='month-text'>{group.month}</Text>
            </View>
            {group.items.map(log => (
              <View key={log.id} className='log-item'>
                <View className='log-time'>
                  <Text className='date'>{log.date.substring(5)}</Text>
                  <Text className='time'>{log.time}</Text>
                </View>
                <View className='log-line'>
                  <View className='line-dot' />
                  <View className='line' />
                </View>
                <View className='log-content'>
                  <View className='log-header'>
                    <Image className='type-icon' src={getTypeIcon(log.type)} />
                    <Text className='type-name'>{getTypeName(log.type)}</Text>
                  </View>
                  <View className='log-detail'>
                    <Image className='plant-image' src={log.plantImage} mode='aspectFill' />
                    <View className='detail-info'>
                      <Text className='plant-name'>{log.plantName}</Text>
                      <Text className='detail-text'>{log.amount}</Text>
                      <Text className='note'>{log.note}</Text>
                    </View>
                  </View>
                </View>
              </View>
            ))}
          </View>
        ))}
      </View>

      <View className='footer-text'>
        <Text>记录每一次养护，</Text>
        <Text>都是植物成长的足迹</Text>
        <Image className='footer-icon' src={ICONS.plantSmall} />
      </View>
    </View>
  )
}
