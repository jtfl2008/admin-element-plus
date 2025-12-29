# 项目技术栈和代码结构规则

## 技术栈概述

### 核心技术栈
- **前端框架**: Vue 3.5.25 (Composition API)
- **开发语言**: TypeScript 5.9
- **构建工具**: Vite 5.4
- **UI 组件库**: Element Plus 2.13
- **状态管理**: Pinia 3.0 + pinia-plugin-persistedstate
- **路由管理**: Vue Router 4.6
- **HTTP 客户端**: Axios 1.13
- **CSS 预处理器**: SCSS/Sass
- **包管理器**: pnpm
- **日期处理**: dayjs 1.11
- **图表库**: ECharts 6.0
- **工具库**: lodash-es, @vueuse/core

### 开发工具
- **代码检查**: ESLint 9.39
- **代码格式化**: Prettier 3.6
- **类型检查**: vue-tsc 3.1
- **自动导入**: unplugin-auto-import, unplugin-vue-components
- **SVG 图标**: vite-plugin-svg-icons
- **代码压缩**: vite-plugin-compression

## 项目结构规范

### 目录结构
```
src/
├── assets/           # 静态资源（图片、SVG 图标等）
├── components/       # 可复用组件
│   ├── ConfigurableForm/    # 可配置表单组件
│   ├── ConfigurableTable/   # 可配置表格组件
│   ├── DeptTree/            # 部门树组件
│   ├── DialogEnhance/       # 增强对话框组件
│   ├── DialogForm/          # 对话框表单组件
│   ├── IconSelector/        # 图标选择器
│   ├── MenuTree/            # 菜单树组件
│   ├── SelectTable/         # 选择表格组件
│   ├── StatusSwitch/        # 状态开关组件
│   └── common/              # 通用组件
├── config/           # 配置文件
├── constants/        # 应用常量
├── directives/       # 自定义指令
├── hooks/            # Vue 组合函数
├── layouts/          # 页面布局
├── plugins/          # Vue 插件
├── router/           # 路由配置
├── service/          # API 服务
│   ├── api/         # API 接口定义
│   └── request/     # 请求配置
├── stores/           # Pinia 状态管理
│   └── modules/     # 状态模块
├── styles/           # 全局样式
│   ├── base/        # 基础样式
│   ├── mixins/      # SCSS 混入
│   ├── overrides/   # 组件样式覆盖
│   ├── themes/      # 主题样式
│   └── variables/   # SCSS 变量
├── typings/          # TypeScript 类型定义
│   └── api/         # API 类型定义
├── utils/            # 工具函数
├── views/            # 页面组件
│   ├── common/      # 通用页面
│   ├── error/       # 错误页面
│   ├── home/        # 首页
│   ├── login/       # 登录页
│   ├── system/      # 系统管理
│   └── workbench/   # 工作台
├── App.vue           # 根组件
└── main.ts           # 应用入口
```

## 命名规范

### 文件命名
- **Vue 组件**: `kebab-case.vue` (如 `user-list.vue`)
- **TypeScript 文件**: `kebab-case.ts` (如 `user-service.ts`)
- **类型定义文件**: `kebab-case.d.ts` (如 `api.d.ts`)
- **样式文件**: `kebab-case.scss` (如 `global.scss`)
- **目录命名**: `kebab-case` (如 `user-management/`)

### 组件命名
- **组件名**: 使用 PascalCase (如 `UserList`)
- **组件文件**: 使用 kebab-case (如 `user-list.vue`)
- **defineOptions 中的 name**: 使用 PascalCase

```typescript
defineOptions({
  name: 'UserList'
});
```

### 变量命名
- **变量和函数**: camelCase (如 `userName`, `getUserInfo`)
- **常量**: UPPER_SNAKE_CASE (如 `API_BASE_URL`)
- **类型/接口**: PascalCase (如 `UserInfo`, `ApiResponse`)

## 代码编写规范

### Vue 组件结构
```vue
<script setup lang="ts">
// 1. 导入第三方库
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';

// 2. 导入项目内部模块
import { useAuthStore } from '@/stores/modules/auth';
import { fetchUserList } from '@/service/api/system/user';

// 3. 导入类型
import type { User } from '@/typings/api/system';

// 4. 定义组件名称
defineOptions({
  name: 'UserList'
});

// 5. 定义 Props 和 Emits
interface Props {
  title?: string;
}

const props = withDefaults(defineProps<Props>(), {
  title: '用户列表'
});

interface Emits {
  (e: 'update', value: User[]): void;
}

const emit = defineEmits<Emits>();

// 6. 响应式数据
const loading = ref(false);
const userList = ref<User[]>([]);

// 7. 计算属性
const totalUsers = computed(() => userList.value.length);

// 8. 方法
async function loadUsers() {
  loading.value = true;
  try {
    const { data } = await fetchUserList();
    userList.value = data;
    emit('update', data);
  } finally {
    loading.value = false;
  }
}

// 9. 生命周期钩子
onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="user-list">
    <h2>{{ title }}</h2>
    <el-table :data="userList" :loading="loading">
      <!-- 表格列 -->
    </el-table>
  </div>
</template>

<style scoped lang="scss">
.user-list {
  padding: 20px;
  
  h2 {
    margin-bottom: 16px;
  }
}
</style>
```

### TypeScript 类型定义
```typescript
// 使用 namespace 组织 API 类型
declare namespace Api {
  namespace System {
    /** 用户信息 */
    interface User {
      userId: number;
      userName: string;
      nickName: string;
      email: string;
      phonenumber: string;
      sex: string;
      avatar: string;
      status: string;
      createTime: string;
    }

    /** 用户查询参数 */
    interface UserSearchParams {
      userName?: string;
      phonenumber?: string;
      status?: string;
      pageNum?: number;
      pageSize?: number;
    }
  }
}
```

### API 接口定义
```typescript
// src/service/api/system/user.ts
import { request } from '@/service/request/request';

/** 获取用户列表 */
export function fetchUserList(params?: Api.System.UserSearchParams) {
  return request<Api.System.User[]>({
    url: '/system/user/list',
    method: 'get',
    params
  });
}

/** 获取用户详情 */
export function fetchUserDetail(userId: number) {
  return request<Api.System.User>({
    url: `/system/user/${userId}`,
    method: 'get'
  });
}

/** 新增用户 */
export function addUser(data: Api.System.User) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  });
}

/** 更新用户 */
export function updateUser(data: Api.System.User) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  });
}

/** 删除用户 */
export function deleteUser(userId: number) {
  return request({
    url: `/system/user/${userId}`,
    method: 'delete'
  });
}
```

### Pinia Store 定义
```typescript
// src/stores/modules/user.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import type { User } from '@/typings/api/system';

export const useUserStore = defineStore(
  'user',
  () => {
    // 状态
    const userInfo = ref<User | null>(null);
    const token = ref<string>('');

    // Getters
    const isLoggedIn = computed(() => !!token.value);

    // Actions
    function setUserInfo(info: User) {
      userInfo.value = info;
    }

    function setToken(newToken: string) {
      token.value = newToken;
    }

    function clearUserInfo() {
      userInfo.value = null;
      token.value = '';
    }

    return {
      userInfo,
      token,
      isLoggedIn,
      setUserInfo,
      setToken,
      clearUserInfo
    };
  },
  {
    persist: true // 持久化存储
  }
);
```

## 样式编写规范

### SCSS 使用规范
```vue
<style scoped lang="scss">
// 1. 使用 BEM 命名规范
.user-list {
  padding: 20px;
  
  // 2. 使用嵌套
  &__header {
    display: flex;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  
  &__title {
    font-size: 18px;
    font-weight: bold;
    color: var(--el-color-primary);
  }
  
  &__content {
    background-color: var(--el-bg-color);
    border-radius: 4px;
  }
  
  // 3. 使用 Element Plus CSS 变量
  .search-form {
    padding: 16px;
    background-color: var(--el-fill-color-light);
    border: 1px solid var(--el-border-color);
  }
  
  // 4. 响应式设计
  @media (max-width: 768px) {
    padding: 12px;
    
    &__header {
      flex-direction: column;
    }
  }
}
</style>
```

### 常用 Element Plus CSS 变量
```scss
// 颜色
var(--el-color-primary)           // 主题色
var(--el-color-success)           // 成功色
var(--el-color-warning)           // 警告色
var(--el-color-danger)            // 危险色
var(--el-color-info)              // 信息色

// 文本颜色
var(--el-text-color-primary)      // 主要文本
var(--el-text-color-regular)      // 常规文本
var(--el-text-color-secondary)    // 次要文本
var(--el-text-color-placeholder)  // 占位文本
var(--el-text-color-disabled)     // 禁用文本

// 背景色
var(--el-bg-color)                // 基础背景
var(--el-bg-color-page)           // 页面背景
var(--el-bg-color-overlay)        // 遮罩背景

// 填充色
var(--el-fill-color)              // 基础填充
var(--el-fill-color-light)        // 浅色填充
var(--el-fill-color-lighter)      // 更浅填充
var(--el-fill-color-extra-light)  // 极浅填充
var(--el-fill-color-dark)         // 深色填充
var(--el-fill-color-darker)       // 更深填充
var(--el-fill-color-blank)        // 空白填充

// 边框
var(--el-border-color)            // 基础边框
var(--el-border-color-light)      // 浅色边框
var(--el-border-color-lighter)    // 更浅边框
var(--el-border-color-extra-light)// 极浅边框
var(--el-border-color-dark)       // 深色边框
var(--el-border-color-darker)     // 更深边框
```

## 路径别名配置

```typescript
// vite.config.ts
export default {
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
};

// tsconfig.json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### 使用路径别名
```typescript
// 导入组件
import UserList from '@/views/system/user/index.vue';

// 导入 API
import { fetchUserList } from '@/service/api/system/user';

// 导入 Store
import { useAuthStore } from '@/stores/modules/auth';

// 导入工具函数
import { formatDate } from '@/utils/date';

// 导入类型
import type { User } from '@/typings/api/system';
```

## 环境变量配置

### 环境变量文件
- `.env` - 基础环境变量
- `.env.development` - 开发环境
- `.env.production` - 生产环境

### 环境变量命名
- 必须以 `VITE_` 开头
- 使用 UPPER_SNAKE_CASE 命名

```bash
# .env.development
VITE_API_BASE_URL=http://localhost:8080
VITE_APP_TITLE=管理系统
VITE_APP_UPLOAD_URL=http://localhost:8080/upload
```

### 使用环境变量
```typescript
// 在代码中使用
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL;
const appTitle = import.meta.env.VITE_APP_TITLE;
```

## 常用组件和工具

### 可复用组件
- `ConfigurableForm` - 可配置表单组件
- `ConfigurableTable` - 可配置表格组件
- `DeptTree` - 部门树组件
- `MenuTree` - 菜单树组件
- `DialogEnhance` - 增强对话框组件
- `DialogForm` - 对话框表单组件
- `IconSelector` - 图标选择器
- `SelectTable` - 选择表格组件
- `StatusSwitch` - 状态开关组件

### 工具函数
- `@/utils/auth.ts` - 认证相关工具
- `@/utils/storage.ts` - 本地存储工具
- `@/utils/validate.ts` - 表单验证工具
- `@/utils/tree.ts` - 树形数据处理工具
- `@/utils/dict.ts` - 字典数据处理工具

### Hooks
- `useAuth` - 认证相关 Hook
- `@vueuse/core` - VueUse 工具库

## 开发命令

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 类型检查
pnpm type-check

# 代码检查和修复
pnpm lint

# 代码格式化
pnpm format

# 构建生产版本
pnpm build:prod

# 预览生产构建
pnpm preview
```

## 代码提交规范

使用约定式提交规范：

```bash
feat: 新功能
fix: 修复 Bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
perf: 性能优化
test: 测试代码
chore: 构建或工具变动
```

## 最佳实践

### 1. 组件设计
- 单一职责原则
- 可复用性优先
- Props 类型明确
- 事件命名清晰

### 2. 状态管理
- 全局状态使用 Pinia
- 组件状态使用 ref/reactive
- 避免过度使用全局状态
- 合理拆分 Store 模块

### 3. API 调用
- 统一的错误处理
- 请求和响应拦截
- 接口类型定义完整
- 合理的超时设置

### 4. 性能优化
- 路由懒加载
- 组件懒加载
- 使用 v-show 代替频繁切换的 v-if
- 列表使用 key
- 避免在模板中使用复杂表达式

### 5. 类型安全
- 所有 API 接口定义类型
- Props 和 Emits 使用 TypeScript
- 避免使用 any 类型
- 使用类型守卫和类型断言

### 6. 样式管理
- 使用 SCSS 预处理器
- 组件样式使用 scoped
- 使用 Element Plus CSS 变量
- 遵循 BEM 命名规范
- 响应式设计

## 注意事项

1. **不要直接修改 Props**: 使用计算属性或本地状态
2. **避免深层嵌套**: 组件层级不超过 3 层
3. **合理使用 computed**: 避免在 computed 中执行副作用
4. **正确使用 watch**: 明确 immediate 和 deep 选项
5. **组件通信**: 优先使用 Props/Emits，避免滥用事件总线
6. **错误处理**: 所有异步操作都要有错误处理
7. **代码注释**: 复杂逻辑添加注释说明
8. **类型定义**: 所有公共接口都要有类型定义
