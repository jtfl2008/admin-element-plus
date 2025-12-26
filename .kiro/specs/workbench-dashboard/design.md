# 设计文档 - 工作台

## 概述

工作台是一个基于 Vue 3 + TypeScript + Element Plus 的可配置仪表板系统。采用组件化架构，支持响应式布局、主题切换和个性化配置。系统使用 Pinia 进行状态管理，ECharts 进行数据可视化，grid-layout 实现拖拽布局。

## 架构

### 整体架构

```
工作台页面 (Workbench View)
├── 布局容器 (Layout Container)
│   ├── 数据卡片区域 (Data Cards Section)
│   ├── 快捷操作区域 (Quick Actions Section)
│   ├── 图表区域 (Charts Section)
│   └── 活动通知区域 (Activity Section)
├── 状态管理 (Pinia Store)
│   ├── 工作台数据状态
│   ├── 布局配置状态
│   └── 刷新控制状态
└── 数据服务层 (API Service)
    ├── 统计数据接口
    ├── 活动记录接口
    └── 通知接口
```

### 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **图表库**: ECharts / Apache ECharts
- **布局**: vue-grid-layout (可拖拽网格布局)
- **HTTP 客户端**: Axios
- **样式**: SCSS

## 组件和接口

### 1. 工作台主页面组件

**文件**: `src/views/workbench/index.vue`

```typescript
interface WorkbenchProps {
  // 无外部 props，使用内部状态管理
}

interface WorkbenchState {
  loading: boolean
  refreshing: boolean
  layoutConfig: LayoutConfig
}
```

**职责**:
- 协调各子组件
- 管理整体布局
- 处理数据刷新逻辑
- 响应式布局控制

### 2. 数据卡片组件

**文件**: `src/views/workbench/components/data-card.vue`

```typescript
interface DataCardProps {
  title: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'stable'
  trendValue?: number
  compareText?: string
  icon?: string
  color?: string
  loading?: boolean
  clickable?: boolean
}

interface DataCardEmits {
  (e: 'click'): void
}
```

**职责**:
- 展示单一数据指标
- 显示趋势和对比信息
- 处理点击事件
- 支持加载和错误状态

### 3. 快捷操作组件

**文件**: `src/views/workbench/components/quick-actions.vue`

```typescript
interface QuickAction {
  id: string
  title: string
  description: string
  icon: string
  color: string
  route?: string
  action?: () => void
  permission?: string
}

interface QuickActionsProps {
  actions: QuickAction[]
  columns?: number
}
```

**职责**:
- 展示快捷操作列表
- 处理权限控制
- 执行操作或路由跳转
- 响应式列数调整

### 4. 统计图表组件

**文件**: `src/views/workbench/components/chart-card.vue`

```typescript
interface ChartCardProps {
  title: string
  chartType: 'line' | 'bar' | 'pie' | 'area'
  data: ChartData
  loading?: boolean
  height?: number
  showTimeFilter?: boolean
}

interface ChartData {
  labels: string[]
  datasets: {
    name: string
    data: number[]
    color?: string
  }[]
}

interface TimeRange {
  type: 'today' | 'week' | 'month' | 'custom'
  start?: Date
  end?: Date
}
```

**职责**:
- 渲染 ECharts 图表
- 处理时间范围筛选
- 响应主题变化
- 自适应容器尺寸

### 5. 活动列表组件

**文件**: `src/views/workbench/components/activity-list.vue`

```typescript
interface Activity {
  id: string
  type: 'create' | 'update' | 'delete' | 'login' | 'other'
  content: string
  user: string
  timestamp: Date
  icon?: string
  color?: string
}

interface ActivityListProps {
  activities: Activity[]
  loading?: boolean
  maxItems?: number
}
```

**职责**:
- 展示活动记录列表
- 格式化时间显示
- 支持分页或滚动加载
- 显示活动类型图标

### 6. 通知卡片组件

**文件**: `src/views/workbench/components/notification-card.vue`

```typescript
interface Notification {
  id: string
  title: string
  content: string
  type: 'important' | 'normal' | 'info'
  read: boolean
  timestamp: Date
  link?: string
}

interface NotificationCardProps {
  notifications: Notification[]
  maxItems?: number
}

interface NotificationCardEmits {
  (e: 'read', id: string): void
  (e: 'click', notification: Notification): void
}
```

**职责**:
- 展示通知列表
- 标记已读/未读
- 处理通知点击
- 按优先级排序

### 7. 布局配置组件

**文件**: `src/views/workbench/components/layout-config.vue`

```typescript
interface LayoutItem {
  id: string
  component: string
  x: number
  y: number
  w: number
  h: number
  visible: boolean
  minW?: number
  minH?: number
}

interface LayoutConfig {
  items: LayoutItem[]
  cols: { lg: number; md: number; sm: number; xs: number }
  rowHeight: number
}
```

**职责**:
- 管理布局配置
- 处理拖拽逻辑
- 保存/恢复配置
- 提供配置面板

## 数据模型

### 工作台数据模型

```typescript
interface WorkbenchData {
  statistics: {
    totalUsers: number
    activeUsers: number
    totalOrders: number
    revenue: number
  }
  trends: {
    userTrend: TrendData
    orderTrend: TrendData
    revenueTrend: TrendData
  }
  activities: Activity[]
  notifications: Notification[]
}

interface TrendData {
  current: number
  previous: number
  change: number
  changePercent: number
}
```

### Pinia Store 模型

```typescript
// src/stores/modules/workbench.ts
interface WorkbenchState {
  data: WorkbenchData | null
  layoutConfig: LayoutConfig
  loading: boolean
  error: string | null
  lastUpdate: Date | null
  autoRefresh: boolean
  refreshInterval: number
}

interface WorkbenchActions {
  fetchData(): Promise<void>
  refreshData(): Promise<void>
  updateLayoutConfig(config: LayoutConfig): void
  resetLayout(): void
  toggleAutoRefresh(): void
  setRefreshInterval(interval: number): void
}

interface WorkbenchGetters {
  isDataStale: (state: WorkbenchState) => boolean
  visibleComponents: (state: WorkbenchState) => LayoutItem[]
  hasUnreadNotifications: (state: WorkbenchState) => boolean
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1：数据卡片加载状态一致性

*对于任意*工作台页面加载，所有数据卡片应该在 2 秒内显示数据或加载状态，不应出现空白卡片。

**验证需求：需求 1.2**

### 属性 2：快捷操作权限过滤

*对于任意*用户权限配置，工作台显示的快捷操作列表应该只包含用户有权限访问的操作项。

**验证需求：需求 2.5**

### 属性 3：图表响应式布局

*对于任意*屏幕尺寸变化，图表组件应该自动调整尺寸并重新渲染，保持数据可读性。

**验证需求：需求 3.6**

### 属性 4：布局配置持久化

*对于任意*布局配置修改，刷新页面后应该恢复用户最后保存的布局配置。

**验证需求：需求 5.4**

### 属性 5：主题切换一致性

*对于任意*主题切换操作，工作台所有组件（包括图表）应该立即应用新主题，不应出现样式不一致。

**验证需求：需求 10.2, 10.3**

### 属性 6：数据刷新幂等性

*对于任意*工作台数据状态，连续两次刷新操作应该产生相同的数据结果（假设后端数据未变化）。

**验证需求：需求 7.3**

### 属性 7：错误重试恢复

*对于任意*数据加载失败场景，点击重试后成功加载，组件应该从错误状态正确恢复到正常显示状态。

**验证需求：需求 9.3**

### 属性 8：响应式列数适配

*对于任意*屏幕宽度，工作台布局应该使用正确的列数：桌面端（≥1200px）多列，平板端（768-1199px）双列，移动端（<768px）单列。

**验证需求：需求 6.1, 6.2, 6.3**

### 属性 9：通知已读状态同步

*对于任意*通知项，标记为已读后，该通知在所有显示位置（工作台、通知中心）的已读状态应该保持一致。

**验证需求：需求 4.5**

### 属性 10：组件可见性控制

*对于任意*布局配置，设置为不可见的组件不应该渲染到 DOM 中，也不应该发起数据请求。

**验证需求：需求 5.2**

## 错误处理

### 1. 网络错误

- **场景**: API 请求失败
- **处理**: 
  - 显示错误提示组件
  - 提供重试按钮
  - 保留上次成功的数据（如果有）
  - 记录错误日志

### 2. 数据格式错误

- **场景**: 后端返回数据格式不符合预期
- **处理**:
  - 使用类型守卫验证数据
  - 提供默认值或降级显示
  - 在控制台输出警告
  - 上报错误到监控系统

### 3. 权限错误

- **场景**: 用户无权限访问某些数据或功能
- **处理**:
  - 隐藏无权限的组件
  - 显示权限不足提示
  - 提供联系管理员入口

### 4. 图表渲染错误

- **场景**: ECharts 初始化或渲染失败
- **处理**:
  - 捕获渲染异常
  - 显示降级的表格视图
  - 提供刷新选项

### 5. 布局配置错误

- **场景**: 本地存储的布局配置损坏
- **处理**:
  - 验证配置完整性
  - 自动恢复默认布局
  - 提示用户配置已重置

## 测试策略

### 单元测试

使用 Vitest 进行组件单元测试：

1. **数据卡片组件测试**
   - 测试不同 props 的渲染结果
   - 测试趋势指示器显示逻辑
   - 测试点击事件触发
   - 测试加载和错误状态

2. **快捷操作组件测试**
   - 测试权限过滤逻辑
   - 测试路由跳转
   - 测试自定义操作执行

3. **图表组件测试**
   - 测试不同图表类型渲染
   - 测试时间范围筛选
   - 测试主题切换
   - 测试响应式调整

4. **Store 测试**
   - 测试数据获取和更新
   - 测试布局配置保存和恢复
   - 测试自动刷新逻辑
   - 测试 getters 计算逻辑

### 属性测试

使用 fast-check 进行属性测试（每个测试至少 100 次迭代）：

1. **属性 1 测试**: 生成随机加载状态，验证所有卡片都有明确状态
   - **Feature: workbench-dashboard, Property 1**: 数据卡片加载状态一致性

2. **属性 2 测试**: 生成随机权限配置，验证快捷操作过滤正确
   - **Feature: workbench-dashboard, Property 2**: 快捷操作权限过滤

3. **属性 3 测试**: 生成随机屏幕尺寸，验证图表响应式调整
   - **Feature: workbench-dashboard, Property 3**: 图表响应式布局

4. **属性 4 测试**: 生成随机布局配置，验证持久化和恢复
   - **Feature: workbench-dashboard, Property 4**: 布局配置持久化

5. **属性 5 测试**: 生成随机主题切换序列，验证样式一致性
   - **Feature: workbench-dashboard, Property 5**: 主题切换一致性

6. **属性 6 测试**: 生成随机数据状态，验证刷新幂等性
   - **Feature: workbench-dashboard, Property 6**: 数据刷新幂等性

7. **属性 7 测试**: 生成随机错误场景，验证重试恢复
   - **Feature: workbench-dashboard, Property 7**: 错误重试恢复

8. **属性 8 测试**: 生成随机屏幕宽度，验证列数适配
   - **Feature: workbench-dashboard, Property 8**: 响应式列数适配

9. **属性 9 测试**: 生成随机通知操作序列，验证状态同步
   - **Feature: workbench-dashboard, Property 9**: 通知已读状态同步

10. **属性 10 测试**: 生成随机可见性配置，验证组件渲染控制
    - **Feature: workbench-dashboard, Property 10**: 组件可见性控制

### 集成测试

1. **完整工作流测试**
   - 测试页面加载到数据展示的完整流程
   - 测试用户交互（点击、拖拽、筛选）
   - 测试数据刷新流程

2. **跨组件交互测试**
   - 测试布局配置对所有组件的影响
   - 测试主题切换对所有组件的影响
   - 测试权限变化对组件显示的影响

### 端到端测试

使用 Playwright 或 Cypress：

1. 测试用户登录后进入工作台
2. 测试数据卡片点击跳转
3. 测试快捷操作执行
4. 测试图表交互和筛选
5. 测试布局拖拽和保存
6. 测试响应式布局切换

### 性能测试

1. **首屏加载时间**: 确保 3 秒内完成
2. **数据刷新性能**: 测试大数据量下的刷新速度
3. **图表渲染性能**: 测试复杂图表的渲染时间
4. **内存泄漏检测**: 长时间运行和频繁刷新场景

### 测试覆盖率目标

- 语句覆盖率: ≥ 80%
- 分支覆盖率: ≥ 75%
- 函数覆盖率: ≥ 85%
- 行覆盖率: ≥ 80%
