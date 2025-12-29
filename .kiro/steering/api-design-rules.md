# API 设计和接口规范

## API 接口设计原则

### RESTful API 规范
- 使用标准 HTTP 方法：GET（查询）、POST（新增）、PUT（更新）、DELETE（删除）
- URL 使用名词复数形式，避免使用动词
- 使用合理的 HTTP 状态码

### 接口命名规范
```typescript
// 列表查询
GET /system/user/list

// 详情查询
GET /system/user/{id}

// 新增
POST /system/user

// 更新
PUT /system/user

// 删除
DELETE /system/user/{id}

// 批量删除
DELETE /system/user/batch

// 状态切换
PUT /system/user/status
```

## TypeScript 类型定义规范

### API 类型组织结构
```typescript
// src/typings/api/system/user.d.ts
declare namespace Api {
  namespace System {
    namespace User {
      /** 用户信息 */
      interface UserInfo {
        userId: number;
        userName: string;
        nickName: string;
        email: string;
        phonenumber: string;
        sex: string;
        avatar: string;
        status: string;
        delFlag: string;
        loginIp: string;
        loginDate: string;
        createBy: string;
        createTime: string;
        updateBy: string;
        updateTime: string;
        remark: string;
      }

      /** 用户查询参数 */
      interface SearchParams {
        userName?: string;
        phonenumber?: string;
        status?: string;
        deptId?: number;
        pageNum?: number;
        pageSize?: number;
        orderByColumn?: string;
        isAsc?: string;
      }

      /** 用户表单数据 */
      interface FormData {
        userId?: number;
        userName: string;
        nickName: string;
        email: string;
        phonenumber: string;
        sex: string;
        status: string;
        deptId: number;
        postIds: number[];
        roleIds: number[];
        remark?: string;
      }

      /** 用户列表响应 */
      interface ListResponse {
        rows: UserInfo[];
        total: number;
      }
    }
  }
}
```

### 通用类型定义
```typescript
// src/typings/api/common.d.ts
declare namespace Api {
  namespace Common {
    /** 分页参数 */
    interface PageParams {
      pageNum?: number;
      pageSize?: number;
      orderByColumn?: string;
      isAsc?: string;
    }

    /** 分页响应 */
    interface PageResponse<T> {
      rows: T[];
      total: number;
    }

    /** 通用响应 */
    interface Response<T = any> {
      code: number;
      msg: string;
      data: T;
    }

    /** 树形节点 */
    interface TreeNode {
      id: number;
      label: string;
      children?: TreeNode[];
    }

    /** 字典数据 */
    interface DictData {
      dictCode: number;
      dictLabel: string;
      dictValue: string;
      dictType: string;
      cssClass?: string;
      listClass?: string;
      isDefault?: string;
      status: string;
      createTime: string;
      remark?: string;
    }
  }
}
```

## API 接口实现规范

### 基础 CRUD 接口
```typescript
// src/service/api/system/user.ts
import { request } from '@/service/request/request';

/**
 * 获取用户列表
 * @param params 查询参数
 */
export function fetchUserList(params?: Api.System.User.SearchParams) {
  return request<Api.System.User.ListResponse>({
    url: '/system/user/list',
    method: 'get',
    params
  });
}

/**
 * 获取用户详情
 * @param userId 用户ID
 */
export function fetchUserDetail(userId: number) {
  return request<Api.System.User.UserInfo>({
    url: `/system/user/${userId}`,
    method: 'get'
  });
}

/**
 * 新增用户
 * @param data 用户数据
 */
export function addUser(data: Api.System.User.FormData) {
  return request<void>({
    url: '/system/user',
    method: 'post',
    data
  });
}

/**
 * 更新用户
 * @param data 用户数据
 */
export function updateUser(data: Api.System.User.FormData) {
  return request<void>({
    url: '/system/user',
    method: 'put',
    data
  });
}

/**
 * 删除用户
 * @param userId 用户ID
 */
export function deleteUser(userId: number) {
  return request<void>({
    url: `/system/user/${userId}`,
    method: 'delete'
  });
}

/**
 * 批量删除用户
 * @param userIds 用户ID数组
 */
export function batchDeleteUser(userIds: number[]) {
  return request<void>({
    url: '/system/user/batch',
    method: 'delete',
    data: userIds
  });
}

/**
 * 修改用户状态
 * @param userId 用户ID
 * @param status 状态
 */
export function changeUserStatus(userId: number, status: string) {
  return request<void>({
    url: '/system/user/status',
    method: 'put',
    data: { userId, status }
  });
}

/**
 * 重置用户密码
 * @param userId 用户ID
 * @param password 新密码
 */
export function resetUserPassword(userId: number, password: string) {
  return request<void>({
    url: '/system/user/resetPwd',
    method: 'put',
    data: { userId, password }
  });
}

/**
 * 导出用户数据
 * @param params 查询参数
 */
export function exportUser(params?: Api.System.User.SearchParams) {
  return request<Blob>({
    url: '/system/user/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  });
}
```

## 请求和响应处理

### 请求拦截器
```typescript
// src/service/request/request.ts
import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ElMessage } from 'element-plus';
import { useAuthStore } from '@/stores/modules/auth';

// 创建 axios 实例
const service: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    const authStore = useAuthStore();
    
    // 添加 token
    if (authStore.token) {
      config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('请求错误:', error);
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    const { code, msg, data } = response.data;
    
    // 成功响应
    if (code === 200) {
      return data;
    }
    
    // 业务错误
    ElMessage.error(msg || '请求失败');
    return Promise.reject(new Error(msg || '请求失败'));
  },
  (error) => {
    console.error('响应错误:', error);
    
    // 处理 HTTP 错误
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 401:
          ElMessage.error('未授权，请重新登录');
          // 跳转到登录页
          break;
        case 403:
          ElMessage.error('拒绝访问');
          break;
        case 404:
          ElMessage.error('请求地址不存在');
          break;
        case 500:
          ElMessage.error('服务器错误');
          break;
        default:
          ElMessage.error('请求失败');
      }
    } else {
      ElMessage.error('网络错误');
    }
    
    return Promise.reject(error);
  }
);

// 导出请求方法
export function request<T = any>(config: AxiosRequestConfig): Promise<T> {
  return service.request(config);
}
```

## 错误处理规范

### 统一错误处理
```typescript
// 在组件中使用
async function handleDelete(userId: number) {
  try {
    await deleteUser(userId);
    ElMessage.success('删除成功');
    await loadData();
  } catch (error) {
    // 错误已在拦截器中处理，这里可以做额外处理
    console.error('删除失败:', error);
  }
}
```

### 加载状态处理
```typescript
const loading = ref(false);

async function loadData() {
  loading.value = true;
  try {
    const data = await fetchUserList(queryParams.value);
    tableData.value = data.rows;
    total.value = data.total;
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
}
```

## 文件上传和下载

### 文件上传
```typescript
/**
 * 上传文件
 * @param file 文件对象
 */
export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request<{ url: string; fileName: string }>({
    url: '/common/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
```

### 文件下载
```typescript
/**
 * 下载文件
 * @param url 文件地址
 * @param fileName 文件名
 */
export async function downloadFile(url: string, fileName: string) {
  const response = await request<Blob>({
    url,
    method: 'get',
    responseType: 'blob'
  });
  
  const blob = new Blob([response]);
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href);
}
```

## 最佳实践

### 1. 接口命名
- 使用动词 + 名词的形式：`fetchUserList`、`addUser`、`updateUser`
- 保持命名一致性和可读性

### 2. 类型定义
- 所有接口都要定义完整的类型
- 使用 namespace 组织类型，避免命名冲突
- 区分查询参数、表单数据、响应数据的类型

### 3. 错误处理
- 统一在拦截器中处理通用错误
- 业务错误在组件中处理
- 使用 try-catch 包裹异步操作

### 4. 加载状态
- 所有异步操作都要有加载状态
- 使用 finally 确保加载状态正确重置

### 5. 请求取消
- 对于可能重复触发的请求，考虑使用请求取消
- 组件卸载时取消未完成的请求

### 6. 缓存策略
- 对于不常变化的数据，考虑使用缓存
- 使用 Pinia 管理全局数据缓存

## 注意事项

1. **类型安全**: 所有 API 接口必须定义完整的 TypeScript 类型
2. **错误处理**: 不要忽略错误，至少要在控制台输出
3. **加载状态**: 异步操作要有明确的加载状态反馈
4. **请求参数**: 使用对象传递参数，便于扩展
5. **响应数据**: 统一响应数据结构，便于处理
6. **文档注释**: 为每个接口添加 JSDoc 注释
7. **命名规范**: 保持接口命名的一致性
8. **版本管理**: API 版本变更时要做好兼容处理
