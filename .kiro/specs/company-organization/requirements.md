# 需求文档 - 公司管理

## 简介

公司管理模块是企业权限管理系统的核心基础功能，用于管理多级公司组织架构。该模块支持公司的树形结构展示、增删改查操作、状态管理以及层级路径维护，为多公司、多租户的复杂业务场景提供组织架构基础，是部门管理、用户管理和权限控制的前置依赖。

## 术语表

- **System**: 企业权限管理系统
- **Company**: 公司实体，包含公司的所有信息
- **CompanyTree**: 公司树形结构组件
- **CompanyOperateDrawer**: 公司操作抽屉组件（用于新增和编辑）
- **CompanySearch**: 公司搜索组件
- **User**: 系统用户
- **Administrator**: 系统管理员
- **ParentCompany**: 上级公司（母公司）
- **ChildCompany**: 子公司
- **Status**: 公司状态（0-正常，1-停用）
- **CompanyPath**: 公司层级路径，用于快速查询和权限控制
- **CompanyCode**: 公司编码，公司的唯一标识符

## 需求

### 需求 1: 公司列表展示

**用户故事:** 作为系统管理员，我希望能够查看所有公司的树形列表，以便了解企业集团的组织架构层级关系。

#### 验收标准

1. WHEN 用户访问公司管理页面 THEN THE System SHALL 以树形结构展示所有公司列表
2. WHEN 公司列表加载 THEN THE System SHALL 显示公司编码、公司名称、简称、排序号、负责人、联系电话、状态等关键信息
3. THE System SHALL 支持展开所有节点和折叠所有节点的操作
4. WHEN 公司有子公司 THEN THE System SHALL 在该公司节点显示展开/折叠图标
5. THE System SHALL 按照 orderNum 字段对同级公司进行排序显示

### 需求 2: 公司搜索

**用户故事:** 作为系统管理员，我希望能够快速搜索公司，以便在大量公司中快速定位目标公司。

#### 验收标准

1. WHEN 用户输入公司名称 THEN THE System SHALL 返回名称匹配的公司列表
2. WHEN 用户输入公司编码 THEN THE System SHALL 返回编码匹配的公司列表
3. WHEN 用户选择状态筛选条件 THEN THE System SHALL 返回符合状态条件的公司列表
4. WHEN 用户同时使用多个搜索条件 THEN THE System SHALL 返回同时满足所有条件的公司列表
5. WHEN 用户清空搜索条件 THEN THE System SHALL 重新显示完整的公司列表
6. THE System SHALL 在搜索结果中保持树形结构展示

### 需求 3: 公司新增

**用户故事:** 作为系统管理员，我希望能够新增公司，以便扩展企业集团的组织架构。

#### 验收标准

1. WHEN 用户点击新增按钮 THEN THE System SHALL 打开公司操作抽屉
2. WHEN 用户填写公司信息并提交 THEN THE System SHALL 验证必填字段（上级公司、公司编码、公司名称、排序号）
3. WHEN 必填字段验证通过 THEN THE System SHALL 调用后端API创建新公司
4. WHEN 公司创建成功 THEN THE System SHALL 自动生成公司层级路径（path字段）
5. WHEN 公司创建成功 THEN THE System SHALL 关闭抽屉并刷新公司列表
6. WHEN 用户填写联系电话 THEN THE System SHALL 验证电话号码格式
7. WHEN 用户填写邮箱 THEN THE System SHALL 验证邮箱格式
8. THE System SHALL 允许用户选择上级公司（支持树形选择）
9. THE System SHALL 允许用户设置公司状态（正常/停用）
10. THE System SHALL 验证公司编码的唯一性

### 需求 4: 公司编辑

**用户故事:** 作为系统管理员，我希望能够编辑公司信息，以便更新组织架构变更。

#### 验收标准

1. WHEN 用户点击编辑按钮 THEN THE System SHALL 打开公司操作抽屉并加载当前公司数据
2. WHEN 用户修改公司信息并提交 THEN THE System SHALL 验证必填字段
3. WHEN 验证通过 THEN THE System SHALL 调用后端API更新公司信息
4. WHEN 公司更新成功 THEN THE System SHALL 关闭抽屉并刷新公司列表
5. WHEN 用户修改上级公司 THEN THE System SHALL 排除当前公司及其所有子公司（防止循环引用）
6. WHEN 用户修改上级公司 THEN THE System SHALL 重新计算并更新公司层级路径
7. WHEN 用户修改公司状态为停用 THEN THE System SHALL 允许该操作
8. THE System SHALL 保持公司ID不可修改
9. THE System SHALL 验证修改后的公司编码唯一性（排除自身）

### 需求 5: 公司删除

**用户故事:** 作为系统管理员，我希望能够删除不再使用的公司，以便保持组织架构的整洁。

#### 验收标准

1. WHEN 用户点击删除按钮 THEN THE System SHALL 显示确认对话框
2. WHEN 用户确认删除 THEN THE System SHALL 调用后端API删除公司
3. WHEN 公司删除成功 THEN THE System SHALL 刷新公司列表
4. IF 公司存在子公司 THEN THE System SHALL 阻止删除操作并提示用户
5. IF 公司下存在部门 THEN THE System SHALL 阻止删除操作并提示用户
6. IF 公司下存在用户 THEN THE System SHALL 阻止删除操作并提示用户
7. THE System SHALL 支持批量删除多个公司

### 需求 6: 公司状态管理

**用户故事:** 作为系统管理员，我希望能够启用或停用公司，以便灵活管理组织架构的有效性。

#### 验收标准

1. WHEN 公司状态为正常 THEN THE System SHALL 在列表中显示"正常"标签
2. WHEN 公司状态为停用 THEN THE System SHALL 在列表中显示"停用"标签
3. WHEN 用户修改公司状态 THEN THE System SHALL 立即更新数据库
4. WHEN 公司被停用 THEN THE System SHALL 在用户选择上级公司时仍然显示该公司
5. THE System SHALL 使用字典代码 sys_normal_disable 来翻译状态显示

### 需求 7: 公司树形选择

**用户故事:** 作为系统管理员，在新增或编辑公司时，我希望能够通过树形结构选择上级公司，以便直观地理解公司层级关系。

#### 验收标准

1. WHEN 用户点击上级公司选择框 THEN THE System SHALL 显示公司树形选择器
2. THE System SHALL 以树形结构展示所有可选的公司
3. WHEN 用户选择某个公司 THEN THE System SHALL 将该公司设置为上级公司
4. WHILE 编辑公司时 THEN THE System SHALL 排除当前公司及其所有子公司
5. THE System SHALL 支持搜索功能快速定位公司

### 需求 8: 公司层级路径管理

**用户故事:** 作为系统架构师，我希望系统自动维护公司层级路径，以便优化查询性能和实现数据权限控制。

#### 验收标准

1. WHEN 创建新公司 THEN THE System SHALL 根据上级公司路径自动生成完整的层级路径
2. WHEN 修改公司的上级关系 THEN THE System SHALL 重新计算该公司及所有子公司的层级路径
3. THE System SHALL 使用路径格式 "001.001001.001001001" 表示层级关系
4. THE System SHALL 通过路径字段支持快速查询所有子公司
5. THE System SHALL 通过路径字段支持数据权限的范围控制

### 需求 9: 权限控制

**用户故事:** 作为系统架构师，我希望公司管理功能集成权限控制，以便只有授权用户才能执行相应操作。

#### 验收标准

1. WHEN 用户没有 system:company:add 权限 THEN THE System SHALL 隐藏新增按钮
2. WHEN 用户没有 system:company:edit 权限 THEN THE System SHALL 隐藏编辑按钮
3. WHEN 用户没有 system:company:remove 权限 THEN THE System SHALL 隐藏删除按钮
4. WHEN 用户没有 system:company:query 权限 THEN THE System SHALL 拒绝访问公司管理页面
5. THE System SHALL 在后端API层面也进行权限验证

### 需求 10: 数据验证

**用户故事:** 作为系统管理员，我希望系统能够验证输入数据的有效性，以便确保数据质量。

#### 验收标准

1. WHEN 用户提交公司表单 THEN THE System SHALL 验证上级公司为必填项
2. WHEN 用户提交公司表单 THEN THE System SHALL 验证公司编码为必填项
3. WHEN 用户提交公司表单 THEN THE System SHALL 验证公司名称为必填项
4. WHEN 用户提交公司表单 THEN THE System SHALL 验证排序号为必填项且为数字
5. WHEN 用户输入联系电话 THEN THE System SHALL 验证电话号码格式
6. WHEN 用户输入邮箱 THEN THE System SHALL 验证邮箱格式
7. WHEN 用户输入公司编码 THEN THE System SHALL 验证编码长度不超过32个字符
8. WHEN 用户输入公司名称 THEN THE System SHALL 验证名称长度不超过90个字符
9. WHEN 验证失败 THEN THE System SHALL 显示具体的错误提示信息
10. WHEN 验证失败 THEN THE System SHALL 阻止表单提交

### 需求 11: 联系信息管理

**用户故事:** 作为系统管理员，我希望能够记录公司的详细联系信息，以便进行业务沟通和管理。

#### 验收标准

1. THE System SHALL 支持记录公司负责人姓名
2. THE System SHALL 支持记录公司联系电话
3. THE System SHALL 支持记录公司联系邮箱
4. THE System SHALL 支持记录公司详细地址
5. THE System SHALL 在公司列表中显示负责人和联系电话
6. THE System SHALL 在公司详情中显示完整的联系信息

### 需求 12: 性能优化

**用户故事:** 作为系统管理员，我希望公司管理功能响应迅速，以便高效完成工作。

#### 验收标准

1. WHEN 公司列表包含大量数据 THEN THE System SHALL 在2秒内完成加载
2. THE System SHALL 使用虚拟滚动技术处理大量公司数据
3. WHEN 用户展开或折叠节点 THEN THE System SHALL 立即响应
4. THE System SHALL 缓存已加载的公司数据
5. WHEN 用户执行搜索 THEN THE System SHALL 在1秒内返回结果
6. THE System SHALL 通过公司路径字段优化层级查询性能

### 需求 13: 数据导出

**用户故事:** 作为系统管理员，我希望能够导出公司信息，以便进行组织结构分析和报表制作。

#### 验收标准

1. WHEN 管理员点击导出按钮 THEN THE System SHALL 将当前查询条件下的公司列表导出为 Excel 文件
2. THE System SHALL 在导出文件中包含公司编码、公司名称、简称、负责人、联系电话、状态、创建时间等字段
3. WHEN 导出成功 THEN THE System SHALL 触发文件下载
4. WHEN 导出失败 THEN THE System SHALL 显示错误消息
5. THE System SHALL 在导出文件中保持公司的层级关系展示

## 数据模型文档

### 核心表结构说明

#### sys_company (公司表)

**用途：** 存储公司组织架构信息，支持多级公司层级管理

**关键字段：**
- `company_id`: 公司ID，主键
- `company_code`: 公司编码，唯一标识，最大长度32字符
- `company_name`: 公司名称，最大长度90字符
- `short_name`: 公司简称，最大长度30字符
- `parent_id`: 父公司ID，构建层级关系
- `path`: 公司层级路径，格式如 "001.001001.001001001"，用于快速查询和权限控制
- `order_num`: 显示顺序，用于同级公司排序
- `leader`: 负责人姓名
- `phone`: 联系电话
- `email`: 联系邮箱
- `address`: 详细地址
- `status`: 状态（0-正常，1-停用）
- `create_time`: 创建时间
- `update_time`: 更新时间
- `remark`: 备注信息

**约束条件：**
- `company_code` 字段唯一
- `path` 字段用于层级查询优化，需要建立索引
- `parent_id` 外键关联到 `company_id`

### 关系映射说明

- **公司-部门关系：** 部门表（sys_dept）通过 company_id 字段关联到公司
- **公司-用户关系：** sys_company_user 表实现多对多关系
- **公司-项目关系：** sys_company_project 表实现多对多关系

### 枚举值说明

- **状态值：** 0-正常，1-停用

## 非功能需求

### 性能考虑
- 通过公司路径字段优化层级查询性能
- 使用索引优化公司编码和名称的查询
- 支持大量公司数据的虚拟滚动展示
- 缓存公司树形结构数据

### 安全性要求
- 所有操作需要权限验证
- 记录公司信息的创建和修改时间
- 支持操作日志记录和追溯
- 防止循环引用的层级关系

### 可扩展性说明
- 支持无限级公司组织架构扩展
- 路径字段设计支持灵活的层级深度
- 预留字段支持未来功能扩展
- 支持多租户隔离

## 已识别的问题与建议

### 设计考虑

1. **路径字段设计：** 采用点分隔的路径格式（如 "001.001001.001001001"），每级固定长度，便于排序和查询
2. **编码规则：** 建议采用有意义的编码规则，如地区代码+序号
3. **删除策略：** 建议实现软删除，保留历史数据用于审计
4. **缓存策略：** 公司树形结构变化不频繁，适合缓存优化
5. **权限继承：** 公司层级可以作为数据权限控制的基础

### 改进建议

1. **添加公司类型字段：** 区分集团公司、子公司、分公司等类型
2. **添加公司规模字段：** 记录员工数量、注册资本等信息
3. **添加营业执照信息：** 记录统一社会信用代码、营业期限等
4. **添加地理位置信息：** 支持地图展示和地理位置查询
5. **添加公司Logo字段：** 支持公司标识展示
6. **考虑添加软删除字段：** 支持数据恢复和审计追溯
