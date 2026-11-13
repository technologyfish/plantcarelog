<template>
  <div>
    <!-- 统计卡片 -->
    <el-row :gutter="16">
      <el-col :span="6" v-for="card in cards" :key="card.label">
        <el-card class="stat-card">
          <div class="stat">
            <div class="stat-icon" :style="{ background: card.color }">
              <el-icon :size="28" color="#fff"><component :is="card.icon" /></el-icon>
            </div>
            <div class="stat-text">
              <div class="stat-value">{{ card.value }}</div>
              <div class="stat-label">{{ card.label }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近养护记录 -->
    <el-card class="page-card" style="margin-top: 16px">
      <template #header>最近养护记录（全站）</template>
      <el-table :data="recentRecords" v-loading="loading" stripe>
        <el-table-column label="用户" width="110">
          <template #default="{ row }">{{ row.user?.nickname || `#${row.user_id}` }}</template>
        </el-table-column>
        <el-table-column label="植物" prop="plant.name" min-width="110">
          <template #default="{ row }">{{ row.plant?.name || '-' }}</template>
        </el-table-column>
        <el-table-column label="类型" width="100">
          <template #default="{ row }">
            <el-tag :type="typeTag(row.type)" size="small">{{ typeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="日期" prop="care_date" width="120">
          <template #default="{ row }">{{ formatDate(row.care_date) }}</template>
        </el-table-column>
        <el-table-column label="用量" prop="amount" width="100">
          <template #default="{ row }">{{ row.amount || '-' }}</template>
        </el-table-column>
        <el-table-column label="备注" prop="note" min-width="180" show-overflow-tooltip>
          <template #default="{ row }">{{ row.note || '-' }}</template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getUsers, getPlants, getCareRecords, CARE_TYPES } from '../api'

const loading = ref(false)
const users = ref([])
const plants = ref([])
const allRecords = ref([])
const recentRecords = ref([])

const cards = computed(() => {
  const today = new Date().toISOString().slice(0, 10)
  const todayCare = allRecords.value.filter((r) => String(r.care_date).slice(0, 10) === today).length
  return [
    { label: '用户总数', value: users.value.length, icon: 'UserFilled', color: '#9b59b6' },
    { label: '植物总数', value: plants.value.length, icon: 'Cherry', color: '#409eff' },
    { label: '今日养护', value: todayCare, icon: 'Sunny', color: '#e6a23c' },
    { label: '累计养护次数', value: allRecords.value.length, icon: 'Calendar', color: '#67c23a' },
  ]
})

const typeText = (t) => CARE_TYPES[t] || t
const typeTag = (t) =>
  ({ water: 'primary', fertilize: 'success', prune: 'warning', pest: 'danger', soil: 'info', other: 'info' }[t] || 'info')
const formatDate = (d) => {
  if (!d) return '-'
  const dt = new Date(d)
  return isNaN(dt.getTime()) ? d : dt.toLocaleDateString('zh-CN')
}

onMounted(async () => {
  loading.value = true
  try {
    const [userList, plantList, records] = await Promise.all([
      getUsers(),
      getPlants({ user_id: 'all' }),
      getCareRecords({ user_id: 'all' }),
    ])
    users.value = userList || []
    plants.value = plantList || []
    allRecords.value = records || []
    recentRecords.value = allRecords.value.slice(0, 10)
  } finally {
    loading.value = false
  }
})
</script>

<style scoped>
.stat {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
}

.stat-label {
  font-size: 13px;
  color: #909399;
}
</style>
