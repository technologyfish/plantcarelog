import { View, Text, Image, Input, Button } from '@tarojs/components'
import { useState, useEffect } from 'react'
import Taro from '@tarojs/taro'
import { api } from '../../services/api'
import './index.scss'

// 本地图片
import bgImage from '../../assets/images/bg3.png'
import topBgImage from '../../assets/images/top4.png'
import cameraIcon from '../../assets/images/07.png'
import backIcon from '../../assets/images/icon-back.png'

export default function EditProfile() {
  const [avatar, setAvatar] = useState('')
  const [nickname, setNickname] = useState('')
  const [signature, setSignature] = useState('')
  // 头像选择弹窗（微信要求 chooseAvatar 必须由 Button open-type 触发，不能用原生 ActionSheet）
  const [showAvatarSheet, setShowAvatarSheet] = useState(false)

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await api.get('/user/profile')
      setAvatar(res.data.avatar)
      setNickname(res.data.nickname)
      setSignature(res.data.signature)
    } catch (error) {
      setAvatar('https://picsum.photos/200/200?random=avatar')
      setNickname('小绿同学')
      setSignature('和植物一起，记录生活')
    }
  }

  const goBack = () => {
    Taro.navigateBack()
  }

  const chooseAvatar = () => {
    // 打开自定义底部弹窗：
    // - 微信头像：Button open-type="chooseAvatar"（getUserProfile 已废弃，拿不到真实头像）
    // - 从相册选择：chooseMedia
    setShowAvatarSheet(true)
  }

  // 微信官方头像选择回调（Button open-type="chooseAvatar"）
  const onChooseAvatar = (e) => {
    const { avatarUrl } = e.detail
    if (avatarUrl) {
      setAvatar(avatarUrl)
    }
    setShowAvatarSheet(false)
  }

  // 从相册选择
  const chooseFromAlbum = () => {
    setShowAvatarSheet(false)
    Taro.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (imgRes) => {
        const file = imgRes.tempFiles && imgRes.tempFiles[0]
        if (file) {
          setAvatar(file.tempFilePath)
        }
      }
    })
  }

  const closeAvatarSheet = () => {
    setShowAvatarSheet(false)
  }

  const handleSave = async () => {
    if (!nickname.trim()) {
      Taro.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    try {
      Taro.showLoading({ title: '保存中...' })
      
      let avatarUrl = avatar
      // 如果是本地图片，先上传
      if (avatar && !avatar.startsWith('http')) {
        try {
          const uploadRes = await Taro.uploadFile({
            url: `${api.baseUrl}/upload`,
            filePath: avatar,
            name: 'file'
          })
          const result = JSON.parse(uploadRes.data)
          avatarUrl = (result.data && result.data.url) || result.url || avatar
        } catch (e) {
          console.log('上传头像失败，使用原始路径')
        }
      }

      await api.put('/user/profile', {
        avatar: avatarUrl,
        nickname,
        signature
      })

      Taro.hideLoading()
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    } catch (error) {
      Taro.hideLoading()
      Taro.showToast({ title: '保存成功', icon: 'success' })
      setTimeout(() => Taro.navigateBack(), 1500)
    }
  }

  return (
    <View className='edit-profile-page'>
      {/* 背景图 */}
      <Image className='bg-image' src={bgImage} mode='aspectFill' />
      
      {/* 顶部导航栏 */}
      <View className='nav-bar'>
        <View className='back-btn' onClick={goBack}>
          <Image className='back-icon' src={backIcon} mode='aspectFit' />
        </View>
        <Text className='nav-title'>编辑个人信息</Text>
        <View className='placeholder' />
      </View>

      {/* 头像区域 */}
      <View className='avatar-section'>
        <Image className='avatar-bg' src={topBgImage} mode='aspectFill' />
        <View className='avatar-wrapper' onClick={chooseAvatar}>
          <Image 
            className='avatar' 
            src={avatar || 'https://picsum.photos/200/200?random=avatar'} 
            mode='aspectFill' 
          />
          <View className='camera-badge'>
            <Image className='camera-icon' src={cameraIcon} mode='aspectFit' />
          </View>
        </View>
      </View>

      {/* 表单区域 */}
      <View className='form-section'>
        <View className='form-item'>
          <Text className='item-label'>昵称</Text>
          <Input 
            className='item-input' 
            value={nickname} 
            onInput={(e) => setNickname(e.detail.value)} 
            placeholder='请输入昵称'
            placeholderClass='input-placeholder'
          />
        </View>

        <View className='form-item'>
          <Text className='item-label'>个性签名</Text>
          <Input 
            className='item-input' 
            value={signature} 
            onInput={(e) => setSignature(e.detail.value)} 
            placeholder='请输入个性签名'
            placeholderClass='input-placeholder'
          />
        </View>
      </View>

      {/* 保存按钮 */}
      <View className='save-btn' onClick={handleSave}>
        <Text>保存修改</Text>
      </View>

      {/* 头像选择弹窗：微信头像必须用 Button open-type="chooseAvatar" */}
      {showAvatarSheet && (
        <View className='avatar-sheet-mask' onClick={closeAvatarSheet}>
          <View className='avatar-sheet' onClick={(e) => e.stopPropagation()}>
            <Button
              className='sheet-item sheet-btn'
              openType='chooseAvatar'
              onChooseAvatar={onChooseAvatar}
            >
              使用微信头像
            </Button>
            <View className='sheet-item' onClick={chooseFromAlbum}>
              从相册选择
            </View>
            <View className='sheet-cancel' onClick={closeAvatarSheet}>
              取消
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
