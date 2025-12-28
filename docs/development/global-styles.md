# 全局样式使用指南

## 概述

项目中的公共样式已提取到全局样式文件中，方便在多个页面中复用，保持统一的视觉风格。

## 页面布局样式

### 文件位置

`src/styles/base/page-layout.scss`

### 可用的 CSS 类

#### 1. 页面容器

```html
<div class="page-container">
  <!-- 页面内容 -->
</div>
```

**样式说明**:
- 内边距: `16px`
- 高度: `100%`
- 自动处理 `el-container` 的高度

#### 2. 侧边栏

```html
<el-aside width="260px" class="page-aside">
  <el-card shadow="hover">
    <template #header>
      <div class="card-header">
        <span>标题</span>
        <el-button>操作</el-button>
      </div>
    </template>
    <!-- 内容 -->
  </el-card>
</el-aside>
```

**样式说明**:
- 右边距: `16px`
- 卡片高度: `100%`
- 卡片内容区域自动滚动
- 卡片头部使用 `card-header` 类实现左右布局

#### 3. 主内容区域

```html
<el-main class="page-main">
  <!-- 查询表单 -->
  <el-card class="query-card">
    <!-- 查询表单内容 -->
  </el-card>

  <!-- 数据表格 -->
  <el-card class="table-card">
    <!-- 表格内容 -->
  </el-card>
</el-main>
```

**样式说明**:
- 使用 `flex` 布局，垂直排列
- 卡片间距: `16px`
- `query-card`: 高度自适应内容
- `table-card`: 占据剩余空间，自动处理溢出

#### 4. 树形节点

```html
<el-tree>
  <template #default="{ node }">
    <span class="custom-tree-node">
      <el-icon><OfficeBuilding /></el-icon>
      <span>{{ node.label }}</span>
    </span>
  </template>
</el-tree>
```

**样式说明**:
- 图标和文本水平排列
- 间距: `6px`

## 响应式设计

全局样式已包含响应式断点:

### 移动端 (≤768px)

- 页面内边距减小为 `8px`
- 容器改为垂直布局
- 侧边栏宽度变为 `100%`
- 侧边栏最大高度限制为 `300px`
- 卡片间距减小为 `12px`

## 使用示例

### 完整的页面布局

```vue
<template>
  <div class="page-container">
    <el-container>
      <!-- 左侧树形菜单 -->
      <el-aside width="260px" class="page-aside">
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>部门列表</span>
              <el-button type="primary" :icon="Refresh" circle size="small" />
            </div>
          </template>
          
          <el-tree :data="treeData">
            <template #default="{ node }">
              <span class="custom-tree-node">
                <el-icon><Folder /></el-icon>
                <span>{{ node.label }}</span>
              </span>
            </template>
          </el-tree>
        </el-card>
      </el-aside>

      <!-- 右侧主内容 -->
      <el-main class="page-main">
        <!-- 查询表单 -->
        <el-card class="query-card">
          <ConfigurableForm
            v-model="queryForm"
            :fields="queryFields"
            @on-query="handleQuery"
          />
        </el-card>

        <!-- 数据表格 -->
        <el-card class="table-card">
          <ConfigurableTable
            :data="tableData"
            :columns="columns"
          />
        </el-card>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
// 无需添加任何样式
</script>
```

## 自定义样式

如果需要在特定页面添加自定义样式，可以使用 scoped 样式:

```vue
<style scoped lang="scss">
// 页面特有的样式
.custom-feature {
  // 自定义样式
}
</style>
```

## 注意事项

1. **优先使用全局样式类**: 避免重复定义相同的样式
2. **保持一致性**: 新页面应遵循相同的布局模式
3. **响应式优先**: 全局样式已处理响应式，无需额外编写
4. **避免覆盖**: 不要在页面中覆盖全局样式，如需修改请更新全局样式文件

## 扩展全局样式

如需添加新的全局样式:

1. 编辑 `src/styles/base/page-layout.scss`
2. 添加新的 CSS 类
3. 更新本文档
4. 在相关页面中使用新类

## 相关文件

- 全局样式入口: `src/styles/index.scss`
- 页面布局样式: `src/styles/base/page-layout.scss`
- 示例页面: `src/views/system/user/index.vue`
