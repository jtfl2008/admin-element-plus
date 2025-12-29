# 状态管理规范 (Pinia)

## Pinia Store 组织结构

### Store 目录结构
```
src/stores/
├── index.ts              # Store 入口文件
└── modules/              # Store 模块
    ├── auth.ts          # 认证状态
    ├── user.ts          # 用户信息
    ├── app.ts           # 应用配置
    ├── dict.ts          # 字典数据
    ├── permission.ts    # 权限管理
    └── tabs.ts          # 标签页管理
```

## Store 定义规范

### 基础 Store 模板
```typescript
// src/stores/modules/user.ts
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { User } from '@/typings/api/system';

/**
 * 用户信息 Store
 */
export const useUserStore = defineStore(
  'user',
  () => {
    // ==================== State ====================
    /** 用户信息 */
    const userInfo = ref<User | null>(null);
    
    /** 用户权限列表 */
    const permissions = ref<string[]>([]);
    
    /** 用户角色列表 */
    const roles = ref<string[]>([]);

    // ==================== Getters ====================
    /** 是否已登录 */
    const isLoggedIn = computed(() => !!userInfo.value);
    
    /** 用户昵称 */
    const nickName = computed(() => userInfo.value?.nickName || '');
    
    /** 用户头像 */
    const avatar = computed(() => userInfo.value?.avatar || '');
    
    /** 是否有指定权限 */
    const hasPermission = computed(() => {
      return (permission: string) => {
        return permissions.value.includes(permission);
      };
    });
    
    /** 是否有指定角色 */
    const hasRole = computed(() => {
      return (role: string) => {
        return roles.value.includes(role);
      };
    });

    // ==================== Actions ====================
    /**
     * 设置用户信息
     * @param info 用户信息
     */
    function setUserInfo(info: User) {
      userInfo.value = info;
    }
    
    /**
     * 设置权限列表
     * @param perms 权限列表
     */
    function setPermissions(perms: string[]) {
      permissions.value = perms;
    }
    
    /**
     * 设置角色列表
     * @param roleList 角色列表
     */
    function setRoles(roleList: string[]) {
      roles.value = roleList;
    }
    
    /**
     * 清空用户信息
     */
    function clearUserInfo() {
      userInfo.value = null;
      permissions.value = [];
      roles.value = [];
    }
    
    /**
     * 更新用户信息
     * @param info 部分用户信息
     */
    function updateUserInfo(info: Partial<User>) {
      if (userInfo.value) {
        Object.assign(userInfo.value, info);
      }
    }

    // ==================== Return ====================
    return {
      // State
      userInfo,
      permissions,
      roles,
      
      // Getters
      isLoggedIn,
      nickName,
      avatar,
      hasPermission,
      hasRole,
      
      // Actions
      setUserInfo,
      setPermissions,
      setRoles,
      clearUserInfo,
      updateUserInfo
    };
  },
  {
    // 持久化配置
    persist: {
      key: 'user-store',
      storage: localStorage,
      paths: ['userInfo', 'permissions', 'roles']
    }
  }
);
```

### 带异步操作的 Store
```typescript
// src/stores/modules/auth.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { login, logout, getInfo } from '@/service/api/auth';
import { useUserStore } from './user';
import type { LoginParams } from '@/typings/api/auth';

/**
 * 认证 Store
 */
export const useAuthStore = defineStore(
  'auth',
  () => {
    // ==================== State ====================
    /** 访问令牌 */
    const token = ref<string>('');
    
    /** 刷新令牌 */
    const refreshToken = ref<string>('');
    
    /** 登录加载状态 */
    const loginLoading = ref(false);

    // ==================== Actions ====================
    /**
     * 用户登录
     * @param params 登录参数
     */
    async function handleLogin(params: LoginParams) {
      loginLoading.value = true;
      try {
        const { access_token, refresh_token } = await login(params);
        token.value = access_token;
        refreshToken.value = refresh_token;
        
        // 登录成功后获取用户信息
        await getUserInfo();
        
        return true;
      } catch (error) {
        console.error('登录失败:', error);
        return false;
      } finally {
        loginLoading.value = false;
      }
    }
    
    /**
     * 获取用户信息
     */
    async function getUserInfo() {
      try {
        const { user, permissions, roles } = await getInfo();
        
        const userStore = useUserStore();
        userStore.setUserInfo(user);
        userStore.setPermissions(permissions);
        userStore.setRoles(roles);
      } catch (error) {
        console.error('获取用户信息失败:', error);
        throw error;
      }
    }
    
    /**
     * 用户登出
     */
    async function handleLogout() {
      try {
        await logout();
      } catch (error) {
        console.error('登出失败:', error);
      } finally {
        // 清空状态
        token.value = '';
        refreshToken.value = '';
        
        const userStore = useUserStore();
        userStore.clearUserInfo();
      }
    }
    
    /**
     * 设置 Token
     * @param accessToken 访问令牌
     * @param refreshTokenValue 刷新令牌
     */
    function setToken(accessToken: string, refreshTokenValue?: string) {
      token.value = accessToken;
      if (refreshTokenValue) {
        refreshToken.value = refreshTokenValue;
      }
    }
    
    /**
     * 清空 Token
     */
    function clearToken() {
      token.value = '';
      refreshToken.value = '';
    }

    // ==================== Return ====================
    return {
      // State
      token,
      refreshToken,
      loginLoading,
      
      // Actions
      handleLogin,
      getUserInfo,
      handleLogout,
      setToken,
      clearToken
    };
  },
  {
    // 持久化配置
    persist: {
      key: 'auth-store',
      storage: localStorage,
      paths: ['token', 'refreshToken']
    }
  }
);
```

### 字典数据 Store
```typescript
// src/stores/modules/dict.ts
import { defineStore } from 'pinia';
import { ref } from 'vue';
import { fetchDictData } from '@/service/api/system/dict';
import type { DictData } from '@/typings/api/system';

/**
 * 字典数据 Store
 */
export const useDictStore = defineStore('dict', () => {
  // ==================== State ====================
  /** 字典数据缓存 */
  const dictCache = ref<Record<string, DictData[]>>({});
  
  /** 加载状态 */
  const loading = ref<Record<string, boolean>>({});

  // ==================== Actions ====================
  /**
   * 获取字典数据
   * @param dictType 字典类型
   * @param forceRefresh 是否强制刷新
   */
  async function getDictData(dictType: string, forceRefresh = false) {
    // 如果缓存中有数据且不强制刷新，直接返回
    if (dictCache.value[dictType] && !forceRefresh) {
      return dictCache.value[dictType];
    }
    
    // 如果正在加载，等待加载完成
    if (loading.value[dictType]) {
      return new Promise<DictData[]>((resolve) => {
        const timer = setInterval(() => {
          if (!loading.value[dictType]) {
            clearInterval(timer);
            resolve(dictCache.value[dictType] || []);
          }
        }, 100);
      });
    }
    
    // 开始加载
    loading.value[dictType] = true;
    try {
      const data = await fetchDictData(dictType);
      dictCache.value[dictType] = data;
      return data;
    } catch (error) {
      console.error(`获取字典数据失败 [${dictType}]:`, error);
      return [];
    } finally {
      loading.value[dictType] = false;
    }
  }
  
  /**
   * 获取字典标签
   * @param dictType 字典类型
   * @param dictValue 字典值
   */
  async function getDictLabel(dictType: string, dictValue: string) {
    const data = await getDictData(dictType);
    const item = data.find(d => d.dictValue === dictValue);
    return item?.dictLabel || dictValue;
  }
  
  /**
   * 清空字典缓存
   * @param dictType 字典类型，不传则清空所有
   */
  function clearDictCache(dictType?: string) {
    if (dictType) {
      delete dictCache.value[dictType];
    } else {
      dictCache.value = {};
    }
  }
  
  /**
   * 刷新字典数据
   * @param dictType 字典类型
   */
  async function refreshDictData(dictType: string) {
    return getDictData(dictType, true);
  }

  // ==================== Return ====================
  return {
    // State
    dictCache,
    loading,
    
    // Actions
    getDictData,
    getDictLabel,
    clearDictCache,
    refreshDictData
  };
});
```

## Store 使用规范

### 在组件中使用 Store
```vue
<script setup lang="ts">
import { useUserStore } from '@/stores/modules/user';
import { useAuthStore } from '@/stores/modules/auth';

// 获取 Store 实例
const userStore = useUserStore();
const authStore = useAuthStore();

// 访问 State
console.log(userStore.userInfo);
console.log(authStore.token);

// 访问 Getters
console.log(userStore.isLoggedIn);
console.log(userStore.nickName);

// 调用 Actions
async function handleLogin() {
  const success = await authStore.handleLogin({
    username: 'admin',
    password: '123456'
  });
  
  if (success) {
    console.log('登录成功');
  }
}

// 使用 computed 响应式访问
const userName = computed(() => userStore.userInfo?.userName);
</script>
```

### 在非组件中使用 Store
```typescript
// src/utils/auth.ts
import { useAuthStore } from '@/stores/modules/auth';

/**
 * 获取 Token
 */
export function getToken() {
  const authStore = useAuthStore();
  return authStore.token;
}

/**
 * 检查是否已登录
 */
export function isLoggedIn() {
  const authStore = useAuthStore();
  return !!authStore.token;
}
```

### Store 之间的相互调用
```typescript
// src/stores/modules/auth.ts
import { useUserStore } from './user';
import { usePermissionStore } from './permission';

export const useAuthStore = defineStore('auth', () => {
  async function handleLogin(params: LoginParams) {
    // ... 登录逻辑
    
    // 调用其他 Store
    const userStore = useUserStore();
    const permissionStore = usePermissionStore();
    
    userStore.setUserInfo(user);
    await permissionStore.generateRoutes(roles);
  }
  
  return {
    handleLogin
  };
});
```

## 持久化配置

### 基础持久化
```typescript
export const useUserStore = defineStore(
  'user',
  () => {
    // ... store 定义
  },
  {
    persist: true // 使用默认配置
  }
);
```

### 自定义持久化
```typescript
export const useUserStore = defineStore(
  'user',
  () => {
    // ... store 定义
  },
  {
    persist: {
      // 存储的 key
      key: 'user-store',
      
      // 存储位置
      storage: localStorage, // 或 sessionStorage
      
      // 需要持久化的路径
      paths: ['userInfo', 'permissions'],
      
      // 序列化方法
      serializer: {
        serialize: JSON.stringify,
        deserialize: JSON.parse
      }
    }
  }
);
```

### 多个持久化配置
```typescript
export const useAppStore = defineStore(
  'app',
  () => {
    // ... store 定义
  },
  {
    persist: [
      {
        key: 'app-settings',
        storage: localStorage,
        paths: ['theme', 'language']
      },
      {
        key: 'app-cache',
        storage: sessionStorage,
        paths: ['cache']
      }
    ]
  }
);
```

## 最佳实践

### 1. Store 命名
- 使用 `use` 前缀：`useUserStore`、`useAuthStore`
- 使用清晰的名称描述 Store 的用途

### 2. State 设计
- 保持 State 扁平化，避免深层嵌套
- 使用合适的数据类型
- 提供默认值

### 3. Getters 使用
- 用于派生状态
- 避免在 Getters 中执行副作用
- 利用计算属性的缓存特性

### 4. Actions 设计
- 使用清晰的动词命名：`setUser`、`updateUser`、`clearUser`
- 异步操作使用 async/await
- 提供完整的错误处理

### 5. 模块化
- 按功能划分 Store 模块
- 避免单个 Store 过大
- 合理拆分相关功能

### 6. 类型安全
- 使用 TypeScript 定义类型
- 为 State、Actions 提供类型注解
- 避免使用 any 类型

### 7. 持久化策略
- 敏感信息不要持久化
- 合理选择 localStorage 或 sessionStorage
- 只持久化必要的数据

### 8. 性能优化
- 避免在 Store 中存储大量数据
- 使用计算属性缓存派生状态
- 合理使用持久化，避免存储过多数据

## 常见模式

### 1. 加载状态管理
```typescript
export const useDataStore = defineStore('data', () => {
  const loading = ref(false);
  const data = ref<any[]>([]);
  const error = ref<Error | null>(null);
  
  async function fetchData() {
    loading.value = true;
    error.value = null;
    try {
      const result = await api.getData();
      data.value = result;
    } catch (e) {
      error.value = e as Error;
    } finally {
      loading.value = false;
    }
  }
  
  return {
    loading,
    data,
    error,
    fetchData
  };
});
```

### 2. 列表数据管理
```typescript
export const useListStore = defineStore('list', () => {
  const list = ref<Item[]>([]);
  const total = ref(0);
  const pageNum = ref(1);
  const pageSize = ref(10);
  
  async function fetchList() {
    const { rows, total: totalCount } = await api.getList({
      pageNum: pageNum.value,
      pageSize: pageSize.value
    });
    list.value = rows;
    total.value = totalCount;
  }
  
  function addItem(item: Item) {
    list.value.unshift(item);
    total.value++;
  }
  
  function updateItem(id: number, item: Partial<Item>) {
    const index = list.value.findIndex(i => i.id === id);
    if (index !== -1) {
      Object.assign(list.value[index], item);
    }
  }
  
  function deleteItem(id: number) {
    const index = list.value.findIndex(i => i.id === id);
    if (index !== -1) {
      list.value.splice(index, 1);
      total.value--;
    }
  }
  
  return {
    list,
    total,
    pageNum,
    pageSize,
    fetchList,
    addItem,
    updateItem,
    deleteItem
  };
});
```

### 3. 表单状态管理
```typescript
export const useFormStore = defineStore('form', () => {
  const formData = ref<FormData>({
    name: '',
    age: 0,
    email: ''
  });
  
  const isDirty = ref(false);
  
  function setFormData(data: Partial<FormData>) {
    Object.assign(formData.value, data);
    isDirty.value = true;
  }
  
  function resetForm() {
    formData.value = {
      name: '',
      age: 0,
      email: ''
    };
    isDirty.value = false;
  }
  
  return {
    formData,
    isDirty,
    setFormData,
    resetForm
  };
});
```

## 注意事项

1. **不要在 Store 外部直接修改 State**: 使用 Actions 修改
2. **避免循环依赖**: Store 之间的相互调用要注意
3. **合理使用持久化**: 不要持久化敏感信息
4. **类型安全**: 使用 TypeScript 确保类型安全
5. **错误处理**: Actions 中要有完整的错误处理
6. **性能考虑**: 避免存储大量数据
7. **命名规范**: 保持命名的一致性和可读性
8. **文档注释**: 为 Store 和 Actions 添加注释
