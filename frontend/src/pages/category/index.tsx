import { View, Text, Image, Input } from '@tarojs/components'
import { useEffect, useState } from 'react'
import Taro from '@tarojs/taro'
import { useCategoryStore } from '../../store/category'
import './index.scss'

// 本地图片素材（无需网络）
import leafIcon from '../../assets/images/leaf-2.png'  // 计数行小叶子
import plantRoundIcon from '../../assets/images/01.png' // 弹窗输入图标
import backIcon from '../../assets/images/icon-back.png' // 返回按钮图标

// 分类名 → emoji 兜底映射（与植物列表页一致）
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

interface Category {
  id: number
  name: string
  icon: string
  plant_count: number
}

export default function CategoryManage() {
  const { categories, fetchCategories, addCategory, updateCategory, deleteCategory } = useCategoryStore()
  const [showModal, setShowModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => { fetchCategories() }, [])

  const handleBack = () => {
    const pages = Taro.getCurrentPages()
    if (pages.length > 1) {
      Taro.navigateBack()
    } else {
      // 页面栈为空时兜底回植物 Tab
      Taro.switchTab({ url: '/pages/plants/index' })
    }
  }

  const handleAdd = () => { setEditingCategory(null); setCategoryName(''); setShowModal(true) }

  const handleEdit = (category: Category) => { setEditingCategory(category); setCategoryName(category.name); setShowModal(true) }

  const handleDelete = (category: Category) => {
    Taro.showModal({
      title: '确认删除',
      content: `确定要删除分类「${category.name}」吗？该分类下的 ${category.plant_count ?? 0} 株植物会变为未分类。`,
      confirmColor: '#E53935',
      success: async (res) => {
        if (res.confirm) {
          try {
            await deleteCategory(category.id)
            Taro.showToast({ title: '删除成功', icon: 'success' })
          } catch (error) {
            Taro.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }

  const handleSubmit = async () => {
    if (!categoryName.trim()) { Taro.showToast({ title: '请输入分类名称', icon: 'none' }); return }
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, { name: categoryName.trim() })
        Taro.showToast({ title: '修改成功', icon: 'success' })
      } else {
        await addCategory({ name: categoryName.trim() })
        Taro.showToast({ title: '添加成功', icon: 'success' })
      }
      setShowModal(false)
      setCategoryName('')
    } catch (error) {
      Taro.showToast({ title: '操作失败', icon: 'none' })
    }
  }

  return (
    <View className='category-page'>
      {/* 左上角返回按钮 */}
      <View className='back-btn' onClick={handleBack}>
        <Image className='back-icon' src={backIcon} mode='aspectFit' />
      </View>

      {/* 头部：深绿标题居中 */}
      <View className='header'>
        <Text className='title'>分类管理</Text>
        <Text className='subtitle'>管理你的自定义分类，轻松整理更清晰</Text>
      </View>

      {/* 分类列表 */}
      <View className='category-list'>
        {categories.map((category) => (
          <View key={category.id} className='category-item'>
            {/* 拖拽手柄（2×3 六点） */}
            <View className='drag-handle'>
              <View className='dot-row'><View className='dot' /><View className='dot' /></View>
              <View className='dot-row'><View className='dot' /><View className='dot' /></View>
              <View className='dot-row'><View className='dot' /><View className='dot' /></View>
            </View>

            {/* 分类缩略图：有图片用图片，无图片按名称显示 emoji */}
            {category.icon ? (
              <Image className='category-image' src={category.icon} mode='aspectFill' />
            ) : (
              <View className='category-image emoji-box'>
                <Text className='emoji'>{categoryEmoji(category.name)}</Text>
              </View>
            )}

            <View className='category-info'>
              <Text className='category-name'>{category.name}</Text>
              <View className='category-count'>
                <Image className='count-icon' src={leafIcon} mode='aspectFit' />
                <Text>{category.plant_count ?? 0} 种植物</Text>
              </View>
            </View>

            {/* 操作按钮：浅绿圆底白铅笔 / 浅红圆底红叉 */}
            <View className='category-actions'>
              <View className='action-btn edit' onClick={() => handleEdit(category)}>
                <Text className='edit-icon'>✎</Text>
              </View>
              <View className='action-btn delete' onClick={() => handleDelete(category)}>
                <Text className='delete-icon'>✕</Text>
              </View>
            </View>
          </View>
        ))}

        {categories.length === 0 && (
          <View className='empty-tip'>
            <Text className='empty-text'>还没有分类，点击下方按钮创建吧 🌿</Text>
          </View>
        )}
      </View>

      {/* 底部创建按钮 */}
      <View className='add-btn' onClick={handleAdd}>
        <Text>+ 创建自定义分类</Text>
      </View>

      {/* 新建 / 编辑弹窗 */}
      {showModal && (
        <View className='modal-mask' onClick={() => setShowModal(false)}>
          <View className='modal-content' onClick={(e) => e.stopPropagation()}>
            <Text className='modal-title'>{editingCategory ? '编辑分类' : '新建分类'}</Text>
            <View className='modal-input'>
              <Image className='input-icon' src={plantRoundIcon} mode='aspectFit' />
              <Input
                className='input'
                placeholder='请输入分类名称'
                value={categoryName}
                maxlength={20}
                onInput={(e) => setCategoryName(e.detail.value)}
              />
            </View>
            <View className='modal-actions'>
              <View className='btn cancel' onClick={() => setShowModal(false)}>
                <Text>取消</Text>
              </View>
              <View className='btn confirm' onClick={handleSubmit}>
                <Text>确认</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </View>
  )
}
