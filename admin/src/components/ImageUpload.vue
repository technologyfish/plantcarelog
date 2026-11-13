<template>
  <div class="image-upload">
    <div class="preview" :class="{ round }">
      <el-image v-if="modelValue" :src="modelValue" :preview-src-list="[modelValue]" preview-teleported fit="cover" class="preview-img" :class="{ round }" />
      <div v-else class="placeholder" :class="{ round }">
        <el-icon :size="20"><Picture /></el-icon>
      </div>
    </div>
    <div class="actions">
      <el-upload :show-file-list="false" :http-request="handleRequest" accept="image/*" :disabled="uploading">
        <el-button size="small" :loading="uploading" type="primary" plain>
          {{ modelValue ? '更换图片' : '上传图片' }}
        </el-button>
      </el-upload>
      <el-button v-if="modelValue" size="small" text type="danger" @click="$emit('update:modelValue', '')">移除</el-button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage } from 'element-plus'
import { uploadFile } from '../api'

defineProps({
  modelValue: { type: String, default: '' },
  round: { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue'])
const uploading = ref(false)

async function handleRequest({ file }) {
  uploading.value = true
  try {
    const data = await uploadFile(file)
    emit('update:modelValue', data.url)
    ElMessage.success('上传成功')
  } finally {
    uploading.value = false
  }
}
</script>

<style scoped>
.image-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

.preview-img,
.placeholder {
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
}

.round .preview-img,
.round.placeholder,
.placeholder.round {
  border-radius: 50%;
}

.placeholder {
  border: 1px dashed #c0c4cc;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #c0c4cc;
  background: #fafafa;
}

.actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-start;
}
</style>
