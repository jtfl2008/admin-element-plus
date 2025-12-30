<script setup lang="ts">
/**
 * 登录日志表格组件
 * @description 显示用户登录日志，支持分页和刷新
 */

import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { fetchLoginLog } from '@/service/api/profile'
import type { LoginLog, LoginLogQuery } from '@/typings/profile'

// 定义组件名称
defineOptions({
  name: 'LoginLogTable',
})

// 响应式数据
const loading = ref(false)
const logList = ref<LoginLog[]>([])
const total = ref(0)

// 查询参数
const queryParams = reactive<LoginLogQuery>({
  pageNum: 1,
  pageSize: 10,
})

/**
 * 加载登录日志
 */
async function loadData() {
  loading.value = true
  try {
    const { rows, total: totalCount } = await fetchLoginLog(queryParams)
    logList.value = rows
    total.value = totalCount
  } catch (error) {
    console.error('加载登录日志失败:', error)
    ElMessage.error('加载登录日志失败')
  } finally {
    loading.value = false
  }
}

/**
 * 刷新数据
 */
function handleRefresh() {
  queryParams.pageNum = 1
  loadData()
}

/**
 * 分页变化
 */
function handlePageChange(page: number) {
  queryParams.pageNum = page
  loadData()
}

/**
 * 每页条数变化
 */
function handleSizeChange(size: number) {
  queryParams.pageSize = size
  queryParams.pageNum = 1
  loadData()
}

// 组件挂载时加载数据
onMounted(() => {
  loadData()
})
</script>

<template>
  <div class="login-log-table">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>登录日志</span>
          <el-button
            :icon="Refresh"
            :loading="loading"
            @click="handleRefresh"
          >
            刷新
          </el-button>
        </div>
      </template>

      <el-table
        :data="logList"
        :loading="loading"
        border
        stripe
      >
        <el-table-column
          prop="loginTime"
          label="登录时间"
          width="180"
          sortable
        />

        <el-table-column
          prop="ipaddr"
          label="登录IP"
          width="140"
        />

        <el-table-column
          prop="loginLocation"
          label="登录地点"
          width="120"
        />

        <el-table-column
          prop="browser"
          label="浏览器"
          width="120"
        />

        <el-table-column
          prop="os"
          label="操作系统"
          width="120"
        />

        <el-table-column
          prop="status"
          label="状态"
          width="100"
        >
          <template #default="{ row }">
            <el-tag
              :type="row.status === '0' ? 'success' : 'danger'"
              size="small"
            >
              {{ row.status === '0' ? '成功' : '失败' }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column
          prop="msg"
          label="提示信息"
          min-width="150"
          show-overflow-tooltip
        />
      </el-table>

      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.login-log-table {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  :deep(.el-pagination) {
    margin-top: 20px;
    justify-content: flex-end;
  }

  // 响应式布局
  @media (max-width: 768px) {
    :deep(.el-table) {
      font-size: 12px;

      .el-table__cell {
        padding: 8px 0;
      }
    }

    :deep(.el-pagination) {
      justify-content: center;
      flex-wrap: wrap;
    }
  }
}
</style>
