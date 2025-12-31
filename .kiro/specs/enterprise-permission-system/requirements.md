# 企业权限管理系统需求文档

## 项目概述

### 系统名称和目标
**系统名称：** 企业权限管理系统 (Enterprise Permission Management System)

**系统目标：** 构建一个支持多级组织架构的企业级权限管理系统，实现用户、角色、部门、菜单权限的统一管理，支持多公司、多项目的复杂业务场景。

### 核心功能概述
- 多级公司组织架构管理
- 用户生命周期管理和身份认证
- 基于角色的访问控制 (RBAC)
- 细粒度菜单和功能权限控制
- 数据范围权限管理
- 部门层级管理
- 项目与公司关联管理

### 适用场景
- 大型企业集团的统一权限管理
- 多子公司、多部门的复杂组织架构
- 需要精细化权限控制的业务系统
- 支持多项目协作的企业环境

## 业务需求分析

### 用户角色定义
- **系统用户 (user_type=0)：** 普通业务用户，具有基本的系统访问权限
- **管理员 (user_type=1)：** 系统管理员，具有用户管理、权限配置等高级权限
- **部门负责人：** 部门管理者，具有本部门及下级部门的数据访问权限

### 关键业务流程
1. **用户注册与激活流程**
2. **用户登录与身份验证流程**
3. **权限授予与回收流程**
4. **数据访问权限验证流程**
5. **组织架构变更流程**

### 数据权限模型说明
系统采用四级数据权限模型：
1. **全部数据权限 (data_scope=1)：** 可访问所有数据
2. **自定数据权限 (data_scope=2)：** 可访问指定范围的数据
3. **本部门数据权限 (data_scope=3)：** 仅可访问本部门数据
4. **本部门及以下数据权限 (data_scope=4)：** 可访问本部门及下级部门数据

## Glossary

- **System：** 企业权限管理系统
- **User：** 系统用户
- **Company：** 公司实体
- **Department：** 部门实体
- **Role：** 角色实体
- **Menu：** 菜单实体
- **Project：** 项目实体
- **Administrator：** 系统管理员
- **Data_Scope：** 数据访问范围

## Requirements

### Requirement 1: 公司管理模块

**User Story：** 作为系统管理员，我希望管理多级公司组织架构，以便支持复杂的企业集团结构。

#### Acceptance Criteria

1. WHEN 管理员创建新公司 THEN THE System SHALL 生成唯一的公司编码和路径标识
2. WHEN 管理员设置公司层级关系 THEN THE System SHALL 维护完整的公司路径信息
3. WHEN 管理员修改公司状态 THEN THE System SHALL 更新公司状态并记录操作日志
4. WHEN 管理员查询公司信息 THEN THE System SHALL 返回包含联系方式、地址等完整信息
5. THE System SHALL 支持公司信息的增删改查操作

### Requirement 2: 用户管理模块

**User Story：** 作为系统管理员，我希望管理用户的完整生命周期，以便控制系统访问权限。

#### Acceptance Criteria

1. WHEN 管理员创建用户 THEN THE System SHALL 生成唯一用户编码并设置初始状态
2. WHEN 用户登录系统 THEN THE System SHALL 验证用户凭据并记录登录信息
3. WHEN 管理员修改用户状态 THEN THE System SHALL 更新用户状态并影响其访问权限
4. WHEN 用户登录成功 THEN THE System SHALL 记录登录IP和登录时间
5. THE System SHALL 支持用户类型区分（系统用户和管理员）
6. THE System SHALL 安全存储用户密码信息

### Requirement 3: 部门管理模块

**User Story：** 作为系统管理员，我希望管理部门层级结构，以便实现基于部门的数据权限控制。

#### Acceptance Criteria

1. WHEN 管理员创建部门 THEN THE System SHALL 建立部门层级关系并维护祖级列表
2. WHEN 管理员指定部门负责人 THEN THE System SHALL 记录负责人信息并建立关联
3. WHEN 管理员查询部门信息 THEN THE System SHALL 返回包含联系方式的完整部门信息
4. WHEN 管理员关联用户到部门 THEN THE System SHALL 建立用户部门关系
5. THE System SHALL 支持部门与公司的关联管理

### Requirement 4: 角色权限管理模块

**User Story：** 作为系统管理员，我希望定义角色和权限，以便实现基于角色的访问控制。

#### Acceptance Criteria

1. WHEN 管理员创建角色 THEN THE System SHALL 生成角色并设置权限字符串
2. WHEN 管理员配置数据范围 THEN THE System SHALL 设置角色的数据访问权限级别
3. WHEN 管理员分配角色给用户 THEN THE System SHALL 建立用户角色关系
4. WHEN 管理员关联角色到部门 THEN THE System SHALL 建立角色部门关系
5. THE System SHALL 支持角色状态管理和显示顺序设置
6. THE System SHALL 支持菜单树和部门树的关联显示控制

### Requirement 5: 菜单权限管理模块

**User Story：** 作为系统管理员，我希望管理菜单权限，以便控制用户的功能访问权限。

#### Acceptance Criteria

1. WHEN 管理员创建菜单 THEN THE System SHALL 支持目录、菜单、按钮三种类型
2. WHEN 管理员设置菜单层级 THEN THE System SHALL 维护菜单的父子关系
3. WHEN 管理员配置路由信息 THEN THE System SHALL 设置路由地址、组件路径和参数
4. WHEN 管理员设置权限标识 THEN THE System SHALL 配置菜单的权限字符串
5. THE System SHALL 支持菜单的显示/隐藏状态控制
6. THE System SHALL 支持外链菜单和缓存设置

### Requirement 6: 项目管理模块

**User Story：** 作为系统管理员，我希望管理项目信息，以便实现项目与公司的关联管理。

#### Acceptance Criteria

1. WHEN 管理员创建项目 THEN THE System SHALL 生成项目编码和基本信息
2. WHEN 管理员关联项目到公司 THEN THE System SHALL 建立项目公司关系
3. WHEN 管理员修改项目状态 THEN THE System SHALL 更新项目状态信息
4. THE System SHALL 支持项目信息的完整生命周期管理

### Requirement 7: 数据安全与审计

**User Story：** 作为系统管理员，我希望系统具备安全性和可审计性，以便满足企业安全要求。

#### Acceptance Criteria

1. WHEN 用户执行关键操作 THEN THE System SHALL 记录操作人、操作时间等审计信息
2. WHEN 用户登录系统 THEN THE System SHALL 记录登录IP和登录时间
3. THE System SHALL 安全存储用户密码信息
4. THE System SHALL 支持操作日志的查询和追溯

### Requirement 8: 系统性能与扩展性

**User Story：** 作为系统架构师，我希望系统具备良好的性能和扩展性，以便支持大规模企业应用。

#### Acceptance Criteria

1. WHEN 系统查询权限信息 THEN THE System SHALL 通过路径字段优化查询性能
2. WHEN 系统处理大量用户 THEN THE System SHALL 支持高并发访问
3. THE System SHALL 支持水平扩展以适应业务增长
4. THE System SHALL 提供高效的数据权限过滤机制

## 数据模型文档

### 核心表结构说明

#### sys_company (公司表)
- **用途：** 存储公司组织架构信息
- **关键字段：** 
  - `path`: 公司层级路径，支持快速查询子公司
  - `parent_id`: 父公司ID，构建层级关系
- **约束条件：** code字段唯一，path字段用于层级查询优化

#### sys_user (用户表)
- **用途：** 存储用户基本信息和登录状态
- **关键字段：**
  - `user_type`: 用户类型（0系统用户 1管理员）
  - `login_ip`: 最后登录IP，用于安全审计
  - `password`: 密码字段，需要加密存储
- **约束条件：** code字段唯一

#### sys_role (角色表)
- **用途：** 定义系统角色和数据权限范围
- **关键字段：**
  - `data_scope`: 数据范围权限级别
  - `role_key`: 角色权限字符串
- **约束条件：** code字段唯一

#### sys_menu (系统菜单表)
- **用途：** 管理系统菜单和功能权限
- **关键字段：**
  - `menu_type`: 菜单类型（M目录 C菜单 F按钮）
  - `perms`: 权限标识字符串
- **约束条件：** code字段唯一

### 关系映射说明

- **用户-公司关系：** sys_company_user表实现多对多关系
- **用户-部门关系：** sys_user_dept表实现多对多关系
- **用户-角色关系：** sys_user_role表实现多对多关系
- **角色-菜单关系：** sys_role_menu表实现多对多关系
- **角色-部门关系：** sys_role_dept表实现多对多关系

### 枚举值说明

- **状态值：** 0-正常，1-停用
- **用户类型：** 0-系统用户，1-管理员
- **性别：** 0-男，1-女，2-未知
- **菜单类型：** M-目录，C-菜单，F-按钮
- **数据范围：** 1-全部数据权限，2-自定数据权限，3-本部门数据权限，4-本部门及以下数据权限

## 非功能需求

### 性能考虑
- 通过公司路径字段优化层级查询性能
- 使用索引优化用户权限验证查询
- 支持数据权限的高效过滤机制

### 安全性要求
- 密码必须加密存储
- 记录用户登录IP用于安全审计
- 支持操作日志记录和追溯

### 可扩展性说明
- 支持多级公司组织架构扩展
- 支持灵活的角色权限配置
- 支持新的菜单类型和权限模式扩展

## 已识别的问题与建议

### 发现的问题

1. **表名拼写错误：** `sys_company_projrct` 应为 `sys_company_project`
2. **字段定义不完整：** `sys_role_menu` 表中存在空字段定义
3. **主键设计问题：** `sys_user_role` 表使用 `user_id` 作为主键，但该字段应该是外键
4. **缺少外键约束：** 关系表缺少外键约束定义
5. **数据类型不一致：** 某些ID字段在不同表中使用了不同的数据类型

### 改进建议

1. **修正表名拼写错误**
2. **完善字段定义，移除空字段**
3. **重新设计关系表的主键结构**
4. **添加必要的外键约束**
5. **统一ID字段的数据类型**
6. **添加必要的索引以优化查询性能**
7. **考虑添加软删除字段以支持数据恢复**