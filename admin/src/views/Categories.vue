<template>
  <div>
    <div class="toolbar">
      <el-select v-model="userFilter" placeholder="全部用户" style="width: 150px" @change="load">
        <el-option label="全部用户" value="all" />
        <el-option v-for="u in users" :key="u.id" :label="u.nickname" :value="u.id" />
      </el-select>
      <el-button @click="load">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
      <div class="spacer"></div>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>新增分类
      </el-button>
    </div>

    <el-card class="page-card">
      <el-table :data="categories" v-loading="loading" stripe>
        <el-table-column label="ID" prop="id" width="70" />
        <el-table-column label="归属用户" width="120">
          <template #default="{ row }">{{ row.user?.nickname || `#${row.user_id}` }}</template>
        </el-table-column>
        <el-table-column label="分类名称" prop="name" min-width="140" />
        <el-table-column label="图标" prop="icon" width="100">
          <template #default="{ row }">
            <el-image v-if="row.icon" :src="row.icon" fit="cover" style="width: 32px; height: 32px" />
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="排序" prop="sort_order" width="90" align="center" />
        <el-table-column label="植物数" prop="plant_count" width="90" align="center" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑分类' : '新增分类'" width="420px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="归属用户">
          <el-select v-model="form.user_id" :disabled="!!form.id" style="width: 100%">
            <el-option v-for="u in users" :key="u.id" :label="u.nickname" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="分类名称" maxlength="50" />
        </el-form-item>
        <el-form-item label="图标">
          <ImageUpload v-model="form.icon" />
        </el-form-item>
        <el-form-item label="排序">
          <el-input-number v-model="form.sort_order" :min="1" style="width: 160px" />
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
import { ElMessage, ElMessageBox } from 'element-plus'
import { getCategories, createCategory, updateCategory, deleteCategory, getUsers } from '../api'
import ImageUpload from '../components/ImageUpload.vue'

const loading = ref(false)
const saving = ref(false)
const categories = ref([])
const users = ref([])
const userFilter = ref('all')
const dialogVisible = ref(false)
const form = ref({})

async function load() {
  loading.value = true
  try {
    categories.value = (await getCategories({ user_id: userFilter.value })) || []
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  form.value = row
    ? { id: row.id, user_id: row.user_id, name: row.name, icon: row.icon || '', sort_order: row.sort_order ?? 1 }
    : {
        user_id: userFilter.value !== 'all' ? userFilter.value : (users.value[0]?.id ?? 1),
        name: '',
        icon: '',
        sort_order: (categories.value.length || 0) + 1,
      }
  dialogVisible.value = true
}

async function save() {
  if (!form.value.name?.trim()) return ElMessage.warning('请填写分类名称')
  saving.value = true
  try {
    if (form.value.id) {
      await updateCategory(form.value.id, {
        name: form.value.name,
        icon: form.value.icon,
        sort_order: form.value.sort_order,
      })
      ElMessage.success('更新成功')
    } else {
      await createCategory({
        user_id: form.value.user_id,
        name: form.value.name,
        icon: form.value.icon,
      })
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  await ElMessageBox.confirm(
    `确定删除分类「${row.name}」吗？该分类下的植物会变为未分类。`,
    '删除确认',
    { type: 'warning' }
  )
  await deleteCategory(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(async () => {
  users.value = (await getUsers()) || []
  load()
})
</script>
