import { View, Text, Image, Input, Textarea, Picker } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { useCategoryStore } from '../../store/category'
import { api } from '../../services/api'
import './index.scss'

// 本地图片素材
import cameraIcon from '../../assets/images/07.png'    // 相机
import decoLeaf from '../../assets/images/leaf-4.png'  // 装饰叶
import backIcon from '../../assets/images/icon-back.png' // 返回按钮图标
import iconArrowDown from '../../assets/images/icon-arrow-down.png'   // 分类下拉箭头
import iconArrowRight from '../../assets/images/icon-arrow-right.png' // 日期右箭头

export default function AddPlant() {
  const { categories, fetchCategories } = useCategoryStore()
  const [plantImage, setPlantImage] = useState('')
  const [plantName, setPlantName] = useState('')
  const [categoryId, setCategoryId] = useState<number | null>(null)
  const [plantDate, setPlantDate] = useState(new Date().toISOString().slice(0, 10))
  const [careCycle, setCareCycle] = useState('6')
  const [description, setDescription] = useState('')

  useEffect(() => { fetchCategories() }, [])

  const handleBack = () => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      Taro.switchTab({ url: '/pages/plants/index' })
    }
  }

  const chooseImage = () => {
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => setPlantImage(res.tempFiles[0].tempFilePath)
    })
  }

  const handleSubmit = async () => {
    if (!plantName.trim()) { Taro.showToast({ title: '请输入植物名称', icon: 'none' }); return }
    if (!plantImage) { Taro.showToast({ title: '请先添加植物照片', icon: 'none' }); return }
    try {
      Taro.showLoading({ title: '添加中...' })
      let imageUrl = ''
      if (plantImage) {
        const uploadRes = await Taro.uploadFile({ url: `${api.baseUrl}/upload`, filePath: plantImage, name: 'file' })
        // 后端返回结构: {code, message, data: {url, filename}} —— url 在 data.url
        const uploadJson = JSON.parse(uploadRes.data)
        if (uploadRes.statusCode !== 200 || uploadJson.code !== 200 || !uploadJson.data?.url) {
          throw new Error(uploadJson.message || '图片上传失败')
        }
        imageUrl = uploadJson.data.url
      }
      // 字段与后端 API 一致（下划线命名）
      await api.post('/plants', {
        name: plantName.trim(),
        image: imageUrl,
        category_id: categoryId,
        plant_date: plantDate,
        care_cycle: parseInt(careCycle) || 7,
        description
      })
      Taro.hideLoading()
      Taro.showToast({ title: '添加成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({ title: '添加失败', icon: 'none' })
    }
  }

  const categoryOptions = [{ id: null, name: '全部' }, ...categories]
  const selectedCategoryIndex = categoryOptions.findIndex(c => c.id === categoryId)

  return (
    <View className='add-plant-page'>
      {/* 左上角返回按钮（统一图标） */}
      <View className='back-btn' onClick={handleBack}>
        <Image className='back-icon' src={backIcon} mode='aspectFit' />
      </View>

      {/* 角落装饰叶 */}
      <Image className='deco-leaf deco-1' src={decoLeaf} mode='aspectFit' />
      <Image className='deco-leaf deco-2' src={decoLeaf} mode='aspectFit' />

      {/* 居中标题 */}
      <View className='page-header'>
        <Text className='page-title'>添加植物</Text>
      </View>

      {/* 照片上传卡片 */}
      <View className='image-upload' onClick={chooseImage}>
        {plantImage ? (
          <Image className='preview-image' src={plantImage} mode='aspectFill' />
        ) : (
          <View className='upload-placeholder'>
            <View className='camera-wrap'>
              <Image className='camera-icon' src={cameraIcon} mode='aspectFit' />
              <View className='plus-badge'>
                <Text className='plus-text'>+</Text>
              </View>
            </View>
            <Text className='upload-title'>添加植物照片</Text>
            <Text className='upload-hint'>记录第一张植物照片</Text>
          </View>
        )}
      </View>

      {/* 植物信息卡片：五行统一圆底图标，严格垂直对齐 */}
      <View className='form-card'>
        {/* 植物名称 */}
        <View className='form-item'>
          <View className='item-icon'><Text className='icon-emoji'>🌱</Text></View>
          <View className='item-content'>
            <Text className='item-label'>植物名称</Text>
            <View className='field-box'>
              <Input
                className='field-input'
                placeholder='给这个小可爱起个名字吧'
                value={plantName}
                maxlength={50}
                onInput={(e) => setPlantName(e.detail.value)}
              />
            </View>
          </View>
        </View>

        {/* 植物分类 */}
        <Picker
          mode='selector'
          range={categoryOptions}
          rangeKey='name'
          value={selectedCategoryIndex >= 0 ? selectedCategoryIndex : 0}
          onChange={(e) => setCategoryId(categoryOptions[parseInt(e.detail.value as string)].id)}
        >
          <View className='form-item'>
            <View className='item-icon'><Text className='icon-emoji'>🪴</Text></View>
            <View className='item-content'>
              <Text className='item-label'>植物分类</Text>
              <View className='field-box'>
                <Text className='field-value'>
                  {categoryId ? categories.find(c => c.id === categoryId)?.name : '全部'}
                </Text>
                <Image className='picker-arrow' src={iconArrowDown} mode='aspectFit' />
              </View>
            </View>
          </View>
        </Picker>

        {/* 种植或购买时间 */}
        <Picker mode='date' value={plantDate} onChange={(e) => setPlantDate(e.detail.value)}>
          <View className='form-item'>
            <View className='item-icon'><Text className='icon-emoji'>📅</Text></View>
            <View className='item-content'>
              <Text className='item-label'>种植或购买时间</Text>
              <View className='field-box'>
                <Text className='field-value'>{plantDate}</Text>
                <Image className='value-arrow' src={iconArrowRight} mode='aspectFit' />
              </View>
            </View>
          </View>
        </Picker>

        {/* 维护周期 */}
        <View className='form-item'>
          <View className='item-icon'><Text className='icon-emoji'>💧</Text></View>
          <View className='item-content'>
            <Text className='item-label'>维护周期</Text>
            <View className='field-box cycle-box'>
              <Input
                className='cycle-input'
                type='number'
                value={careCycle}
                onInput={(e) => setCareCycle(e.detail.value)}
              />
              <Text className='cycle-unit'>天照顾一次</Text>
              <Image className='box-leaf' src={decoLeaf} mode='aspectFit' />
            </View>
          </View>
        </View>

        {/* 植物描述 */}
        <View className='form-item'>
          <View className='item-icon'><Text className='icon-emoji'>📝</Text></View>
          <View className='item-content'>
            <Text className='item-label'>植物描述</Text>
            <View className='field-box textarea-box'>
              <Textarea
                className='field-textarea'
                placeholder='记录一下它的特点、习性、喜好...'
                value={description}
                maxlength={500}
                autoHeight
                onInput={(e) => setDescription(e.detail.value)}
              />
              <Image className='box-leaf leaf-a' src={decoLeaf} mode='aspectFit' />
              <Image className='box-leaf leaf-b' src={decoLeaf} mode='aspectFit' />
            </View>
          </View>
        </View>
      </View>

      {/* 提交按钮：纯色深绿胶囊 */}
      <View className='submit-btn' onClick={handleSubmit}>
        <Text className='btn-flower'>❀</Text>
        <Text>确认添加植物</Text>
      </View>
    </View>
  )
}
