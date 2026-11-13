<template>
  <el-card style="max-width: 520px" v-loading="loading">
    <template #header>个人资料</template>
    <el-form :model="form" label-width="80px">
      <el-form-item label="头像">
        <ImageUpload v-model="form.avatar" round />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="form.nickname" maxlength="50" />
      </el-form-item>
      <el-form-item label="签名">
        <el-input v-model="form.signature" type="textarea" :rows="2" maxlength="100" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="saving" @click="save">保存修改</el-button>
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getProfile, updateProfile } from '../api'
import ImageUpload from '../components/ImageUpload.vue'

const loading = ref(false)
const saving = ref(false)
const form = ref({ nickname: '', avatar: '', signature: '' })

onMounted(async () => {
  loading.value = true
  try {
    const profile = await getProfile()
    if (profile) {
      form.value.nickname = profile.nickname || ''
      form.value.avatar = profile.avatar || ''
      form.value.signature = profile.signature || ''
    }
  } finally {
    loading.value = false
  }
})

async function save() {
  saving.value = true
  try {
    await updateProfile({
      nickname: form.value.nickname,
      avatar: form.value.avatar,
      signature: form.value.signature,
    })
    ElMessage.success('保存成功')
  } finally {
    saving.value = false
  }
}
</script>
