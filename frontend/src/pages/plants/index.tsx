import { View, Text, Image, Input, ScrollView } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro, { useDidShow } from '@tarojs/taro'
import { usePlantStore } from '../../store/plant'
import { useCategoryStore } from '../../store/category'
import './index.scss'

// 本地图片素材（绿色主题，无需网络）
import plantRoundIcon from '../../assets/images/01.png'   // 植物圆标（全部 / 头部）
import leafIcon from '../../assets/images/leaf-2.png'    // 名称行小绿叶
import waterIcon from '../../assets/images/water-1.png'  // 蓝色水滴
import decoLeaf from '../../assets/images/leaf-4.png'    // 装饰叶
import defaultPlantImg from '../../assets/images/08.png' // 植物默认图
import searchIcon from '../../assets/images/icon-search.png' // 搜索图标

// 分类名 → emoji 图标兜底映射
const CATEGORY_EMOJI: Record<string, string> = {
  '室内': '🏠',
  '多肉': '🪴',
  '仙人掌': '🌵',
  '花卉': '🌸',
  '花': '🌸',
  '香草': '🌿',
  '观叶': '🍃',
  '水生': '💧',
}

function categoryEmoji(name: string): string {
  for (const key of Object.keys(CATEGORY_EMOJI)) {
    if (name.includes(key)) return CATEGORY_EMOJI[key]
  }
  return '🌿'
}

export default function Plants() {
  const { plants, fetchPlants } = usePlantStore()
  const { categories, fetchCategories } = useCategoryStore()
  const [activeCategory, setActiveCategory] = useState<number | null>(null)
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    fetchPlants()
    fetchCategories()
  }, [])

  // tab 页在小程序中会被缓存，从「添加植物」等页面返回时
  // useEffect([]) 不会重新执行 —— 用 useDidShow 在每次页面显示时刷新数据
  useDidShow(() => {
    fetchPlants()
    fetchCategories()
  })

  const filteredPlants = plants.filter(plant => {
    const matchCategory = activeCategory === null || plant.category_id === activeCategory
    const matchSearch = searchText === '' || plant.name.includes(searchText)
    return matchCategory && matchSearch
  })

  const goToPlantDetail = (id: number) => {
    Taro.navigateTo({ url: `/pages/plant-detail/index?id=${id}` })
  }

  const goToAddPlant = () => {
    Taro.navigateTo({ url: '/pages/add-plant/index' })
  }

  const goToCategoryManage = () => {
    Taro.navigateTo({ url: '/pages/category/index' })
  }

  return (
    <View className='plants-page'>
      {/* 头部：绿色标题 + 叶子图标 + 右上角淡叶装饰 */}
      <View className='header'>
        <Image className='deco-leaf deco-1' src={decoLeaf} mode='aspectFit' />
        <Image className='deco-leaf deco-2' src={decoLeaf} mode='aspectFit' />
        <View className='header-left'>
          <View className='header-title'>
            <Text className='title'>植物管理</Text>
            <Text className='subtitle'>记录每一株植物的成长</Text>
          </View>
        </View>
      </View>

      {/* 分类卡片横滚：全部 + 各分类 + 自定义分类（虚线卡） */}
      <ScrollView className='category-scroll' scrollX enhanced showScrollbar={false}>
        <View className='category-tabs'>
          <View
            className={`tab-item ${activeCategory === null ? 'active' : ''}`}
            onClick={() => setActiveCategory(null)}
          >
            <Image className='tab-icon' src={plantRoundIcon} mode='aspectFit' />
            <Text className='tab-text'>全部</Text>
            <Text className='tab-count'>{plants.length}</Text>
          </View>

          {categories.map(cat => (
            <View
              key={cat.id}
              className={`tab-item ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.icon ? (
                <Image className='tab-icon' src={cat.icon} mode='aspectFit' />
              ) : (
                <Text className='tab-emoji'>{categoryEmoji(cat.name)}</Text>
              )}
              <Text className='tab-text'>{cat.name}</Text>
              <Text className='tab-count'>{cat.plant_count ?? 0}</Text>
            </View>
          ))}

          {/* 自定义分类：虚线卡 */}
          <View className='tab-item add-tab' onClick={goToCategoryManage}>
            <Text className='tab-plus'>+</Text>
            <Text className='tab-text'>自定义分类</Text>
          </View>
        </View>
      </ScrollView>

      {/* 搜索栏：胶囊形 */}
      <View className='search-bar'>
        <Image className='search-icon' src={searchIcon} mode='aspectFit' />
        <Input
          className='search-input'
          placeholder='搜索植物名称、标签...'
          value={searchText}
          onInput={(e) => setSearchText(e.detail.value)}
        />
      </View>

      {/* 植物列表：2 列卡片 */}
      {filteredPlants.length > 0 ? (
        <View className='plant-grid'>
          {filteredPlants.map(plant => (
            <View
              key={plant.id}
              className='plant-card'
              onClick={() => goToPlantDetail(plant.id)}
            >
              <Image
                className='plant-image'
                src={plant.image || defaultPlantImg}
                mode='aspectFill'
              />
              <View className='plant-info'>
                <View className='plant-name-row'>
                  <Image className='plant-leaf-icon' src={leafIcon} mode='aspectFit' />
                  <Text className='plant-name'>{plant.name}</Text>
                  {plant.category_name && plant.category_name !== '未分类' && (
                    <Text className='plant-category'>{plant.category_name}</Text>
                  )}
                  <Text className='arrow'>›</Text>
                </View>
                <View className='plant-status-row'>
                  <Image className='water-icon' src={waterIcon} mode='aspectFit' />
                  <Text className={`water-text ${plant.need_water ? 'need' : ''}`}>
                    {plant.need_water ? '今日需浇水' : '无需浇水'}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      ) : (
        <View className='empty-tip'>
          <Text className='empty-text'>
            {plants.length === 0 ? '还没有植物，点击下方按钮添加第一株吧 🌱' : '没有符合条件的植物'}
          </Text>
        </View>
      )}

      {/* 添加按钮 */}
      <View className='add-btn' onClick={goToAddPlant}>
        <Text>+ 添加植物</Text>
      </View>
    </View>
  )
}
