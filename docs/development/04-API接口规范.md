# API 接口规范

## 接口设计原则

### 1. RESTful 风格

遵循 RESTful API 设计规范：

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/users | 获取用户列表 |
| GET | /api/users/:id | 获取用户详情 |
| POST | /api/users | 创建用户 |
| PUT | /api/users/:id | 更新用户 |
| DELETE | /api/users/:id | 删除用户 |

### 2. 统一响应格式

```typescript
interface ApiResponse<T = any> {
  code: number;        // 状态码
  msg: string;         // 消息
  data: T;            // 数据
}
```

**成功响应示例**:
```json
{
  "code": 200,
  "msg": "操作成功",
  "data": {
    "id": 1,
    "username": "admin"
  }
}
```

**失败响应示例**:
```json
{
  "code": 500,
  "msg": "操作失败",
  "data": null
}
```

### 3. 分页响应格式

```typescript
interface PageResponse<T = any> {
  code: number;
  msg: string;
  rows: T[];          // 数据列表
  total: number;      // 总数
}
```

**分页响应示例**:
```json
{
  "code": 200,
  "msg": "查询成功",
  "rows": [
    { "id": 1, "username": "admin" },
    { "id": 2, "username": "user" }
  ],
  "total": 100
}
```

## 类型定义

### 1. 通用类型

```typescript
// src/typings/api.d.ts

declare namespace Api {
  /** 通用命名空间 */
  namespace Common {
    /** 通用搜索参数 */
    interface CommonSearchParams {
      /** 页码 */
      pageNum?: number;
      /** 每页数量 */
      pageSize?: number;
      /** 排序字段 */
      orderByColumn?: string;
      /** 排序方式 */
      isAsc?: 'asc' | 'desc';
    }

    /** 通用记录 */
    interface CommonRecord {
      /** 创建者 */
      createBy?: string;
      /** 创建时间 */
      createTime?: string;
      /** 更新者 */
      updateBy?: string;
      /** 更新时间 */
      updateTime?: string;
      /** 备注 */
      remark?: string;
    }
  }
}
```

### 2. 业务类型

```typescript
declare namespace Api {
  /** 系统管理命名空间 */
  namespace System {
    /** 用户信息 */
    interface User extends Common.CommonRecord {
      userId: number;
      username: string;
      nickName: string;
      email: string;
      phonenumber: string;
      sex: string;
      avatar: string;
      status: string;
      deptId: number;
      postIds: number[];
      roleIds: number[];
    }

    /** 用户搜索参数 */
    interface UserSearchParams extends Common.CommonSearchParams {
      username?: string;
      phonenumber?: string;
      status?: string;
      deptId?: number;
    }

    /** 角色信息 */
    interface Role extends Common.CommonRecord {
      roleId: number;
      roleName: string;
      roleKey: string;
      roleSort: number;
      status: string;
      menuIds: number[];
      deptIds: number[];
    }

    /** 菜单信息 */
    interface Menu extends Common.CommonRecord {
      menuId: number;
      menuName: string;
      parentId: number;
      orderNum: number;
      path: string;
      component: string;
      query: string;
      isFrame: string;
      isCache: string;
      menuType: MenuType;
      visible: string;
      status: string;
      perms: string;
      icon: string;
      children?: Menu[];
    }

    /** 菜单类型 */
    type MenuType = 'M' | 'C' | 'F';

    /** 部门信息 */
    interface Dept extends Common.CommonRecord {
      deptId: number;
      parentId: number;
      deptName: string;
      orderNum: number;
      leader: string;
      phone: string;
      email: string;
      status: string;
      children?: Dept[];
    }
  }
}
```

## API 服务定义

### 1. 创建 API 服务

```typescript
// src/service/api/system.ts

import { request } from '../request';

/**
 * 获取用户列表
 * @param params 查询参数
 */
export function fetchUserList(params?: Api.System.UserSearchParams) {
  return request<Api.System.User[]>({
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
  return request<Api.System.User>({
    url: `/system/user/${userId}`,
    method: 'get'
  });
}

/**
 * 新增用户
 * @param data 用户数据
 */
export function addUser(data: Api.System.User) {
  return request({
    url: '/system/user',
    method: 'post',
    data
  });
}

/**
 * 更新用户
 * @param data 用户数据
 */
export function updateUser(data: Api.System.User) {
  return request({
    url: '/system/user',
    method: 'put',
    data
  });
}

/**
 * 删除用户
 * @param userId 用户ID
 */
export function deleteUser(userId: number | number[]) {
  return request({
    url: `/system/user/${userId}`,
    method: 'delete'
  });
}

/**
 * 重置用户密码
 * @param userId 用户ID
 * @param password 新密码
 */
export function resetUserPwd(userId: number, password: string) {
  return request({
    url: '/system/user/resetPwd',
    method: 'put',
    data: { userId, password }
  });
}

/**
 * 修改用户状态
 * @param userId 用户ID
 * @param status 状态
 */
export function changeUserStatus(userId: number, status: string) {
  return request({
    url: '/system/user/changeStatus',
    method: 'put',
    data: { userId, status }
  });
}

/**
 * 导出用户
 * @param params 查询参数
 */
export function exportUser(params?: Api.System.UserSearchParams) {
  return request({
    url: '/system/user/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  });
}

/**
 * 导入用户
 * @param file 文件
 * @param updateSupport 是否更新已存在的用户
 */
export function importUser(file: File, updateSupport: boolean) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('updateSupport', String(updateSupport));
  
  return request({
    url: '/system/user/importData',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
```

### 2. 请求配置

```typescript
// src/service/request/index.ts

import type { AxiosRequestConfig } from 'axios';
import { createRequest } from '@sa/axios';
import { localStg } from '@sa/utils';

const { VITE_SERVICE_BASE_URL } = import.meta.env;

export const request = createRequest<App.Service.Response>(
  {
    baseURL: VITE_SERVICE_BASE_URL,
    timeout: 60000
  },
  {
    // 请求拦截器
    onRequest: (config) => {
      const token = localStg.get('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    
    // 响应拦截器
    onResponse: (response) => {
      const { data, status } = response;
      
      if (status === 200) {
        return data;
      }
      
      return Promise.reject(response);
    },
    
    // 错误处理
    onError: (error) => {
      const { response } = error;
      
      if (response) {
        const { status, data } = response;
        
        // 处理不同的错误状态码
        switch (status) {
          case 401:
            // 未授权，跳转登录
            window.$message?.error('登录已过期，请重新登录');
            break;
          case 403:
            // 无权限
            window.$message?.error('无权限访问');
            break;
          case 404:
            // 接口不存在
            window.$message?.error('接口不存在');
            break;
          case 500:
            // 服务器错误
            window.$message?.error(data?.msg || '服务器错误');
            break;
          default:
            window.$message?.error('请求失败');
        }
      } else {
        // 网络错误
        window.$message?.error('网络错误，请检查网络连接');
      }
      
      return Promise.reject(error);
    }
  }
);
```

## 请求方法

### 1. GET 请求

```typescript
// 查询列表
export function fetchList(params?: SearchParams) {
  return request<DataType[]>({
    url: '/api/list',
    method: 'get',
    params
  });
}

// 查询详情
export function fetchDetail(id: number) {
  return request<DataType>({
    url: `/api/detail/${id}`,
    method: 'get'
  });
}
```

### 2. POST 请求

```typescript
// 新增数据
export function addData(data: DataType) {
  return request({
    url: '/api/add',
    method: 'post',
    data
  });
}

// 批量操作
export function batchOperation(ids: number[]) {
  return request({
    url: '/api/batch',
    method: 'post',
    data: { ids }
  });
}
```

### 3. PUT 请求

```typescript
// 更新数据
export function updateData(data: DataType) {
  return request({
    url: '/api/update',
    method: 'put',
    data
  });
}
```

### 4. DELETE 请求

```typescript
// 删除数据
export function deleteData(id: number | number[]) {
  return request({
    url: `/api/delete/${id}`,
    method: 'delete'
  });
}
```

### 5. 文件上传

```typescript
// 上传文件
export function uploadFile(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  
  return request({
    url: '/api/upload',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
}
```

### 6. 文件下载

```typescript
// 下载文件
export function downloadFile(id: number) {
  return request({
    url: `/api/download/${id}`,
    method: 'get',
    responseType: 'blob'
  });
}

// 导出数据
export function exportData(params?: SearchParams) {
  return request({
    url: '/api/export',
    method: 'post',
    data: params,
    responseType: 'blob'
  });
}
```

## 使用示例

### 1. 基础使用

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { fetchUserList, deleteUser } from '@/service/api/system';

const userList = ref<Api.System.User[]>([]);
const loading = ref(false);

// 获取列表
async function getList() {
  loading.value = true;
  try {
    const { data } = await fetchUserList({
      pageNum: 1,
      pageSize: 10
    });
    userList.value = data;
  } finally {
    loading.value = false;
  }
}

// 删除用户
async function handleDelete(userId: number) {
  await deleteUser(userId);
  window.$message?.success('删除成功');
  getList();
}

// 初始化
getList();
</script>
```

### 2. 错误处理

```typescript
async function getData() {
  try {
    const { data, error } = await fetchData();
    
    if (error) {
      window.$message?.error(error.message);
      return;
    }
    
    // 处理数据
    console.log(data);
  } catch (error) {
    console.error('请求失败:', error);
  }
}
```

### 3. 并发请求

```typescript
async function getMultipleData() {
  const [users, roles, depts] = await Promise.all([
    fetchUserList(),
    fetchRoleList(),
    fetchDeptList()
  ]);
  
  return { users, roles, depts };
}
```

### 4. 请求取消

```typescript
import { ref } from 'vue';
import axios from 'axios';

const cancelToken = ref<any>(null);

async function fetchData() {
  // 取消之前的请求
  if (cancelToken.value) {
    cancelToken.value.cancel('取消请求');
  }
  
  // 创建新的取消令牌
  cancelToken.value = axios.CancelToken.source();
  
  try {
    const { data } = await request({
      url: '/api/data',
      method: 'get',
      cancelToken: cancelToken.value.token
    });
    
    return data;
  } catch (error) {
    if (axios.isCancel(error)) {
      console.log('请求已取消');
    }
  }
}
```

## 接口文档

### 1. 接口注释

为每个 API 函数添加详细的 JSDoc 注释：

```typescript
/**
 * 获取用户列表
 * 
 * @param params - 查询参数
 * @param params.username - 用户名（可选）
 * @param params.status - 状态（可选）
 * @param params.pageNum - 页码（可选，默认1）
 * @param params.pageSize - 每页数量（可选，默认10）
 * @returns 用户列表
 * 
 * @example
 * ```typescript
 * const { data } = await fetchUserList({
 *   username: 'admin',
 *   pageNum: 1,
 *   pageSize: 10
 * });
 * ```
 */
export function fetchUserList(params?: Api.System.UserSearchParams) {
  return request<Api.System.User[]>({
    url: '/system/user/list',
    method: 'get',
    params
  });
}
```

### 2. 接口文档生成

使用工具自动生成接口文档：

```bash
# 使用 TypeDoc 生成文档
pnpm add -D typedoc

# 生成文档
npx typedoc --out docs/api src/service/api
```

## Mock 数据

### 1. Mock 配置

```typescript
// mock/user.ts

import type { MockMethod } from 'vite-plugin-mock';

export default [
  {
    url: '/api/system/user/list',
    method: 'get',
    response: () => {
      return {
        code: 200,
        msg: '查询成功',
        rows: [
          {
            userId: 1,
            username: 'admin',
            nickName: '管理员',
            email: 'admin@example.com',
            phonenumber: '13800138000',
            sex: '0',
            status: '0'
          }
        ],
        total: 1
      };
    }
  }
] as MockMethod[];
```

### 2. 启用 Mock

```typescript
// vite.config.ts

import { viteMockServe } from 'vite-plugin-mock';

export default {
  plugins: [
    viteMockServe({
      mockPath: 'mock',
      enable: true
    })
  ]
};
```

## 最佳实践

### 1. 统一错误处理

```typescript
// 在请求拦截器中统一处理错误
onError: (error) => {
  const { response } = error;
  
  if (response) {
    handleHttpError(response.status, response.data);
  } else {
    handleNetworkError();
  }
  
  return Promise.reject(error);
}
```

### 2. 请求重试

```typescript
import axiosRetry from 'axios-retry';

axiosRetry(axios, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (error) => {
    return axiosRetry.isNetworkOrIdempotentRequestError(error);
  }
});
```

### 3. 请求缓存

```typescript
// 使用 axios-cache-adapter
import { setupCache } from 'axios-cache-adapter';

const cache = setupCache({
  maxAge: 15 * 60 * 1000 // 15分钟
});

const api = axios.create({
  adapter: cache.adapter
});
```

### 4. 接口版本管理

```typescript
// v1 版本
export function fetchUserListV1(params?: SearchParams) {
  return request({
    url: '/api/v1/users',
    method: 'get',
    params
  });
}

// v2 版本
export function fetchUserListV2(params?: SearchParams) {
  return request({
    url: '/api/v2/users',
    method: 'get',
    params
  });
}
```

### 5. 接口权限控制

```typescript
// 在请求拦截器中添加权限验证
onRequest: (config) => {
  const token = localStg.get('token');
  const permissions = localStg.get('permissions');
  
  // 检查接口权限
  if (config.url && !hasPermission(config.url, permissions)) {
    return Promise.reject(new Error('无权限访问'));
  }
  
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  return config;
}
```

## 下一步

- 查看 [设计模式](./05-设计模式.md)
- 学习 [最佳实践](./06-最佳实践.md)
- 阅读 [性能优化](./07-性能优化.md)
