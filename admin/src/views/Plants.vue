<template>
  <div>
    <!-- 工具栏 -->
    <div class="toolbar">
      <el-select v-model="userFilter" placeholder="全部用户" style="width: 150px" @change="onUserChange">
        <el-option label="全部用户" value="all" />
        <el-option v-for="u in users" :key="u.id" :label="u.nickname" :value="u.id" />
      </el-select>
      <el-input
        v-model="search"
        placeholder="搜索植物名称"
        clearable
        style="width: 200px"
        @keyup.enter="load"
        @clear="load"
      >
        <template #prefix><el-icon><Search /></el-icon></template>
      </el-input>
      <el-select v-model="categoryId" placeholder="全部分类" clearable style="width: 140px" @change="load">
        <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
      </el-select>
      <el-button type="primary" @click="load">
        <el-icon><Search /></el-icon>查询
      </el-button>
      <div class="spacer"></div>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>新增植物
      </el-button>
    </div>

    <!-- 列表 -->
    <el-card class="page-card">
      <el-table :data="plants" v-loading="loading" stripe>
        <el-table-column label="图片" width="80">
          <template #default="{ row }">
            <el-image
              v-if="row.image"
              :src="row.image"
              :preview-src-list="[row.image]"
              preview-teleported
              fit="cover"
              style="width: 48px; height: 48px; border-radius: 6px"
            />
            <span v-else>—</span>
          </template>
        </el-table-column>
        <el-table-column label="名称" prop="name" min-width="110" />
        <el-table-column label="归属用户" width="110">
          <template #default="{ row }">{{ row.user?.nickname || `#${row.user_id}` }}</template>
        </el-table-column>
        <el-table-column label="分类" width="100">
          <template #default="{ row }">
            <el-tag v-if="row.category" size="small">{{ row.category.name }}</el-tag>
            <el-tag v-else type="info" size="small">未分类</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="入养日期" prop="plant_date" width="100">
          <template #default="{ row }">{{ formatDate(row.plant_date) }}</template>
        </el-table-column>
        <el-table-column label="周期(天)" prop="care_cycle" width="90" align="center" />
        <el-table-column label="描述" prop="description" min-width="150" show-overflow-tooltip>
          <template #default="{ row }">{{ row.description || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="showRecords(row)">记录</el-button>
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑植物' : '新增植物'" width="520px">
      <el-form :model="form" label-width="90px">
        <el-form-item label="归属用户">
          <el-select v-model="form.user_id" style="width: 100%">
            <el-option v-for="u in users" :key="u.id" :label="u.nickname" :value="u.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="名称" required>
          <el-input v-model="form.name" placeholder="植物名称" maxlength="100" />
        </el-form-item>
        <el-form-item label="分类">
          <el-select v-model="form.category_id" placeholder="选择分类" clearable style="width: 100%">
            <el-option v-for="c in categories" :key="c.id" :label="c.name" :value="c.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="入养日期">
          <el-date-picker
            v-model="form.plant_date"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择日期"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="养护周期">
          <el-input-number v-model="form.care_cycle" :min="1" style="width: 160px" /> 天
        </el-form-item>
        <el-form-item label="图片">
          <ImageUpload v-model="form.image" />
        </el-form-item>
        <el-form-item label="描述">
          <el-input v-model="form.description" type="textarea" :rows="3" maxlength="500" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="saving" @click="save">保存</el-button>
      </template>
    </el-dialog>

    <!-- 养护记录抽屉 -->
    <el-drawer v-model="drawerVisible" :title="`${currentPlant?.name || ''} 的养护记录`" size="520px">
      <el-timeline>
        <el-timeline-item
          v-for="r in plantRecords"
          :key="r.id"
          :timestamp="`${formatDate(r.care_date)} ${r.care_time || ''}`"
          :type="timelineType(r.type)"
        >
          <el-tag size="small" style="margin-right: 8px">{{ CARE_TYPES[r.type] || r.type }}</el-tag>
          <span v-if="r.amount">用量：{{ r.amount }}　</span>
          <span style="color: #909399">{{ r.note || '' }}</span>
        </el-timeline-item>
        <el-empty v-if="!plantRecords.length" description="暂无养护记录" />
      </el-timeline>
    </el-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getPlants, createPlant, updatePlant, deletePlant,
  getCategories, getUsers, getPlantCareRecords, CARE_TYPES,
} from '../api'
import ImageUpload from '../components/ImageUpload.vue'

const route = useRoute()
const loading = ref(false)
const saving = ref(false)
const plants = ref([])
const categories = ref([])
const users = ref([])
const search = ref('')
const categoryId = ref(null)
const userFilter = ref('all')

const dialogVisible = ref(false)
const form = ref({})

const drawerVisible = ref(false)
const currentPlant = ref(null)
const plantRecords = ref([])

const formatDate = (d) => {
  if (!d) return '-'
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('zh-CN')
}
const timelineType = (t) =>
  ({ water: 'primary', fertilize: 'success', prune: 'warning', pest: 'danger', soil: 'info', other: 'info' }[t] || 'info')

async function load() {
  loading.value = true
  try {
    const params = { user_id: userFilter.value }
    if (search.value) params.search = search.value
    if (categoryId.value) params.category_id = categoryId.value
    plants.value = (await getPlants(params)) || []
  } finally {
    loading.value = false
  }
}

function onUserChange() {
  categoryId.value = null
  loadCategories()
  load()
}

// 分类跟随所选用户
async function loadCategories() {
  const params = userFilter.value !== 'all' ? { user_id: userFilter.value } : { user_id: 'all' }
  categories.value = (await getCategories(params)) || []
}

function openDialog(row) {
  const defaultUser = userFilter.value !== 'all' ? userFilter.value : (users.value[0]?.id ?? 1)
  form.value = row
    ? {
        id: row.id,
        user_id: row.user_id,
        name: row.name,
        category_id: row.category_id ?? row.category?.id ?? null,
        plant_date: row.plant_date ? String(row.plant_date).slice(0, 10) : null,
        care_cycle: row.care_cycle ?? 7,
        image: row.image || '',
        description: row.description || '',
      }
    : {
        user_id: defaultUser,
        name: '', category_id: null, plant_date: null, care_cycle: 7, image: '', description: '',
      }
  dialogVisible.value = true
}

async function save() {
  if (!form.value.name?.trim()) return ElMessage.warning('请填写植物名称')
  saving.value = true
  try {
    const payload = { ...form.value }
    delete payload.id
    if (form.value.id) {
      await updatePlant(form.value.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createPlant(payload)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  await ElMessageBox.confirm(`确定删除植物「${row.name}」吗？`, '删除确认', { type: 'warning' })
  await deletePlant(row.id)
  ElMessage.success('删除成功')
  load()
}

async function showRecords(row) {
  currentPlant.value = row
  drawerVisible.value = true
  plantRecords.value = []
  plantRecords.value = (await getPlantCareRecords(row.id)) || []
}

onMounted(async () => {
  // 支持从用户管理页跳转过来 ?user_id=N
  if (route.query.user_id) userFilter.value = Number(route.query.user_id)
  users.value = (await getUsers()) || []
  loadCategories()
  load()
})
</script>
