# 设计文档: 个人中心

## 概述

个人中心是用户管理自己账号信息的功能模块，提供个人资料查看和编辑、头像上传、密码修改、登录日志查看等功能。本模块采用 Vue 3 + TypeScript + Element Plus 技术栈，使用 Composition API 和响应式设计。

## 架构

### 整体架构

```
个人中心页面 (Profile View)
├── 布局容器 (Layout Container)
│   ├── 用户信息头部 (Profile Header)
│   │   ├── 头像组件 (Avatar Upload)
│   │   └── 基本信息展示
│   └── 标签页容器 (Tabs Container)
│       ├── 基本资料标签页 (Basic Info Tab)
│       │   └── 个人资料表单 (Profile Form)
│       ├── 修改密码标签页 (Change Password Tab)
│       │   └── 密码修改表单 (Password Form)
│       └── 登录日志标签页 (Login Log Tab)
│           └── 日志列表表格 (Log Table)
├── 状态管理 (Pinia Store)
│   └── 用户信息状态
└── 数据服务层 (API Service)
    ├── 个人资料接口
    ├── 头像上传接口
    ├── 密码修改接口
    └── 登录日志接口
```

### 技术栈

- **框架**: Vue 3 (Composition API)
- **语言**: TypeScript
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **HTTP 客户端**: Axios
- **样式**: SCSS
- **表单验证**: Element Plus Form Validation

## 组件和接口

### 1. 个人中心主页面组件

**文件**: `src/views/profile/index.vue`

```typescript
interface ProfileState {
  activeTab: 'basic' | 'password' | 'log'
  loading: boolean
}
```

**职责**:
- 协调各子组件
- 管理标签页切换
- 处理整体布局


### 2. 用户信息头部组件

**文件**: `src/views/profile/components/profile-header.vue`

```typescript
interface ProfileHeaderProps {
  userInfo: UserProfile
  loading?: boolean
}

interface ProfileHeaderEmits {
  (e: 'avatar-change', file: File): void
}
```

**职责**:
- 显示用户头像和基本信息
- 处理头像上传交互
- 显示用户昵称、账号等信息

### 3. 个人资料表单组件

**文件**: `src/views/profile/components/basic-info-form.vue`

```typescript
interface BasicInfoFormProps {
  userInfo: UserProfile
  loading?: boolean
}

interface BasicInfoFormEmits {
  (e: 'submit', data: UpdateProfileParams): void
  (e: 'cancel'): void
}

interface BasicInfoFormState {
  isEditing: boolean
  formData: UpdateProfileParams
  originalData: UpdateProfileParams
}
```

**职责**:
- 显示和编辑个人资料
- 表单验证
- 处理编辑/保存/取消操作
- 区分只读和可编辑字段

### 4. 密码修改表单组件

**文件**: `src/views/profile/components/change-password-form.vue`

```typescript
interface PasswordFormData {
  oldPassword: string
  newPassword: string
  confirmPassword: string
}

interface PasswordFormEmits {
  (e: 'submit', data: PasswordFormData): void
}
```

**职责**:
- 密码修改表单
- 密码强度验证
- 密码匹配验证
- 处理密码修改提交


### 5. 登录日志表格组件

**文件**: `src/views/profile/components/login-log-table.vue`

```typescript
interface LoginLogTableProps {
  loading?: boolean
}

interface LoginLogTableState {
  logList: LoginLog[]
  total: number
  pageNum: number
  pageSize: number
}
```

**职责**:
- 显示登录日志列表
- 分页控制
- 日志状态标识（成功/失败）
- 刷新日志数据

### 6. 头像上传组件

**文件**: `src/views/profile/components/avatar-upload.vue`

```typescript
interface AvatarUploadProps {
  avatar?: string
  size?: number
  disabled?: boolean
}

interface AvatarUploadEmits {
  (e: 'change', file: File): void
  (e: 'success', url: string): void
  (e: 'error', error: Error): void
}
```

**职责**:
- 头像显示和上传
- 文件类型和大小验证
- 上传进度显示
- 头像预览功能

## 数据流设计

### 个人资料编辑数据流

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────┐
│  BasicInfoForm  │────>│   index.vue     │────>│  API Layer  │
│   (表单编辑)     │     │  (状态管理)      │     │  (提交数据)  │
└─────────────────┘     └─────────────────┘     └─────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  刷新用户信息     │
                    │  (更新 Store)    │
                    └──────────────────┘
```

### 头像上传数据流

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────┐
│  AvatarUpload   │────>│   index.vue     │────>│  Upload API │
│   (选择文件)     │     │  (处理上传)      │     │  (上传文件)  │
└─────────────────┘     └─────────────────┘     └─────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  更新头像显示     │
                    │  (更新 Store)    │
                    └──────────────────┘
```

### 密码修改数据流

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────┐
│ PasswordForm    │────>│   index.vue     │────>│  API Layer  │
│   (表单提交)     │     │  (验证处理)      │     │  (修改密码)  │
└─────────────────┘     └─────────────────┘     └─────────────┘
                               │
                               ▼
                    ┌──────────────────┐
                    │  显示成功提示     │
                    │  (可选：重新登录) │
                    └──────────────────┘
```


## API 设计

### 接口定义 (src/service/api/profile.ts)

```typescript
/**
 * 获取个人资料
 */
export function fetchUserProfile() {
  return request<UserProfile>({
    url: '/system/user/profile',
    method: 'get'
  })
}

/**
 * 更新个人资料
 * @param data 更新参数
 */
export function updateUserProfile(data: UpdateProfileParams) {
  return request({
    url: '/system/user/profile',
    method: 'put',
    data
  })
}

/**
 * 上传头像
 * @param file 头像文件
 */
export function uploadAvatar(file: File) {
  const formData = new FormData()
  formData.append('avatarfile', file)
  
  return request<{ imgUrl: string }>({
    url: '/system/user/profile/avatar',
    method: 'post',
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
}

/**
 * 修改密码
 * @param data 密码修改参数
 */
export function changePassword(data: ChangePasswordParams) {
  return request({
    url: '/system/user/profile/updatePwd',
    method: 'put',
    data
  })
}

/**
 * 获取登录日志
 * @param params 查询参数
 */
export function fetchLoginLog(params: PageParams) {
  return request<PageResult<LoginLog>>({
    url: '/system/user/profile/loginLog',
    method: 'get',
    params
  })
}
```

## 类型定义

### 个人中心相关类型 (src/typings/api/profile.d.ts)

```typescript
declare namespace Api.Profile {
  /** 用户个人资料 */
  interface UserProfile {
    userId: number
    userName: string
    nickName: string
    deptName?: string
    postNames?: string[]
    roleNames?: string[]
    phonenumber?: string
    email?: string
    sex: string
    avatar?: string
    createTime?: string
  }

  /** 更新个人资料参数 */
  interface UpdateProfileParams {
    nickName: string
    phonenumber?: string
    email?: string
    sex: string
  }

  /** 修改密码参数 */
  interface ChangePasswordParams {
    oldPassword: string
    newPassword: string
  }

  /** 登录日志 */
  interface LoginLog {
    infoId: number
    userName: string
    ipaddr: string
    loginLocation: string
    browser: string
    os: string
    status: '0' | '1'
    msg?: string
    loginTime: string
  }
}
```


## 表单验证规则

### 个人资料表单验证

```typescript
const profileRules = {
  nickName: [
    { required: true, message: '请输入用户昵称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phonenumber: [
    { 
      pattern: /^1[3-9]\d{9}$/, 
      message: '请输入正确的手机号码', 
      trigger: 'blur' 
    }
  ],
  email: [
    { 
      type: 'email', 
      message: '请输入正确的邮箱地址', 
      trigger: 'blur' 
    }
  ]
}
```

### 密码修改表单验证

```typescript
const passwordRules = {
  oldPassword: [
    { required: true, message: '请输入旧密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value === formData.oldPassword) {
          callback(new Error('新密码不能与旧密码相同'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    { 
      validator: (rule, value, callback) => {
        if (value !== formData.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      }, 
      trigger: 'blur' 
    }
  ]
}
```

### 头像上传验证

```typescript
const avatarValidation = {
  // 允许的文件类型
  allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'],
  
  // 最大文件大小（2MB）
  maxSize: 2 * 1024 * 1024,
  
  // 验证函数
  validate(file: File): { valid: boolean; message?: string } {
    if (!this.allowedTypes.includes(file.type)) {
      return {
        valid: false,
        message: '只能上传 JPG、PNG、GIF 格式的图片'
      }
    }
    
    if (file.size > this.maxSize) {
      return {
        valid: false,
        message: '图片大小不能超过 2MB'
      }
    }
    
    return { valid: true }
  }
}
```


## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1：个人信息显示完整性

*对于任意*用户个人资料数据，页面应该正确显示所有只读字段（用户账号、部门、岗位、角色、创建时间）和可编辑字段（昵称、手机、邮箱、性别），不应出现字段缺失或显示错误。

**验证需求：需求 1.2, 1.3**

### 属性 2：表单编辑状态切换

*对于任意*个人资料表单状态，点击编辑按钮应该进入编辑模式，点击取消按钮应该恢复原始数据并退出编辑模式，点击保存按钮应该验证并提交数据。

**验证需求：需求 2.1, 2.9**

### 属性 3：输入格式验证

*对于任意*用户输入的手机号码和邮箱，系统应该验证格式是否正确，手机号必须是11位数字且以1开头，邮箱必须符合标准邮箱格式，格式错误时显示错误提示。

**验证需求：需求 2.3, 2.4, 7.2, 7.3**

### 属性 4：必填字段验证

*对于任意*表单提交，所有必填字段（昵称、旧密码、新密码）为空时，系统应该阻止提交并显示必填提示。

**验证需求：需求 2.5, 4.3, 4.4**

### 属性 5：字段长度验证

*对于任意*用户输入的昵称和密码，系统应该验证长度是否在规定范围内（昵称2-20字符，密码6-20字符），超出范围时显示长度错误提示。

**验证需求：需求 4.5, 4.6, 7.1, 7.4**

### 属性 6：密码匹配验证

*对于任意*密码修改操作，确认密码必须与新密码一致，新密码不能与旧密码相同，否则显示相应的错误提示。

**验证需求：需求 4.7, 4.8**

### 属性 7：文件上传验证

*对于任意*用户上传的文件，系统应该验证文件类型（只允许jpg、jpeg、png、gif）和文件大小（不超过2MB），验证失败时显示相应的错误提示并阻止上传。

**验证需求：需求 3.2, 3.3, 3.4**

### 属性 8：操作结果反馈

*对于任意*用户操作（更新资料、上传头像、修改密码），操作成功时应该显示成功提示并更新相关数据，操作失败时应该显示错误提示并保持当前状态。

**验证需求：需求 2.7, 2.8, 3.6, 3.7, 4.11, 4.12**

### 属性 9：API错误处理

*对于任意*API请求失败场景（网络错误、服务器错误、数据加载失败），系统应该显示友好的错误提示，不应出现白屏或未处理的异常。

**验证需求：需求 1.5, 5.6, 10.1, 10.2**

### 属性 10：加载状态显示

*对于任意*异步操作（数据加载、文件上传、表单提交），系统应该显示加载状态（加载动画、进度条、禁用按钮），操作完成后恢复正常状态。

**验证需求：需求 3.5, 9.4, 9.5**

### 属性 11：登录日志排序和分页

*对于任意*登录日志数据，系统应该按登录时间倒序排列，支持分页显示（默认每页10条），并使用不同颜色标识成功和失败状态。

**验证需求：需求 5.3, 5.4, 5.5**

### 属性 12：权限和认证验证

*对于任意*用户访问个人中心，系统应该验证用户已登录且token有效，未登录时重定向到登录页，token过期时提示重新登录，用户只能查看和修改自己的信息。

**验证需求：需求 8.1, 8.2, 8.3, 8.4, 8.5**

### 属性 13：响应式布局适配

*对于任意*屏幕尺寸变化，个人中心页面应该自适应显示，移动端使用单列布局，桌面端使用多列布局，所有内容保持可读性和可操作性。

**验证需求：需求 6.6**


## 错误处理

### 1. 网络错误

- **场景**: API 请求失败
- **处理**:
  - 显示网络错误提示
  - 提供重试选项
  - 保持当前页面状态
  - 记录错误日志

### 2. 表单验证错误

- **场景**: 用户输入不符合验证规则
- **处理**:
  - 实时显示验证错误提示
  - 高亮显示错误字段
  - 阻止表单提交
  - 提供修改建议

### 3. 文件上传错误

- **场景**: 文件类型或大小不符合要求
- **处理**:
  - 显示具体的错误原因
  - 阻止文件上传
  - 保持原头像不变
  - 提供文件要求说明

### 4. 密码验证错误

- **场景**: 旧密码错误或新密码不符合要求
- **处理**:
  - 显示具体的错误信息
  - 保持对话框打开
  - 清空密码输入框（可选）
  - 提供密码规则说明

### 5. 权限错误

- **场景**: 用户未登录或token过期
- **处理**:
  - 未登录：重定向到登录页
  - Token过期：显示提示并跳转登录
  - 清除本地存储的用户信息
  - 记录访问日志

## 测试策略

### 单元测试

使用 Vitest 进行组件单元测试：

1. **个人资料表单组件测试**
   - 测试表单渲染和数据绑定
   - 测试编辑模式切换
   - 测试表单验证规则
   - 测试提交和取消操作

2. **密码修改表单组件测试**
   - 测试密码验证规则
   - 测试密码匹配验证
   - 测试提交流程

3. **头像上传组件测试**
   - 测试文件选择
   - 测试文件验证
   - 测试上传进度显示
   - 测试上传成功和失败处理

4. **登录日志表格组件测试**
   - 测试数据加载和显示
   - 测试分页功能
   - 测试排序功能
   - 测试状态标识

### 属性测试

使用 fast-check 进行属性测试（每个测试至少 100 次迭代）：

1. **属性 1 测试**: 生成随机用户资料数据，验证所有字段正确显示
   - **Feature: user-profile, Property 1**: 个人信息显示完整性

2. **属性 2 测试**: 生成随机表单状态，验证编辑模式切换正确
   - **Feature: user-profile, Property 2**: 表单编辑状态切换

3. **属性 3 测试**: 生成随机手机号和邮箱，验证格式验证正确
   - **Feature: user-profile, Property 3**: 输入格式验证

4. **属性 4 测试**: 生成随机表单数据，验证必填字段验证正确
   - **Feature: user-profile, Property 4**: 必填字段验证

5. **属性 5 测试**: 生成随机长度的昵称和密码，验证长度验证正确
   - **Feature: user-profile, Property 5**: 字段长度验证

6. **属性 6 测试**: 生成随机密码组合，验证密码匹配验证正确
   - **Feature: user-profile, Property 6**: 密码匹配验证

7. **属性 7 测试**: 生成随机文件，验证文件上传验证正确
   - **Feature: user-profile, Property 7**: 文件上传验证

8. **属性 8 测试**: 生成随机操作结果，验证反馈显示正确
   - **Feature: user-profile, Property 8**: 操作结果反馈

9. **属性 9 测试**: 生成随机API错误，验证错误处理正确
   - **Feature: user-profile, Property 9**: API错误处理

10. **属性 10 测试**: 生成随机异步操作，验证加载状态显示正确
    - **Feature: user-profile, Property 10**: 加载状态显示

11. **属性 11 测试**: 生成随机登录日志，验证排序和分页正确
    - **Feature: user-profile, Property 11**: 登录日志排序和分页

12. **属性 12 测试**: 生成随机认证状态，验证权限验证正确
    - **Feature: user-profile, Property 12**: 权限和认证验证

13. **属性 13 测试**: 生成随机屏幕尺寸，验证响应式布局正确
    - **Feature: user-profile, Property 13**: 响应式布局适配

### 集成测试

1. **完整工作流测试**
   - 测试页面加载到数据展示
   - 测试编辑资料完整流程
   - 测试上传头像完整流程
   - 测试修改密码完整流程
   - 测试查看登录日志

2. **跨组件交互测试**
   - 测试头像上传后资料更新
   - 测试资料修改后Store更新
   - 测试标签页切换

### 端到端测试

使用 Playwright 或 Cypress：

1. 测试用户登录后访问个人中心
2. 测试编辑个人资料并保存
3. 测试上传头像
4. 测试修改密码
5. 测试查看登录日志
6. 测试响应式布局

### 测试覆盖率目标

- 语句覆盖率: ≥ 80%
- 分支覆盖率: ≥ 75%
- 函数覆盖率: ≥ 80%
- 行覆盖率: ≥ 80%


## 页面布局设计

### 主页面布局

```
+------------------------------------------------------------------+
|                         个人中心                                   |
+------------------------------------------------------------------+
|  面包屑: 首页 / 个人中心                                            |
+------------------------------------------------------------------+
|  +-------------------------------------------------------------+  |
|  |                      用户信息头部                            |  |
|  |  +--------+  用户昵称: 张三                                  |  |
|  |  | 头像   |  用户账号: zhangsan                              |  |
|  |  | [上传] |  所属部门: 研发部                                |  |
|  |  +--------+                                                  |  |
|  +-------------------------------------------------------------+  |
|                                                                    |
|  +-------------------------------------------------------------+  |
|  |  [基本资料] [修改密码] [登录日志]                             |  |
|  +-------------------------------------------------------------+  |
|  |                                                              |  |
|  |  基本资料标签页内容:                                          |  |
|  |  +--------------------------------------------------------+  |  |
|  |  |  只读信息:                                              |  |  |
|  |  |  用户账号: zhangsan                                     |  |  |
|  |  |  所属部门: 研发部                                        |  |  |
|  |  |  所属岗位: 高级工程师                                    |  |  |
|  |  |  所属角色: 普通用户                                      |  |  |
|  |  |  创建时间: 2024-01-01                                   |  |  |
|  |  |                                                         |  |  |
|  |  |  可编辑信息:                          [编辑] [保存] [取消]|  |  |
|  |  |  用户昵称: [张三        ]                               |  |  |
|  |  |  手机号码: [13800138000 ]                               |  |  |
|  |  |  邮箱地址: [zhang@example.com]                          |  |  |
|  |  |  性别: ○男 ○女 ○未知                                    |  |  |
|  |  +--------------------------------------------------------+  |  |
|  |                                                              |  |
|  +-------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### 修改密码标签页

```
+------------------------------------------------------------------+
|  修改密码标签页内容:                                               |
|  +-------------------------------------------------------------+  |
|  |  旧密码: [          ] (密码输入框)                          |  |
|  |  新密码: [          ] (密码输入框)                          |  |
|  |  确认密码: [          ] (密码输入框)                        |  |
|  |                                                             |  |
|  |  密码要求:                                                   |  |
|  |  - 长度在 6-20 个字符之间                                    |  |
|  |  - 新密码不能与旧密码相同                                    |  |
|  |  - 两次输入的新密码必须一致                                  |  |
|  |                                                             |  |
|  |                                    [取消] [确定修改]         |  |
|  +-------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### 登录日志标签页

```
+------------------------------------------------------------------+
|  登录日志标签页内容:                                    [刷新]      |
|  +-------------------------------------------------------------+  |
|  |  登录时间        | 登录IP      | 登录地点 | 浏览器 | 状态    |  |
|  |  2024-01-15 10:30| 192.168.1.1| 北京    | Chrome | 成功 ✓  |  |
|  |  2024-01-14 09:15| 192.168.1.2| 上海    | Firefox| 成功 ✓  |  |
|  |  2024-01-13 14:20| 192.168.1.3| 广州    | Safari | 失败 ✗  |  |
|  +-------------------------------------------------------------+  |
|  [分页组件: 共 50 条，每页 10 条]                                  |
+------------------------------------------------------------------+
```

## 实现注意事项

1. **头像上传**:
   - 使用 Element Plus 的 el-upload 组件
   - 支持拖拽上传和点击上传
   - 显示上传进度
   - 上传前进行文件验证

2. **表单验证**:
   - 使用 Element Plus 的表单验证
   - 实时验证用户输入
   - 提交前进行完整验证
   - 显示友好的错误提示

3. **密码安全**:
   - 密码输入框使用 type="password"
   - 密码传输前进行加密（可选）
   - 修改密码后可选择是否重新登录

4. **响应式设计**:
   - 使用 Element Plus 的栅格系统
   - 移动端优化布局
   - 适配不同屏幕尺寸

5. **状态管理**:
   - 使用 Pinia 管理用户信息
   - 更新资料后同步更新 Store
   - 头像更新后同步更新全局头像显示

6. **权限控制**:
   - 页面访问前验证登录状态
   - Token 过期自动跳转登录
   - 只能查看和修改自己的信息

7. **性能优化**:
   - 图片懒加载
   - 登录日志分页加载
   - 避免不必要的 API 请求

8. **用户体验**:
   - 操作成功/失败有明确提示
   - 加载状态有 loading 提示
   - 表单验证错误有明确提示
   - 支持键盘操作（Enter 提交等）
