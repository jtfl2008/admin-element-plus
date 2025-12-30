# 需求文档: 个人中心

## 介绍

个人中心是用户管理自己账号信息的功能模块，允许用户查看和修改个人资料、修改密码、查看登录日志等。本模块与系统管理中的用户管理不同，个人中心是面向普通用户的自助服务功能。

## 术语表

- **System**: 个人中心系统
- **User**: 当前登录的用户
- **Profile**: 用户个人资料
- **Avatar**: 用户头像
- **Password**: 用户密码
- **LoginLog**: 登录日志

## 需求

### 需求 1: 查看个人信息

**用户故事:** 作为一个用户，我想查看我的个人信息，以便了解我的账号详情。

#### 验收标准

1. WHEN 用户访问个人中心页面 THEN THE System SHALL 显示用户的基本信息卡片
2. THE System SHALL 显示以下只读信息：用户账号、所属部门、所属岗位、所属角色、创建时间
3. THE System SHALL 显示以下可编辑信息：用户昵称、手机号码、邮箱、性别
4. THE System SHALL 在页面顶部显示用户头像和昵称
5. WHEN 用户信息加载失败 THEN THE System SHALL 显示友好的错误提示

### 需求 2: 编辑个人资料

**用户故事:** 作为一个用户，我想编辑我的个人资料，以便更新我的联系方式和个人信息。

#### 验收标准

1. WHEN 用户点击编辑按钮 THEN THE System SHALL 将信息卡片切换为编辑模式
2. THE System SHALL 允许用户修改昵称、手机号码、邮箱、性别
3. WHEN 用户输入的手机号码格式不正确 THEN THE System SHALL 显示格式错误提示
4. WHEN 用户输入的邮箱格式不正确 THEN THE System SHALL 显示格式错误提示
5. WHEN 用户昵称为空 THEN THE System SHALL 阻止提交并显示错误提示
6. WHEN 用户点击保存按钮 THEN THE System SHALL 验证所有字段并提交更新
7. WHEN 更新成功 THEN THE System SHALL 显示成功提示并刷新页面数据
8. WHEN 更新失败 THEN THE System SHALL 显示错误提示并保持编辑状态
9. WHEN 用户点击取消按钮 THEN THE System SHALL 恢复原始数据并退出编辑模式

### 需求 3: 上传头像

**用户故事:** 作为一个用户，我想上传我的头像，以便个性化我的账号。

#### 验收标准

1. WHEN 用户点击头像区域 THEN THE System SHALL 打开文件选择对话框
2. THE System SHALL 只允许上传图片格式文件（jpg、jpeg、png、gif）
3. WHEN 用户选择的文件大小超过 2MB THEN THE System SHALL 显示文件过大提示
4. WHEN 用户选择的文件格式不支持 THEN THE System SHALL 显示格式错误提示
5. WHEN 文件上传中 THEN THE System SHALL 显示上传进度
6. WHEN 上传成功 THEN THE System SHALL 更新头像显示并显示成功提示
7. WHEN 上传失败 THEN THE System SHALL 显示错误提示并保持原头像
8. THE System SHALL 支持头像预览功能

### 需求 4: 修改密码

**用户故事:** 作为一个用户，我想修改我的登录密码，以便保护我的账号安全。

#### 验收标准

1. WHEN 用户点击修改密码按钮 THEN THE System SHALL 打开修改密码对话框
2. THE System SHALL 要求用户输入旧密码、新密码、确认新密码
3. WHEN 用户输入的旧密码为空 THEN THE System SHALL 显示必填提示
4. WHEN 用户输入的新密码为空 THEN THE System SHALL 显示必填提示
5. WHEN 用户输入的新密码长度小于 6 位 THEN THE System SHALL 显示长度不足提示
6. WHEN 用户输入的新密码长度大于 20 位 THEN THE System SHALL 显示长度超限提示
7. WHEN 用户输入的确认密码与新密码不一致 THEN THE System SHALL 显示不一致提示
8. WHEN 用户输入的新密码与旧密码相同 THEN THE System SHALL 显示不能相同提示
9. WHEN 用户提交修改密码请求 THEN THE System SHALL 验证旧密码是否正确
10. WHEN 旧密码验证失败 THEN THE System SHALL 显示旧密码错误提示
11. WHEN 密码修改成功 THEN THE System SHALL 显示成功提示并关闭对话框
12. WHEN 密码修改失败 THEN THE System SHALL 显示错误提示并保持对话框打开

### 需求 5: 查看登录日志

**用户故事:** 作为一个用户，我想查看我的登录历史记录，以便了解我的账号登录情况。

#### 验收标准

1. WHEN 用户切换到登录日志标签页 THEN THE System SHALL 显示登录日志列表
2. THE System SHALL 显示以下信息：登录时间、登录IP、登录地点、浏览器、操作系统、登录状态
3. THE System SHALL 按登录时间倒序排列日志
4. THE System SHALL 支持分页显示，默认每页 10 条
5. THE System SHALL 使用不同颜色标识登录成功和登录失败
6. WHEN 登录日志加载失败 THEN THE System SHALL 显示错误提示
7. THE System SHALL 提供刷新按钮重新加载日志

### 需求 6: 页面布局和导航

**用户故事:** 作为一个用户，我想有清晰的页面布局和导航，以便快速找到我需要的功能。

#### 验收标准

1. THE System SHALL 使用标签页（Tabs）组织不同功能模块
2. THE System SHALL 包含以下标签页：基本资料、修改密码、登录日志
3. THE System SHALL 在页面顶部显示用户头像和基本信息
4. THE System SHALL 使用卡片（Card）组件组织内容
5. THE System SHALL 提供面包屑导航显示当前位置
6. THE System SHALL 在移动端自适应显示

### 需求 7: 数据验证

**用户故事:** 作为系统开发者，我想确保用户输入的数据符合规范，以便保证数据质量和系统安全。

#### 验收标准

1. THE System SHALL 验证用户昵称长度在 2-20 个字符之间
2. THE System SHALL 验证手机号码符合中国大陆手机号格式（11位数字，1开头）
3. THE System SHALL 验证邮箱符合标准邮箱格式
4. THE System SHALL 验证密码长度在 6-20 个字符之间
5. THE System SHALL 在用户输入时实时显示验证结果
6. THE System SHALL 在提交前进行完整的表单验证
7. WHEN 验证失败 THEN THE System SHALL 阻止提交并高亮显示错误字段

### 需求 8: 权限控制

**用户故事:** 作为系统管理员，我想确保用户只能访问和修改自己的信息，以便保护用户隐私。

#### 验收标准

1. THE System SHALL 只允许用户查看和修改自己的个人信息
2. THE System SHALL 只允许用户查看自己的登录日志
3. THE System SHALL 验证用户身份后才允许访问个人中心
4. WHEN 用户未登录 THEN THE System SHALL 重定向到登录页面
5. WHEN 用户 token 过期 THEN THE System SHALL 提示重新登录

### 需求 9: 性能要求

**用户故事:** 作为一个用户，我想页面加载快速流畅，以便获得良好的使用体验。

#### 验收标准

1. WHEN 用户访问个人中心 THEN THE System SHALL 在 2 秒内完成页面加载
2. WHEN 用户上传头像 THEN THE System SHALL 在 5 秒内完成上传
3. WHEN 用户提交表单 THEN THE System SHALL 在 3 秒内返回结果
4. THE System SHALL 在数据加载时显示加载动画
5. THE System SHALL 在操作执行时显示加载状态

### 需求 10: 错误处理

**用户故事:** 作为一个用户，我想在操作失败时得到清晰的错误提示，以便知道如何解决问题。

#### 验收标准

1. WHEN 网络请求失败 THEN THE System SHALL 显示网络错误提示
2. WHEN 服务器返回错误 THEN THE System SHALL 显示具体的错误信息
3. WHEN 文件上传失败 THEN THE System SHALL 显示上传失败原因
4. WHEN 表单验证失败 THEN THE System SHALL 高亮显示错误字段并显示错误信息
5. THE System SHALL 使用 Element Plus 的 Message 组件显示提示信息
6. THE System SHALL 区分成功、警告、错误等不同类型的提示

## 数据模型

### 用户个人资料 (UserProfile)
```typescript
interface UserProfile {
  userId: number           // 用户ID
  userName: string         // 用户账号（只读）
  nickName: string         // 用户昵称（可编辑）
  deptName?: string        // 部门名称（只读）
  postNames?: string[]     // 岗位名称列表（只读）
  roleNames?: string[]     // 角色名称列表（只读）
  phonenumber?: string     // 手机号码（可编辑）
  email?: string           // 邮箱（可编辑）
  sex: string              // 性别（可编辑）
  avatar?: string          // 头像URL（可编辑）
  createTime?: string      // 创建时间（只读）
}
```

### 登录日志 (LoginLog)
```typescript
interface LoginLog {
  infoId: number           // 日志ID
  userName: string         // 用户账号
  ipaddr: string           // 登录IP
  loginLocation: string    // 登录地点
  browser: string          // 浏览器
  os: string               // 操作系统
  status: '0' | '1'        // 登录状态（0=成功 1=失败）
  msg?: string             // 提示消息
  loginTime: string        // 登录时间
}
```

### 修改密码参数 (ChangePasswordParams)
```typescript
interface ChangePasswordParams {
  oldPassword: string      // 旧密码
  newPassword: string      // 新密码
  confirmPassword: string  // 确认新密码
}
```

### 更新个人资料参数 (UpdateProfileParams)
```typescript
interface UpdateProfileParams {
  nickName: string         // 用户昵称
  phonenumber?: string     // 手机号码
  email?: string           // 邮箱
  sex: string              // 性别
}
```
