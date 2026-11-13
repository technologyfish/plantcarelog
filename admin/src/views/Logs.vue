<template>
  <div>
    <div class="toolbar">
      <el-select v-model="userFilter" placeholder="全部用户" style="width: 150px" @change="load">
        <el-option label="全部用户" value="all" />
        <el-option v-for="u in users" :key="u.id" :label="u.nickname" :value="u.id" />
      </el-select>
      <el-select v-model="type" placeholder="全部类型" clearable style="width: 140px" @change="load">
        <el-option v-for="(label, value) in CARE_TYPES" :key="value" :label="label" :value="value" />
      </el-select>
      <el-button @click="load">
        <el-icon><Refresh /></el-icon>刷新
      </el-button>
    </div>

    <el-card>
      <template v-for="(items, month) in grouped" :key="month">
        <div class="month-title">{{ month }}</div>
        <el-timeline style="padding-left: 8px; margin-bottom: 24px">
          <el-timeline-item
            v-for="log in items"
            :key="log.id"
            :timestamp="`${log.date} ${log.time || ''}`"
            :type="timelineType(log.type)"
          >
            <span class="plant-name">{{ log.plantName }}</span>
            <el-tag size="small" style="margin: 0 8px">{{ CARE_TYPES[log.type] || log.type }}</el-tag>
            <span v-if="log.amount">用量：{{ log.amount }}　</span>
            <span style="color: #909399">{{ log.note || '' }}</span>
          </el-timeline-item>
        </el-timeline>
      </template>
      <el-empty v-if="!loading && !Object.keys(grouped).length" description="暂无养护日志" />
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getLogs, getUsers, CARE_TYPES } from '../api'

const loading = ref(false)
const logs = ref([])
const users = ref([])
const type = ref(null)
const userFilter = ref('all')

const grouped = computed(() => {
  const map = {}
  for (const log of logs.value) {
    const month = log.month || '未知时间'
    ;(map[month] ||= []).push(log)
  }
  return map
})

const timelineType = (t) =>
  ({ water: 'primary', fertilize: 'success', prune: 'warning', pest: 'danger', soil: 'info', other: 'info' }[t] || 'info')

async function load() {
  loading.value = true
  try {
    const params = { user_id: userFilter.value }
    if (type.value) params.type = type.value
    logs.value = (await getLogs(params)) || []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  users.value = (await getUsers()) || []
  load()
})
</script>

<style scoped>
.month-title {
  font-weight: 600;
  font-size: 15px;
  margin: 8px 0 16px;
  color: #2d6a4f;
}

.plant-name {
  font-weight: 600;
}
</style>
