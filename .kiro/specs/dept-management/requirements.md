# 需求文档 - 部门管理

## 简介

部门管理是系统管理模块的核心功能之一，用于管理企业组织架构中的部门信息。该功能支持部门的树形结构展示、增删改查操作、状态管理以及权限控制，为用户管理和权限分配提供组织架构基础。

## 术语表

- **System**: 若依Plus-Soybean管理系统
- **Dept**: 部门实体，包含部门的所有信息
- **DeptTree**: 部门树形结构组件
- **DeptOperateDrawer**: 部门操作抽屉组件（用于新增和编辑）
- **DeptSearch**: 部门搜索组件
- **User**: 系统用户
- **Administrator**: 系统管理员
- **ParentDept**: 上级部门
- **ChildDept**: 子部门
- **Status**: 部门状态（0-正常，1-停用）

## 需求

### 需求 1: 部门列表展示

**用户故事:** 作为系统管理员，我希望能够查看所有部门的树形列表，以便了解组织架构的层级关系。

#### 验收标准

1. WHEN 用户访问部门管理页面 THEN THE System SHALL 以树形结构展示所有部门列表
2. WHEN 部门列表加载 THEN THE System SHALL 显示部门名称、排序号、负责人、联系电话、状态等关键信息
3. THE System SHALL 支持展开所有节点和折叠所有节点的操作
4. WHEN 部门有子部门 THEN THE System SHALL 在该部门节点显示展开/折叠图标
5. THE System SHALL 按照 orderNum 字段对同级部门进行排序显示

### 需求 2: 部门搜索

**用户故事:** 作为系统管理员，我希望能够快速搜索部门，以便在大量部门中快速定位目标部门。

#### 验收标准

1. WHEN 用户输入部门名称 THEN THE System SHALL 返回名称匹配的部门列表
2. WHEN 用户选择状态筛选条件 THEN THE System SHALL 返回符合状态条件的部门列表
3. WHEN 用户同时使用多个搜索条件 THEN THE System SHALL 返回同时满足所有条件的部门列表
4. WHEN 用户清空搜索条件 THEN THE System SHALL 重新显示完整的部门列表
5. THE System SHALL 在搜索结果中保持树形结构展示

### 需求 3: 部门新增

**用户故事:** 作为系统管理员，我希望能够新增部门，以便扩展组织架构。

#### 验收标准

1. WHEN 用户点击新增按钮 THEN THE System SHALL 打开部门操作抽屉
2. WHEN 用户填写部门信息并提交 THEN THE System SHALL 验证必填字段（上级部门、部门名称、排序号）
3. WHEN 必填字段验证通过 THEN THE System SHALL 调用后端API创建新部门
4. WHEN 部门创建成功 THEN THE System SHALL 关闭抽屉并刷新部门列表
5. WHEN 用户填写联系电话 THEN THE System SHALL 验证电话号码格式
6. WHEN 用户填写邮箱 THEN THE System SHALL 验证邮箱格式
7. THE System SHALL 允许用户选择上级部门（支持树形选择）
8. THE System SHALL 允许用户设置部门状态（正常/停用）

### 需求 4: 部门编辑

**用户故事:** 作为系统管理员，我希望能够编辑部门信息，以便更新组织架构变更。

#### 验收标准

1. WHEN 用户点击编辑按钮 THEN THE System SHALL 打开部门操作抽屉并加载当前部门数据
2. WHEN 用户修改部门信息并提交 THEN THE System SHALL 验证必填字段
3. WHEN 验证通过 THEN THE System SHALL 调用后端API更新部门信息
4. WHEN 部门更新成功 THEN THE System SHALL 关闭抽屉并刷新部门列表
5. WHEN 用户选择上级部门 THEN THE System SHALL 排除当前部门及其所有子部门（防止循环引用）
6. WHEN 用户修改部门状态为停用 THEN THE System SHALL 允许该操作
7. THE System SHALL 保持部门ID不可修改

### 需求 5: 部门删除

**用户故事:** 作为系统管理员，我希望能够删除不再使用的部门，以便保持组织架构的整洁。

#### 验收标准

1. WHEN 用户点击删除按钮 THEN THE System SHALL 显示确认对话框
2. WHEN 用户确认删除 THEN THE System SHALL 调用后端API删除部门
3. WHEN 部门删除成功 THEN THE System SHALL 刷新部门列表
4. IF 部门存在子部门 THEN THE System SHALL 阻止删除操作并提示用户
5. IF 部门下存在用户 THEN THE System SHALL 阻止删除操作并提示用户
6. THE System SHALL 支持批量删除多个部门

### 需求 6: 部门状态管理

**用户故事:** 作为系统管理员，我希望能够启用或停用部门，以便灵活管理组织架构的有效性。

#### 验收标准

1. WHEN 部门状态为正常 THEN THE System SHALL 在列表中显示"正常"标签
2. WHEN 部门状态为停用 THEN THE System SHALL 在列表中显示"停用"标签
3. WHEN 用户修改部门状态 THEN THE System SHALL 立即更新数据库
4. WHEN 部门被停用 THEN THE System SHALL 在用户选择上级部门时仍然显示该部门
5. THE System SHALL 使用字典代码 sys_normal_disable 来翻译状态显示

### 需求 7: 部门树形选择

**用户故事:** 作为系统管理员，在新增或编辑部门时，我希望能够通过树形结构选择上级部门，以便直观地理解部门层级关系。

#### 验收标准

1. WHEN 用户点击上级部门选择框 THEN THE System SHALL 显示部门树形选择器
2. THE System SHALL 以树形结构展示所有可选的部门
3. WHEN 用户选择某个部门 THEN THE System SHALL 将该部门设置为上级部门
4. WHILE 编辑部门时 THEN THE System SHALL 排除当前部门及其所有子部门
5. THE System SHALL 支持搜索功能快速定位部门

### 需求 8: 权限控制

**用户故事:** 作为系统架构师，我希望部门管理功能集成权限控制，以便只有授权用户才能执行相应操作。

#### 验收标准

1. WHEN 用户没有 system:dept:add 权限 THEN THE System SHALL 隐藏新增按钮
2. WHEN 用户没有 system:dept:edit 权限 THEN THE System SHALL 隐藏编辑按钮
3. WHEN 用户没有 system:dept:remove 权限 THEN THE System SHALL 隐藏删除按钮
4. WHEN 用户没有 system:dept:query 权限 THEN THE System SHALL 拒绝访问部门管理页面
5. THE System SHALL 在后端API层面也进行权限验证

### 需求 9: 数据验证

**用户故事:** 作为系统管理员，我希望系统能够验证输入数据的有效性，以便确保数据质量。

#### 验收标准

1. WHEN 用户提交部门表单 THEN THE System SHALL 验证上级部门为必填项
2. WHEN 用户提交部门表单 THEN THE System SHALL 验证部门名称为必填项
3. WHEN 用户提交部门表单 THEN THE System SHALL 验证排序号为必填项且为数字
4. WHEN 用户输入联系电话 THEN THE System SHALL 验证电话号码格式
5. WHEN 用户输入邮箱 THEN THE System SHALL 验证邮箱格式
6. WHEN 验证失败 THEN THE System SHALL 显示具体的错误提示信息
7. WHEN 验证失败 THEN THE System SHALL 阻止表单提交

### 需求 10: 国际化支持

**用户故事:** 作为国际化系统的用户，我希望部门管理界面支持多语言，以便使用我熟悉的语言操作系统。

#### 验收标准

1. THE System SHALL 支持中文和英文两种语言
2. WHEN 用户切换系统语言 THEN THE System SHALL 更新部门管理界面的所有文本
3. THE System SHALL 翻译字段标签（部门名称、排序号、负责人等）
4. THE System SHALL 翻译按钮文本（新增、编辑、删除等）
5. THE System SHALL 翻译验证错误消息
6. THE System SHALL 翻译状态标签（正常、停用）

### 需求 11: 响应式布局

**用户故事:** 作为移动设备用户，我希望部门管理界面能够适配不同屏幕尺寸，以便在各种设备上使用。

#### 验收标准

1. WHEN 用户在桌面端访问 THEN THE System SHALL 显示完整的表格列和操作按钮
2. WHEN 用户在移动端访问 THEN THE System SHALL 调整布局以适应小屏幕
3. THE System SHALL 在小屏幕上保持核心功能可用
4. THE System SHALL 确保抽屉组件在移动端正常显示和操作
5. THE System SHALL 确保树形选择器在移动端可用

### 需求 12: 性能优化

**用户故事:** 作为系统管理员，我希望部门管理功能响应迅速，以便高效完成工作。

#### 验收标准

1. WHEN 部门列表包含大量数据 THEN THE System SHALL 在2秒内完成加载
2. THE System SHALL 使用虚拟滚动技术处理大量部门数据
3. WHEN 用户展开或折叠节点 THEN THE System SHALL 立即响应
4. THE System SHALL 缓存已加载的部门数据
5. WHEN 用户执行搜索 THEN THE System SHALL 在1秒内返回结果
