# 性能优化规范

## 性能优化原则

### 优化优先级
1. **首次加载性能**: 减少首屏加载时间
2. **运行时性能**: 提升交互响应速度
3. **内存使用**: 避免内存泄漏
4. **网络请求**: 减少请求次数和大小

## 代码层面优化

### 1. 组件懒加载

#### 路由懒加载
```typescript
// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/user',
      name: 'User',
      // 使用动态导入实现懒加载
      component: () => import('@/views/system/user/index.vue')
    },
    {
      path: '/role',
      name: 'Role',
      component: () => import('@/views/system/role/index.vue')
    }
  ]
});

export default router;
```

#### 组件懒加载
```vue
<script setup lang="ts">
import { defineAsyncComponent } from 'vue';

// 异步组件
const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/HeavyComponent.vue')
);

// 带加载状态的异步组件
const AsyncComponent = defineAsyncComponent({
  loader: () => import('@/components/AsyncComponent.vue'),
  loadingComponent: LoadingComponent,
  errorComponent: ErrorComponent,
  delay: 200,
  timeout: 3000
});
</script>

<template>
  <HeavyComponent v-if="showHeavy" />
  <AsyncComponent />
</template>
```

### 2. 条件渲染优化

#### v-if vs v-show
```vue
<template>
  <!-- 频繁切换使用 v-show -->
  <div v-show="isVisible">
    频繁切换的内容
  </div>
  
  <!-- 条件渲染使用 v-if -->
  <div v-if="hasPermission">
    权限控制的内容
  </div>
  
  <!-- 初始不渲染使用 v-if -->
  <HeavyComponent v-if="shouldLoad" />
</template>
```

### 3. 列表渲染优化

#### 使用 key
```vue
<template>
  <!-- ✅ 使用唯一 key -->
  <div v-for="item in list" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- ❌ 避免使用 index 作为 key -->
  <div v-for="(item, index) in list" :key="index">
    {{ item.name }}
  </div>
</template>
```

#### 虚拟滚动
```vue
<script setup lang="ts">
import { ref } from 'vue';

// 大数据列表使用虚拟滚动
const largeList = ref(Array.from({ length: 10000 }, (_, i) => ({
  id: i,
  name: `Item ${i}`
})));
</script>

<template>
  <!-- 使用 Element Plus 的虚拟表格 -->
  <el-table-v2
    :columns="columns"
    :data="largeList"
    :width="700"
    :height="400"
    fixed
  />
</template>
```

### 4. 计算属性优化

#### 使用计算属性缓存
```vue
<script setup lang="ts">
import { ref, computed } from 'vue';

const list = ref<Item[]>([]);

// ✅ 使用计算属性，自动缓存
const filteredList = computed(() => {
  return list.value.filter(item => item.status === 'active');
});

// ❌ 避免在模板中使用方法
function filterList() {
  return list.value.filter(item => item.status === 'active');
}
</script>

<template>
  <!-- ✅ 使用计算属性 -->
  <div v-for="item in filteredList" :key="item.id">
    {{ item.name }}
  </div>
  
  <!-- ❌ 避免在模板中调用方法 -->
  <div v-for="item in filterList()" :key="item.id">
    {{ item.name }}
  </div>
</template>
```

### 5. 事件处理优化

#### 事件委托
```vue
<script setup lang="ts">
function handleClick(event: Event) {
  const target = event.target as HTMLElement;
  const id = target.dataset.id;
  
  if (id) {
    console.log('Clicked item:', id);
  }
}
</script>

<template>
  <!-- ✅ 使用事件委托 -->
  <div @click="handleClick">
    <div v-for="item in list" :key="item.id" :data-id="item.id">
      {{ item.name }}
    </div>
  </div>
  
  <!-- ❌ 避免为每个元素绑定事件 -->
  <div v-for="item in list" :key="item.id" @click="() => handleItemClick(item.id)">
    {{ item.name }}
  </div>
</template>
```

#### 防抖和节流
```typescript
// src/utils/performance.ts
import { debounce, throttle } from 'lodash-es';

/**
 * 防抖函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function useDebounce<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
) {
  return debounce(fn, delay);
}

/**
 * 节流函数
 * @param fn 要执行的函数
 * @param delay 延迟时间（毫秒）
 */
export function useThrottle<T extends (...args: any[]) => any>(
  fn: T,
  delay = 300
) {
  return throttle(fn, delay);
}
```

```vue
<script setup lang="ts">
import { useDebounce, useThrottle } from '@/utils/performance';

// 搜索输入防抖
const handleSearch = useDebounce((keyword: string) => {
  console.log('搜索:', keyword);
}, 500);

// 滚动事件节流
const handleScroll = useThrottle(() => {
  console.log('滚动位置:', window.scrollY);
}, 200);
</script>

<template>
  <el-input @input="handleSearch" placeholder="搜索" />
  <div @scroll="handleScroll">滚动内容</div>
</template>
```

### 6. 组件缓存

#### keep-alive
```vue
<template>
  <router-view v-slot="{ Component }">
    <keep-alive :include="cachedViews" :max="10">
      <component :is="Component" :key="$route.fullPath" />
    </keep-alive>
  </router-view>
</template>

<script setup lang="ts">
import { ref } from 'vue';

// 需要缓存的组件名称列表
const cachedViews = ref(['UserList', 'RoleList']);
</script>
```

### 7. 图片优化

#### 图片懒加载
```vue
<template>
  <!-- 使用 Element Plus 的图片懒加载 -->
  <el-image
    v-for="url in imageList"
    :key="url"
    :src="url"
    lazy
    fit="cover"
  />
</template>
```

#### 响应式图片
```vue
<template>
  <picture>
    <source
      media="(max-width: 768px)"
      srcset="image-mobile.jpg"
    />
    <source
      media="(max-width: 1200px)"
      srcset="image-tablet.jpg"
    />
    <img src="image-desktop.jpg" alt="响应式图片" />
  </picture>
</template>
```

## 构建优化

### 1. 代码分割

#### Vite 配置
```typescript
// vite.config.ts
import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // 手动分包
        manualChunks: {
          // Vue 核心库
          vue: ['vue', 'vue-router', 'pinia'],
          
          // Element Plus
          'element-plus': ['element-plus'],
          
          // 工具库
          utils: ['lodash-es', 'dayjs', 'axios'],
          
          // 图表库
          echarts: ['echarts']
        }
      }
    },
    
    // 代码分割阈值
    chunkSizeWarningLimit: 1000
  }
});
```

### 2. 资源压缩

#### Gzip 压缩
```typescript
// vite.config.ts
import viteCompression from 'vite-plugin-compression';

export default defineConfig({
  plugins: [
    viteCompression({
      verbose: true,
      disable: false,
      threshold: 10240, // 大于 10KB 的文件进行压缩
      algorithm: 'gzip',
      ext: '.gz'
    })
  ]
});
```

### 3. Tree Shaking

#### 按需导入
```typescript
// ✅ 按需导入
import { ElMessage, ElMessageBox } from 'element-plus';

// ❌ 避免全量导入
import ElementPlus from 'element-plus';
```

#### 配置自动导入
```typescript
// vite.config.ts
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    AutoImport({
      resolvers: [ElementPlusResolver()]
    }),
    Components({
      resolvers: [ElementPlusResolver()]
    })
  ]
});
```

## 网络优化

### 1. 请求优化

#### 请求合并
```typescript
// src/utils/request-batch.ts
class RequestBatcher {
  private queue: Map<string, Promise<any>> = new Map();
  
  /**
   * 批量请求
   * @param key 请求唯一标识
   * @param fn 请求函数
   */
  async batch<T>(key: string, fn: () => Promise<T>): Promise<T> {
    // 如果已有相同请求在进行中，返回该请求
    if (this.queue.has(key)) {
      return this.queue.get(key);
    }
    
    // 创建新请求
    const promise = fn().finally(() => {
      this.queue.delete(key);
    });
    
    this.queue.set(key, promise);
    return promise;
  }
}

export const requestBatcher = new RequestBatcher();
```

```typescript
// 使用示例
import { requestBatcher } from '@/utils/request-batch';

async function fetchUserInfo(userId: number) {
  return requestBatcher.batch(
    `user-${userId}`,
    () => api.getUserInfo(userId)
  );
}
```

#### 请求缓存
```typescript
// src/utils/request-cache.ts
class RequestCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  private ttl = 5 * 60 * 1000; // 5分钟
  
  /**
   * 获取缓存数据
   * @param key 缓存键
   */
  get(key: string) {
    const item = this.cache.get(key);
    
    if (!item) return null;
    
    // 检查是否过期
    if (Date.now() - item.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  /**
   * 设置缓存数据
   * @param key 缓存键
   * @param data 数据
   */
  set(key: string, data: any) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  /**
   * 清除缓存
   * @param key 缓存键，不传则清除所有
   */
  clear(key?: string) {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }
}

export const requestCache = new RequestCache();
```

### 2. 资源预加载

#### Prefetch 和 Preload
```vue
<template>
  <head>
    <!-- 预加载关键资源 -->
    <link rel="preload" href="/fonts/main.woff2" as="font" type="font/woff2" crossorigin />
    
    <!-- 预获取可能需要的资源 -->
    <link rel="prefetch" href="/images/banner.jpg" />
  </head>
</template>
```

## 内存优化

### 1. 避免内存泄漏

#### 清理定时器
```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

let timer: number | null = null;

onMounted(() => {
  timer = setInterval(() => {
    console.log('定时任务');
  }, 1000);
});

onUnmounted(() => {
  // 清理定时器
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>
```

#### 清理事件监听
```vue
<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue';

function handleResize() {
  console.log('窗口大小变化');
}

onMounted(() => {
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // 清理事件监听
  window.removeEventListener('resize', handleResize);
});
</script>
```

#### 清理 DOM 引用
```vue
<script setup lang="ts">
import { ref, onUnmounted } from 'vue';

const chartRef = ref<HTMLElement | null>(null);
let chartInstance: any = null;

function initChart() {
  if (chartRef.value) {
    chartInstance = echarts.init(chartRef.value);
  }
}

onUnmounted(() => {
  // 销毁图表实例
  if (chartInstance) {
    chartInstance.dispose();
    chartInstance = null;
  }
});
</script>
```

### 2. 大数据处理

#### 分页加载
```vue
<script setup lang="ts">
import { ref } from 'vue';

const list = ref<Item[]>([]);
const pageNum = ref(1);
const pageSize = ref(20);
const total = ref(0);
const loading = ref(false);

async function loadMore() {
  if (loading.value || list.value.length >= total.value) return;
  
  loading.value = true;
  try {
    const { rows, total: totalCount } = await fetchList({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    
    list.value.push(...rows);
    total.value = totalCount;
    pageNum.value++;
  } finally {
    loading.value = false;
  }
}
</script>
```

#### 数据分片处理
```typescript
/**
 * 分片处理大数据
 * @param data 数据数组
 * @param chunkSize 每片大小
 * @param processor 处理函数
 */
async function processInChunks<T>(
  data: T[],
  chunkSize: number,
  processor: (chunk: T[]) => void | Promise<void>
) {
  for (let i = 0; i < data.length; i += chunkSize) {
    const chunk = data.slice(i, i + chunkSize);
    await processor(chunk);
    
    // 让出主线程，避免阻塞
    await new Promise(resolve => setTimeout(resolve, 0));
  }
}

// 使用示例
await processInChunks(largeArray, 100, async (chunk) => {
  // 处理每一片数据
  await processChunk(chunk);
});
```

## 性能监控

### 1. 性能指标

#### 关键性能指标
```typescript
// src/utils/performance-monitor.ts

/**
 * 获取页面性能指标
 */
export function getPerformanceMetrics() {
  const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  
  return {
    // DNS 查询时间
    dns: navigation.domainLookupEnd - navigation.domainLookupStart,
    
    // TCP 连接时间
    tcp: navigation.connectEnd - navigation.connectStart,
    
    // 请求时间
    request: navigation.responseStart - navigation.requestStart,
    
    // 响应时间
    response: navigation.responseEnd - navigation.responseStart,
    
    // DOM 解析时间
    domParse: navigation.domInteractive - navigation.responseEnd,
    
    // 资源加载时间
    resourceLoad: navigation.loadEventStart - navigation.domContentLoadedEventEnd,
    
    // 首次内容绘制 (FCP)
    fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime || 0,
    
    // 最大内容绘制 (LCP)
    lcp: 0, // 需要使用 PerformanceObserver 获取
    
    // 首次输入延迟 (FID)
    fid: 0, // 需要使用 PerformanceObserver 获取
    
    // 累积布局偏移 (CLS)
    cls: 0 // 需要使用 PerformanceObserver 获取
  };
}

/**
 * 监控 LCP
 */
export function observeLCP(callback: (value: number) => void) {
  const observer = new PerformanceObserver((list) => {
    const entries = list.getEntries();
    const lastEntry = entries[entries.length - 1];
    callback(lastEntry.startTime);
  });
  
  observer.observe({ entryTypes: ['largest-contentful-paint'] });
  
  return () => observer.disconnect();
}
```

### 2. 性能上报
```typescript
// src/utils/performance-report.ts

/**
 * 上报性能数据
 */
export function reportPerformance() {
  // 等待页面加载完成
  window.addEventListener('load', () => {
    setTimeout(() => {
      const metrics = getPerformanceMetrics();
      
      // 上报到服务器
      navigator.sendBeacon('/api/performance', JSON.stringify(metrics));
    }, 0);
  });
}
```

## 最佳实践

### 1. 性能优化清单
- [ ] 使用路由懒加载
- [ ] 使用组件懒加载
- [ ] 合理使用 v-if 和 v-show
- [ ] 列表使用唯一 key
- [ ] 大列表使用虚拟滚动
- [ ] 使用计算属性缓存
- [ ] 事件处理使用防抖/节流
- [ ] 使用 keep-alive 缓存组件
- [ ] 图片使用懒加载
- [ ] 配置代码分割
- [ ] 启用 Gzip 压缩
- [ ] 按需导入第三方库
- [ ] 请求合并和缓存
- [ ] 清理定时器和事件监听
- [ ] 监控性能指标

### 2. 性能优化原则
1. **测量优先**: 先测量再优化，避免过早优化
2. **关注用户体验**: 优化用户可感知的性能
3. **持续优化**: 性能优化是持续的过程
4. **权衡取舍**: 在性能和开发效率之间找平衡

### 3. 性能优化工具
- **Chrome DevTools**: 性能分析
- **Lighthouse**: 性能评分
- **Vue DevTools**: Vue 性能分析
- **Webpack Bundle Analyzer**: 包大小分析

## 注意事项

1. **避免过早优化**: 先保证功能正确，再优化性能
2. **测量性能**: 使用工具测量，不要凭感觉
3. **关注关键路径**: 优先优化首屏加载
4. **平衡取舍**: 性能和可维护性之间找平衡
5. **持续监控**: 建立性能监控体系
6. **用户体验**: 性能优化最终是为了提升用户体验
7. **渐进增强**: 逐步优化，不要一次性大改
8. **文档记录**: 记录优化措施和效果
