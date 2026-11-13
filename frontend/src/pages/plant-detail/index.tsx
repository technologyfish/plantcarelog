import { View, Text, Image } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro, { useRouter } from '@tarojs/taro'
import { api } from '../../services/api'
import ICONS from '../../constants/icons'
import backIcon from '../../assets/images/icon-back.png'
import defaultPlantImg from '../../assets/images/08.png'
import bg3Img from '../../assets/images/bg3.png'
import careWater from '../../assets/images/water-3.png' // 浇水（蓝色水滴）
import careFertilize from '../../assets/images/16.png' // 施肥
import carePrune from '../../assets/images/17.png'     // 修剪
import careMedicine from '../../assets/images/18.png' // 用药（病虫害）
import careSoil from '../../assets/images/19.png'     // 换土
import './index.scss'

interface PlantDetail {
  id: number
  name: string
  scientificName: string
  image: string
  tags: string[]
  description: string
  difficulty: string
  light: string
  temperature: string
  humidity: string
}

interface CareRecord {
  id: number
  type: string
  care_date: string
  care_time: string
  note: string
}

interface Photo {
  id: number
  url: string
  photo_date: string
}

export default function PlantDetail() {
  const router = useRouter()
  const plantId = router.params.id
  const [plant, setPlant] = useState<PlantDetail | null>(null)
  const [careRecords, setCareRecords] = useState<CareRecord[]>([])
  const [photos, setPhotos] = useState<Photo[]>([])

  useEffect(() => {
    if (plantId) {
      fetchPlantDetail()
      fetchCareRecords()
      fetchPhotos()
    }
  }, [plantId])

  const fetchPlantDetail = async () => {
    try {
      const res = await api.get(`/plants/${plantId}`)
      setPlant(res.data)
    } catch (error) {
      // 使用模拟数据
      setPlant({
        id: 1,
        name: '波士顿蕨',
        scientificName: 'Nephrolepis exaltata',
        image: 'https://picsum.photos/200/200?random=1',
        tags: ['观叶植物', '蕨类'],
        description: '叶片柔软浓密，四季常绿，适合室内摆放，能净化空气。',
        difficulty: '中等',
        light: '散射光',
        temperature: '18-25°C',
        humidity: '60%-80%'
      })
    }
  }

  const fetchCareRecords = async () => {
    try {
      const res = await api.get(`/plants/${plantId}/care-records`)
      setCareRecords(res.data || [])
    } catch (error) {
      setCareRecords([])
    }
  }

  const fetchPhotos = async () => {
    try {
      const res = await api.get(`/plants/${plantId}/photos`)
      setPhotos(res.data || [])
    } catch (error) {
      setPhotos([])
    }
  }

  const careActions = [
    { icon: careWater, name: '浇水', type: 'water' },
    { icon: careFertilize, name: '施肥', type: 'fertilize' },
    { icon: carePrune, name: '修剪', type: 'prune' },
    { icon: careMedicine, name: '用药', type: 'pest' },
    { icon: careSoil, name: '换土', type: 'soil' },
  ]

  /** 养护类型 → 中文名（记录列表展示用） */
  const careTypeName = (type: string) => {
    const names: Record<string, string> = {
      water: '浇水', fertilize: '施肥', prune: '修剪', pest: '用药', soil: '换土', other: '其他'
    }
    return names[type] || '养护'
  }

  /** 点击养护操作：直接调接口创建维护记录（无确认弹窗），并刷新记录列表 */
  const handleCareAction = async (type: string) => {
    try {
      const now = new Date()
      const pad = (n: number) => String(n).padStart(2, '0')
      await api.post('/care-records', {
        plant_id: Number(plantId),
        type,
        care_date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
        care_time: `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`
      })
      Taro.showToast({ title: '记录已添加', icon: 'success' })
      fetchCareRecords()
    } catch (error) {
      Taro.showToast({ title: '添加失败', icon: 'none' })
    }
  }

  /** 照片管理：批量选择 → 逐张上传 /api/upload → 批量登记到植物 */
  const addPhoto = () => {
    Taro.chooseMedia({
      count: 9,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        const tempFiles = res.tempFiles || []
        if (!tempFiles.length) return
        try {
          Taro.showLoading({ title: `上传中 0/${tempFiles.length}...` })
          const urls: string[] = []
          for (let i = 0; i < tempFiles.length; i++) {
            Taro.showLoading({ title: `上传中 ${i + 1}/${tempFiles.length}...` })
            const uploadRes = await Taro.uploadFile({
              url: `${api.baseUrl}/upload`,
              filePath: tempFiles[i].tempFilePath,
              name: 'file'
            })
            // 后端返回结构: {code, message, data: {url, filename}}
            const uploadJson = JSON.parse(uploadRes.data)
            if (uploadRes.statusCode !== 200 || uploadJson.code !== 200 || !uploadJson.data?.url) {
              throw new Error(uploadJson.message || '上传失败')
            }
            urls.push(uploadJson.data.url)
          }
          await api.post(`/plants/${plantId}/photos`, { urls })
          Taro.hideLoading()
          Taro.showToast({ title: `已添加 ${urls.length} 张照片`, icon: 'success' })
          fetchPhotos()
        } catch (error) {
          Taro.hideLoading()
          Taro.showToast({ title: '照片上传失败', icon: 'none' })
        }
      }
    })
  }

  /** 点击封面右下角相机：重新上传植物封面 */
  const handleCoverEdit = () => {
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: async (res) => {
        try {
          Taro.showLoading({ title: '上传中...' })
          const uploadRes = await Taro.uploadFile({
            url: `${api.baseUrl}/upload`,
            filePath: res.tempFiles[0].tempFilePath,
            name: 'file'
          })
          // 后端返回结构: {code, message, data: {url, filename}} —— url 在 data.url
          const uploadJson = JSON.parse(uploadRes.data)
          if (uploadRes.statusCode !== 200 || uploadJson.code !== 200 || !uploadJson.data?.url) {
            throw new Error(uploadJson.message || '上传失败')
          }
          const imageUrl = uploadJson.data.url
          await api.put(`/plants/${plantId}`, { image: imageUrl })
          Taro.hideLoading()
          Taro.showToast({ title: '封面已更新', icon: 'success' })
          fetchPlantDetail()
        } catch (error) {
          Taro.hideLoading()
          Taro.showToast({ title: '封面上传失败', icon: 'none' })
        }
      },
      fail: (err) => {
        // 用户主动取消选图不算错误，静默返回
        if (err?.errMsg && err.errMsg.includes('cancel')) {
          return
        }
        Taro.showToast({ title: '上传请求失败', icon: 'none' })
      }
    })
  }

  /** 点击照片：全屏预览，可左右滑动查看该植物所有照片 */
  const previewPhoto = (current: string) => {
    const urls = photos.map(p => p.url).filter(Boolean)
    if (!urls.length) return
    Taro.previewImage({ current, urls })
  }

  const goToRecords = () => {
    Taro.navigateTo({ url: `/pages/care-records/index?plantId=${plantId}` })
  }

  const handleBack = () => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/plants/index' })
    }
  }

  const getCareTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      water: careWater, fertilize: careFertilize, prune: carePrune, pest: careMedicine, soil: careSoil
    }
    return icons[type] || careWater
  }

  if (!plant) {
    return <View className='loading'>加载中...</View>
  }

  return (
    <View className='detail-page'>
      {/* 整页背景图（设计稿 bg3） */}
      <Image className='page-bg' src={bg3Img} mode='aspectFill' />

      {/* 左上角返回按钮（必须在 page-content 之外，锚定页面顶部） */}
      <View className='back-btn' onClick={handleBack}>
        <Image className='back-icon' src={backIcon} mode='aspectFit' />
      </View>

      <View className='page-content'>

      <View className='plant-card'>
        <View className='plant-main'>
          <View className='plant-image-wrap'>
            <Image className='plant-image' src={plant.image || defaultPlantImg} mode='aspectFill' />
            <View className='cover-camera' onClick={handleCoverEdit}>
              <Image className='camera-img' src={ICONS.camera} />
            </View>
          </View>
          <View className='plant-info'>
            <View className='name-row'>
              <Text className='plant-name'>{plant.name}</Text>
              <Image className='name-leaf-icon' src={ICONS.leaf} />
            </View>
            <Text className='scientific-name'>{plant.scientific_name}</Text>
            <View className='tags'>
              {plant.tags?.map((tag, index) => <Text key={index} className='tag'>{tag}</Text>)}
            </View>
            <Text className='description'>{plant.description}</Text>
          </View>
        </View>
        {/* 环境参数条：先隐藏（数据暂缺，恢复时取消注释即可）
        <View className='care-params'>
          <View className='param-item'>
            <Image className='param-icon' src={ICONS.leaf} />
            <Text className='param-label'>养护难度</Text>
            <Text className='param-value'>{plant.difficulty}</Text>
          </View>
          <View className='param-item'>
            <Image className='param-icon' src={ICONS.sun} />
            <Text className='param-label'>光照</Text>
            <Text className='param-value'>{plant.light}</Text>
          </View>
          <View className='param-item'>
            <Image className='param-icon' src={ICONS.thermometer} />
            <Text className='param-label'>适宜温度</Text>
            <Text className='param-value'>{plant.temperature}</Text>
          </View>
          <View className='param-item'>
            <Image className='param-icon' src={ICONS.waterDrop} />
            <Text className='param-label'>湿度</Text>
            <Text className='param-value'>{plant.humidity}</Text>
          </View>
        </View>
        */}
      </View>

      <View className='section'>
        <View className='section-header'>
          <Image className='section-icon' src={ICONS.care} />
          <Text className='section-title'>养护操作</Text>
          {/* 查看全部：先隐藏（恢复时取消注释）
          <Text className='view-all'>查看全部</Text>
          */}
        </View>
        <View className='care-actions'>
          {careActions.map((action, index) => (
            <View key={index} className='action-item' onClick={() => handleCareAction(action.type)}>
              <Image className='action-icon' src={action.icon} />
              <Text className='action-name'>{action.name}</Text>
            </View>
          ))}
        </View>
      </View>

      <View className='section'>
        <View className='section-header'>
          <Image className='section-icon' src={ICONS.record} />
          <Text className='section-title'>维护记录</Text>
          <Text className='view-all' onClick={goToRecords}>更多 ›</Text>
        </View>
        <View className='record-list'>
          {careRecords.slice(0, 5).map(record => (
            <View key={record.id} className='record-item'>
              <Image className='record-icon' src={getCareTypeIcon(record.type)} />
              <View className='record-info'>
                <Text className='record-type'>{careTypeName(record.type)}</Text>
                <Text className='record-date'>{record.care_date} {record.care_time || ''}</Text>
              </View>
              <Text className='record-note'>{record.note || ''}</Text>
            </View>
          ))}
          {careRecords.length === 0 && (
            <View className='record-empty'><Text>暂无维护记录</Text></View>
          )}
        </View>
        {careRecords.length > 5 && (
          <View className='records-more' onClick={goToRecords}>
            <Text>点击更多</Text>
          </View>
        )}
      </View>

      <View className='section'>
        <View className='section-header'>
          <Image className='section-icon' src={ICONS.camera} />
          <Text className='section-title'>照片管理</Text>
        </View>
        <View className='photo-grid'>
          <View className='photo-add' onClick={addPhoto}>
            <Text className='add-icon'>+</Text>
            <Text className='add-text'>添加照片</Text>
          </View>
          {photos.map(photo => (
            <View key={photo.id} className='photo-item' onClick={() => previewPhoto(photo.url)}>
              <Image className='photo-image' src={photo.url} mode='aspectFill' />
              <Text className='photo-date'>{(photo.photo_date || '').slice(5)}</Text>
            </View>
          ))}
        </View>
      </View>

      </View>
    </View>
  )
}
