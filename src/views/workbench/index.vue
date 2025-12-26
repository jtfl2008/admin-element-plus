<template>
  <div class="workbench-container">
    <!-- 加载状态 -->
    <div v-if="loading && !data" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 错误状态 -->
    <el-alert
      v-else-if="error"
      :title="error"
      type="error"
      show-icon
      :closable="false"
      class="error-alert"
    >
      <template #default>
        <el-button type="primary" size="small" @click="handleRefresh">
          重试
        </el-button>
      </template>
    </el-alert>

    <!-- 工作台内容 -->
    <div v-else class="workbench-content">
      <!-- 页面头部 - 刷新按钮 -->
      <div class="workbench-header">
        <div class="header-left">
          <h2>工作台</h2>
          <span v-if="workbenchStore.lastUpdate" class="last-update">
            最后更新: {{ formatTime(workbenchStore.lastUpdate) }}
          </span>
        </div>
        <div class="header-right">
          <el-switch
            v-model="workbenchStore.autoRefresh"
            active-text="自动刷新"
            @change="handleAutoRefreshChange"
          />
          <el-button
            :icon="loading ? 'Loading' : 'Refresh'"
            :loading="loading"
            @click="handleRefresh"
          >
            刷新
          </el-button>
        </div>
      </div>

      <!-- 数据卡片区域 -->
      <div class="data-cards-section">
        <el-row :gutter="16">
          <el-col :xs="24" :sm="12" :md="12" :lg="6">
            <data-card
              title="总用户数"
              :value="data?.statistics.totalUsers || 0"
              :icon="User"
              color="#1890ff"
              :trend="data?.trends.userTrend.change ? (data.trends.userTrend.change > 0 ? 'up' : 'down') : 'stable'"
              :trend-value="data?.trends.userTrend.changePercent"
              :compare-text="`较上期 ${data?.trends.userTrend.change || 0}`"
              :loading="loading"
              clickable
              @click="handleCardClick('users')"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6">
            <data-card
              title="活跃用户"
              :value="data?.statistics.activeUsers || 0"
              :icon="UserFilled"
              color="#52c41a"
              trend="up"
              :trend-value="data?.trends.userTrend.changePercent"
              compare-text="本周活跃"
              :loading="loading"
              clickable
              @click="handleCardClick('active-users')"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6">
            <data-card
              title="总订单数"
              :value="data?.statistics.totalOrders || 0"
              :icon="ShoppingCart"
              color="#faad14"
              :trend="data?.trends.orderTrend.change ? (data.trends.orderTrend.change > 0 ? 'up' : 'down') : 'stable'"
              :trend-value="data?.trends.orderTrend.changePercent"
              :compare-text="`较上期 ${data?.trends.orderTrend.change || 0}`"
              :loading="loading"
              clickable
              @click="handleCardClick('orders')"
            />
          </el-col>
          <el-col :xs="24" :sm="12" :md="12" :lg="6">
            <data-card
              title="总收入"
              :value="formatNumber(data?.statistics.revenue || 0)"
              unit="元"
              :icon="Money"
              color="#f5222d"
              :trend="data?.trends.revenueTrend.change ? (data.trends.revenueTrend.change > 0 ? 'up' : 'down') : 'stable'"
              :trend-value="data?.trends.revenueTrend.changePercent"
              :compare-text="`较上期 ¥${formatNumber(data?.trends.revenueTrend.change || 0)}`"
              :loading="loading"
              clickable
              @click="handleCardClick('revenue')"
            />
          </el-col>
        </el-row>
      </div>

      <!-- 快捷操作区域 -->
      <div class="quick-actions-section">
        <el-card shadow="hover">
          <template #header>
            <div class="section-header">
              <span>快捷操作</span>
            </div>
          </template>
          <quick-actions :actions="quickActions" :columns="6" />
        </el-card>
      </div>

      <!-- 图表和活动区域 -->
      <el-row :gutter="16" class="charts-activity-section">
        <el-col :xs="24" :sm="24" :md="16" :lg="16">
          <!-- 图表区域 -->
          <el-card shadow="hover" class="chart-card">
            <template #header>
              <div class="section-header">
                <span>数据统计</span>
              </div>
            </template>
            <chart-card
              title="访问趋势"
              chart-type="line"
              :data="chartData"
              :loading="loading"
              :height="300"
            />
          </el-card>
        </el-col>

        <el-col :xs="24" :sm="24" :md="8" :lg="8">
          <!-- 活动列表 -->
          <el-card shadow="hover" class="activity-card">
            <template #header>
              <div class="section-header">
                <span>最近活动</span>
              </div>
            </template>
            <activity-list
              :activities="data?.activities || []"
              :loading="loading"
              :max-items="10"
            />
          </el-card>

          <!-- 通知卡片 -->
          <el-card shadow="hover" class="notification-card">
            <template #header>
              <div class="section-header">
                <span>通知</span>
                <el-badge
                  v-if="workbenchStore.unreadNotificationCount > 0"
                  :value="workbenchStore.unreadNotificationCount"
                  class="notification-badge"
                />
              </div>
            </template>
            <notification-card
              :notifications="data?.notifications || []"
              :loading="loading"
              :max-items="10"
              @read="handleNotificationRead"
              @click="handleNotificationClick"
              @mark-all-read="handleMarkAllRead"
            />
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { 
  User, 
  UserFilled, 
  ShoppingCart, 
  Money,
  Plus,
  Document,
  Setting,
  DataAnalysis,
  Files
} from '@element-plus/icons-vue'
import { useWorkbenchStore } from '@/stores/modules/workbench'
import DataCard from './components/data-card.vue'
import QuickActions from './components/quick-actions.vue'
import ChartCard from './components/chart-card.vue'
import ActivityList from './components/activity-list.vue'
import NotificationCard from './components/notification-card.vue'
import type { QuickAction, ChartData } from '@/typings/workbench'

// 使用工作台 Store
const workbenchStore = useWorkbenchStore()

// 计算属性
const loading = computed(() => workbenchStore.loading)
const error = computed(() => workbenchStore.error)
const data = computed(() => workbenchStore.data)

// 快捷操作配置
const quickActions = computed<QuickAction[]>(() => [
  {
    id: 'create-order',
    title: '创建订单',
    description: '快速创建新订单',
    icon: Plus,
    color: '#1890ff',
    route: '/orders/create',
  },
  {
    id: 'user-management',
    title: '用户管理',
    description: '管理系统用户',
    icon: User,
    color: '#52c41a',
    route: '/users',
  },
  {
    id: 'reports',
    title: '数据报表',
    description: '查看统计报表',
    icon: DataAnalysis,
    color: '#faad14',
    route: '/reports',
  },
  {
    id: 'documents',
    title: '文档中心',
    description: '查看系统文档',
    icon: Document,
    color: '#722ed1',
    route: '/documents',
  },
  {
    id: 'files',
    title: '文件管理',
    description: '管理上传文件',
    icon: Files,
    color: '#13c2c2',
    route: '/files',
  },
  {
    id: 'settings',
    title: '系统设置',
    description: '配置系统参数',
    icon: Setting,
    color: '#f5222d',
    route: '/settings',
  },
])

// 图表数据
const chartData = computed<ChartData>(() => ({
  labels: ['周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  datasets: [
    {
      name: '访问量',
      data: [120, 200, 150, 80, 70, 110, 130],
      color: '#1890ff',
    },
    {
      name: '订单量',
      data: [60, 100, 80, 50, 40, 60, 70],
      color: '#52c41a',
    },
  ],
}))

// 页面加载时的初始化逻辑
onMounted(async () => {
  console.log('工作台页面已加载')
  
  // 获取工作台数据
  await workbenchStore.fetchData()
  
  // 如果启用了自动刷新，启动定时器
  if (workbenchStore.autoRefresh) {
    workbenchStore.startAutoRefresh()
  }
})

// 页面卸载时清理资源
onUnmounted(() => {
  workbenchStore.cleanup()
})

// 手动刷新数据
const handleRefresh = async () => {
  await workbenchStore.refreshData()
}

// 处理自动刷新开关变化
const handleAutoRefreshChange = (value: string | number | boolean) => {
  const enabled = Boolean(value)
  if (enabled) {
    workbenchStore.startAutoRefresh()
  } else {
    workbenchStore.stopAutoRefresh()
  }
}

// 处理卡片点击
const handleCardClick = (type: string) => {
  ElMessage.info(`点击了 ${type} 卡片`)
  // TODO: 根据类型跳转到对应的详情页面
}

// 处理通知已读
const handleNotificationRead = (id: string) => {
  workbenchStore.markNotificationAsRead(id)
}

// 处理通知点击
const handleNotificationClick = (notification: any) => {
  ElMessage.info(`点击了通知: ${notification.title}`)
  // TODO: 根据通知类型执行相应操作
}

// 处理全部标记为已读
const handleMarkAllRead = () => {
  workbenchStore.markAllNotificationsAsRead()
  ElMessage.success('已全部标记为已读')
}

// 格式化时间
const formatTime = (date: Date | string) => {
  // 确保 date 是 Date 对象
  const dateObj = date instanceof Date ? date : new Date(date)
  
  const now = new Date()
  const diff = now.getTime() - dateObj.getTime()
  
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes} 分钟前`
  if (hours < 24) return `${hours} 小时前`
  if (days < 7) return `${days} 天前`
  
  return dateObj.toLocaleDateString('zh-CN')
}

// 格式化数字
const formatNumber = (num: number) => {
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}
</script>

<style scoped lang="scss">
.workbench-container {
  padding: var(--spacing-md, 16px);
  background-color: var(--color-bg-1, #f5f5f5);
  min-height: calc(100vh - 120px);
}

.loading-container {
  padding: var(--spacing-lg, 24px);
  background: var(--color-bg-2, #ffffff);
  border-radius: var(--radius-md, 8px);
}

.error-alert {
  margin-bottom: var(--spacing-lg, 24px);
}

.workbench-content {
  max-width: 1600px;
  margin: 0 auto;
}

.workbench-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: var(--spacing-lg, 24px);
  padding: var(--spacing-md, 16px);
  background: var(--color-bg-2, #ffffff);
  border-radius: var(--radius-md, 8px);
  box-shadow: var(--shadow-sm, 0 2px 8px rgba(0, 0, 0, 0.1));

  .header-left {
    display: flex;
    align-items: center;
    gap: var(--spacing-md, 16px);

    h2 {
      margin: 0;
      font-size: 20px;
      font-weight: 600;
    }

    .last-update {
      font-size: 14px;
      color: var(--color-text-3, #999);
    }
  }

  .header-right {
    display: flex;
    align-items: center;
    gap: var(--spacing-md, 16px);
  }
}

.data-cards-section {
  margin-bottom: var(--spacing-lg, 24px);
}

.quick-actions-section {
  margin-bottom: var(--spacing-lg, 24px);
}

.charts-activity-section {
  margin-bottom: var(--spacing-lg, 24px);
}

.chart-card,
.activity-card,
.notification-card {
  margin-bottom: var(--spacing-md, 16px);
}



.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
  font-size: 16px;

  .notification-badge {
    margin-left: var(--spacing-sm, 8px);
  }
}

// 响应式布局
@media (max-width: 768px) {
  .workbench-container {
    padding: var(--spacing-sm, 12px);
  }

  .workbench-header {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm, 12px);

    .header-left {
      flex-direction: column;
      align-items: flex-start;
      gap: var(--spacing-xs, 4px);
    }

    .header-right {
      width: 100%;

      button {
        flex: 1;
      }
    }
  }


}
</style>
