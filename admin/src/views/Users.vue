<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-input
        v-model="search"
        placeholder="搜索昵称"
        clearable
        style="width: 220px"
        @keyup.enter="load"
        @clear="load"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-button @click="load">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
      <div class="spacer"></div>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>新增用户
      </el-button>
    </div>

    <!-- 列表 -->
    <el-card class="page-card">
      <el-table :data="users" v-loading="loading" stripe>
        <el-table-column label="ID" prop="id" width="70" />
        <el-table-column label="头像" width="70">
          <template #default="{ row }">
            <el-avatar v-if="row.avatar" :src="row.avatar" :size="40" />
            <el-avatar v-else :size="40" icon="UserFilled" />
          </template>
        </el-table-column>
        <el-table-column label="昵称" prop="nickname" min-width="140">
          <template #default="{ row }">
            {{ row.nickname }}
            <el-tag v-if="row.id === 1" size="small" type="info" style="margin-left: 6px">默认</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="签名" prop="signature" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.signature || '-' }}</template>
        </el-table-column>
        <el-table-column label="植物数" prop="plants_count" width="90" align="center">
          <template #default="{ row }">
            <el-tag type="success" size="small" round>{{ row.plants_count ?? 0 }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="注册时间" width="110">
          <template #default="{ row }">{{ formatDate(row.created_at) }}</template>
        </el-table-column>
        <el-table-column label="操作" width="230" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="viewPlants(row)">查看植物</el-button>
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑用户' : '新增用户'" width="460px">
      <el-form :model="form" label-width="70px">
        <el-form-item label="头像">
          <ImageUpload v-model="form.avatar" round />
        </el-form-item>
        <el-form-item label="昵称" required>
          <el-input v-model="form.nickname" placeholder="用户昵称" maxlength="50" />
        </el-form-item>
        <el-form-item label="签名">
          <el-input v-model="form.signature" type="textarea" :rows="2" maxlength="100" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getUsers, createUser, updateUser, deleteUser } from '../api'
import ImageUpload from '../components/ImageUpload.vue'

const router = useRouter()
const loading = ref(false)
const saving = ref(false)
const users = ref([])
const search = ref('')
const dialogVisible = ref(false)
const form = ref({})

const formatDate = (d) => {
  if (!d) return '-'
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('zh-CN')
}

async function load() {
  loading.value = true
  try {
    const params = {}
    if (search.value) params.search = search.value
    users.value = (await getUsers(params)) || []
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  form.value = row
    ? { id: row.id, nickname: row.nickname, avatar: row.avatar || '', signature: row.signature || '' }
    : { nickname: '', avatar: '', signature: '' }
  dialogVisible.value = true
}

async function save() {
  if (!form.value.nickname?.trim()) {
    ElMessage.warning('请填写昵称')
    return
  }
  saving.value = true
  try {
    const payload = {
      nickname: form.value.nickname,
      avatar: form.value.avatar,
      signature: form.value.signature,
    }
    if (form.value.id) {
      await updateUser(form.value.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createUser(payload)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  if (row.id === 1) {
    ElMessage.warning('默认用户不可删除（小程序端依赖）')
    return
  }
  await ElMessageBox.confirm(
    `确定删除用户「${row.nickname}」吗？其名下的 ${row.plants_count ?? 0} 株植物、分类和养护记录将一并删除。`,
    '删除确认',
    { type: 'warning' }
  )
  await deleteUser(row.id)
  ElMessage.success('删除成功')
  load()
}

function viewPlants(row) {
  router.push({ path: '/plants', query: { user_id: row.id } })
}

onMounted(load)
</script>
