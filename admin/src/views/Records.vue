<template>
  <div>
    <!-- 筛选工具栏 -->
    <div class="toolbar">
      <el-select v-model="userFilter" placeholder="全部用户" style="width: 150px" @change="load">
        <el-option label="全部用户" value="all" />
        <el-option v-for="u in users" :key="u.id" :label="u.nickname" :value="u.id" />
      </el-select>
      <el-select v-model="filters.type" placeholder="全部类型" clearable style="width: 130px" @change="load">
        <el-option v-for="(label, value) in CARE_TYPES" :key="value" :label="label" :value="value" />
      </el-select>
      <el-select v-model="filters.plant_id" placeholder="全部植物" clearable filterable style="width: 160px" @change="load">
        <el-option v-for="p in plants" :key="p.id" :label="p.name" :value="p.id" />
      </el-select>
      <el-date-picker
        v-model="dateRange"
        type="daterange"
        value-format="YYYY-MM-DD"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        style="width: 260px"
        @change="load"
      />
      <el-button @click="load">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
      <div class="spacer"></div>
      <el-button type="primary" @click="openDialog()">
        <el-icon><Plus /></el-icon>新增记录
      </el-button>
    </div>

    <!-- 列表 -->
    <el-card class="page-card">
      <el-table :data="records" v-loading="loading" stripe>
        <el-table-column label="用户" width="110">
          <template #default="{ row }">{{ row.user?.nickname || `#${row.user_id}` }}</template>
        </el-table-column>
        <el-table-column label="植物" min-width="120">
          <template #default="{ row }">{{ row.plant?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="类型" width="90">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type)" size="small">{{ CARE_TYPES[row.type] || row.type }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="日期" prop="care_date" width="110">
          <template #default="{ row }">{{ formatDate(row.care_date) }}</template>
        </el-table-column>
        <el-table-column label="时间" prop="care_time" width="90">
          <template #default="{ row }">{{ row.care_time || '-' }}</template>
        </el-table-column>
        <el-table-column label="用量" prop="amount" width="100">
          <template #default="{ row }">{{ row.amount || '-' }}</template>
        </el-table-column>
        <el-table-column label="备注" prop="note" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.note || '-' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button link type="primary" @click="openDialog(row)">编辑</el-button>
            <el-button link type="danger" @click="remove(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog v-model="dialogVisible" :title="form.id ? '编辑记录' : '新增记录'" width="480px">
      <el-form :model="form" label-width="80px">
        <el-form-item label="植物" required>
          <el-select v-model="form.plant_id" placeholder="选择植物" filterable style="width: 100%">
            <el-option v-for="p in plants" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="类型" required>
          <el-select v-model="form.type" placeholder="选择类型" style="width: 100%">
            <el-option v-for="(label, value) in CARE_TYPES" :key="value" :label="label" :value="value" />
          </el-select>
        </el-form-item>
        <el-form-item label="日期" required>
          <el-date-picker v-model="form.care_date" type="date" value-format="YYYY-MM-DD" style="width: 100%" />
        </el-form-item>
        <el-form-item label="时间">
          <el-time-picker v-model="form.care_time" format="HH:mm" value-format="HH:mm" placeholder="可选" style="width: 100%" />
        </el-form-item>
        <el-form-item label="用量">
          <el-input v-model="form.amount" placeholder="如：200ml" maxlength="50" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.note" type="textarea" :rows="3" maxlength="200" />
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
import { getCareRecords, createCareRecord, updateCareRecord, deleteCareRecord, getPlants, getUsers, CARE_TYPES } from '../api'

const loading = ref(false)
const saving = ref(false)
const records = ref([])
const plants = ref([])
const users = ref([])
const userFilter = ref('all')
const filters = ref({ type: null, plant_id: null })
const dateRange = ref(null)
const dialogVisible = ref(false)
const form = ref({})

const formatDate = (d) => {
  if (!d) return '-'
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('zh-CN')
}
const typeTag = (t) =>
  ({ water: 'primary', fertilize: 'success', prune: 'warning', pest: 'danger', soil: 'info', other: 'info' }[t] || 'info')

async function load() {
  loading.value = true
  try {
    const params = { user_id: userFilter.value }
    if (filters.value.type) params.type = filters.value.type
    if (filters.value.plant_id) params.plant_id = filters.value.plant_id
    if (dateRange.value?.[0]) params.start_date = dateRange.value[0]
    if (dateRange.value?.[1]) params.end_date = dateRange.value[1]
    records.value = (await getCareRecords(params)) || []
  } finally {
    loading.value = false
  }
}

function openDialog(row) {
  form.value = row
    ? {
        id: row.id,
        plant_id: row.plant_id,
        type: row.type,
        care_date: row.care_date ? String(row.care_date).slice(0, 10) : null,
        care_time: row.care_time || null,
        amount: row.amount || '',
        note: row.note || '',
      }
    : {
        plant_id: filters.value.plant_id || null,
        type: filters.value.type || null,
        care_date: new Date().toISOString().slice(0, 10),
        care_time: null,
        amount: '',
        note: '',
      }
  dialogVisible.value = true
}

async function save() {
  if (!form.value.plant_id) return ElMessage.warning('请选择植物')
  if (!form.value.type) return ElMessage.warning('请选择养护类型')
  if (!form.value.care_date) return ElMessage.warning('请选择日期')
  saving.value = true
  try {
    const payload = {
      plant_id: form.value.plant_id,
      type: form.value.type,
      care_date: form.value.care_date,
      care_time: form.value.care_time,
      amount: form.value.amount,
      note: form.value.note,
    }
    if (form.value.id) {
      await updateCareRecord(form.value.id, payload)
      ElMessage.success('更新成功')
    } else {
      await createCareRecord(payload)
      ElMessage.success('添加成功')
    }
    dialogVisible.value = false
    load()
  } finally {
    saving.value = false
  }
}

async function remove(row) {
  await ElMessageBox.confirm('确定删除这条养护记录吗？', '删除确认', { type: 'warning' })
  await deleteCareRecord(row.id)
  ElMessage.success('删除成功')
  load()
}

onMounted(async () => {
  users.value = (await getUsers()) || []
  plants.value = (await getPlants({ user_id: 'all' })) || []
  load()
})
</script>
