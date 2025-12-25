# 设计文档 - 布局系统

## 概述

本设计文档描述了 RuoYi-Plus-Soybean 项目布局系统的实现方案。布局系统是前端应用的核心基础设施，负责组织页面的整体结构、管理导航菜单、标签页和主题配置等功能。系统支持多种布局模式（垂直、水平、混合），提供灵活的配置选项和良好的用户体验。

### 设计目标

1. **灵活性**：支持多种布局模式，满足不同用户的使用习惯
2. **可配置性**：提供丰富的配置选项，支持个性化定制
3. **响应式**：适配不同设备尺寸，提供一致的用户体验
4. **性能优化**：确保布局系统高效运行，不影响应用性能
5. **可访问性**：支持键盘导航和屏幕阅读器，提升可用性

## 架构设计

### 整体架构

布局系统采用组件化设计，将布局拆分为多个独立的可复用组件：

```
┌─────────────────────────────────────────────────────────┐
│                    Layout Container                      │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Global Header                        │  │
│  │  Logo | Collapse | Breadcrumb | Search | Actions │  │
│  └───────────────────────────────────────────────────┘  │
│  ┌──────────┬────────────────────────────────────────┐  │
│  │  Global  │         Main Content Area              │  │
│  │  Sider   │  ┌──────────────────────────────────┐  │  │
│  │          │  │      Global Tab                  │  │  │
│  │  ┌────┐  │  ├──────────────────────────────────┤  │  │
│  │  │Menu│  │  │                                  │  │  │
│  │  │    │  │  │      Page Content                │  │  │
│  │  │    │  │  │      <router-view />             │  │  │
│  │  └────┘  │  │                                  │  │  │
│  │          │  └──────────────────────────────────┘  │  │
│  └──────────┴────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────┐  │
│  │              Global Footer                        │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 布局模式

#### 1. 垂直布局（Vertical Layout）

```
┌─────────────────────────────────────┐
│         Header (Logo + Actions)     │
├──────────┬──────────────────────────┤
│  Sider   │    Main Content          │
│  (Menu)  │    (Tab + Page)          │
│          │                          │
└──────────┴──────────────────────────┘
```

**最小宽度**: 1280px

#### 2. 水平布局（Horizontal Layout）

```
┌─────────────────────────────────────┐
│         Header (Logo + Menu)        │
├─────────────────────────────────────┤
│         Main Content                │
│         (Tab + Page)                │
│                                     │
└─────────────────────────────────────┘
```

**最小宽度**: 1280px

#### 3. 混合布局（Mix Layout）

```
┌─────────────────────────────────────┐
│    Header (Logo + Top Menu)         │
├──────────┬──────────────────────────┤
│  Sider   │    Main Content          │
│  (Sub    │    (Tab + Page)          │
│  Menu)   │                          │
└──────────┴──────────────────────────┘
```

**最小宽度**: 1280px

**注意**: 本版本仅支持桌面环境（Desktop），暂不支持移动端和平板端适配。

### 目录结构

```
src/layouts/
├── default/                    # 默认布局容器
│   └── index.vue
├── horizontal/                 # 水平布局容器
│   └── index.vue
├── mix/                        # 混合布局容器
│   └── index.vue
├── blank/                      # 空白布局（已存在）
│   └── index.vue
└── modules/                    # 布局模块组件
    ├── global-header/          # 全局头部
    │   ├── index.vue
    │   ├── components/
    │   │   ├── logo.vue
    │   │   ├── collapse-button.vue
    │   │   ├── breadcrumb.vue
    │   │   ├── search.vue
    │   │   ├── fullscreen.vue
    │   │   ├── theme-button.vue
    │   │   ├── notice.vue
    │   │   └── user-center.vue
    │   └── index.ts
    ├── global-sider/           # 全局侧边栏
    │   ├── index.vue
    │   ├── components/
    │   │   ├── logo.vue
    │   │   └── menu.vue
    │   └── index.ts
    ├── global-menu/            # 全局菜单
    │   ├── index.vue
    │   ├── components/
    │   │   ├── menu-item.vue
    │   │   └── sub-menu.vue
    │   └── index.ts
    ├── global-tab/             # 全局标签页
    │   ├── index.vue
    │   ├── components/
    │   │   ├── tab-item.vue
    │   │   └── context-menu.vue
    │   └── index.ts
    ├── global-breadcrumb/      # 全局面包屑
    │   └── index.vue
    ├── global-footer/          # 全局页脚
    │   └── index.vue
    └── theme-drawer/           # 主题抽屉
        ├── index.vue
        ├── components/
        │   ├── theme-mode.vue
        │   ├── theme-color.vue
        │   ├── layout-mode.vue
        │   └── layout-config.vue
        └── index.ts
```

## 组件和接口设计

### 1. 布局容器组件

#### Default Layout

```typescript
// layouts/default/index.vue

interface DefaultLayoutProps {
  // 无需 props，从 store 读取配置
}

interface DefaultLayoutEmits {
  // 无需 emits
}

// 组件结构
<template>
  <div class="layout-default" :class="layoutClasses">
    <GlobalHeader v-if="showHeader" />
    <div class="layout-container">
      <GlobalSider v-if="showSider" />
      <div class="layout-main">
        <GlobalTab v-if="showTab" />
        <div class="layout-content">
          <GlobalBreadcrumb v-if="showBreadcrumb" />
          <router-view v-slot="{ Component }">
            <transition name="fade-slide" mode="out-in">
              <keep-alive :include="cachedViews">
                <component :is="Component" :key="route.path" />
              </keep-alive>
            </transition>
          </router-view>
        </div>
      </div>
    </div>
    <GlobalFooter v-if="showFooter" />
    <ThemeDrawer />
  </div>
</template>
```

### 2. 全局头部组件

```typescript
// layouts/modules/global-header/index.vue

interface GlobalHeaderProps {
  fixed?: boolean;  // 是否固定头部
}

interface GlobalHeaderEmits {
  'toggle-sidebar': () => void;
  'toggle-fullscreen': () => void;
}

// 组件结构
<template>
  <header class="global-header" :class="{ fixed: fixed }">
    <div class="header-left">
      <Logo v-if="showLogo" />
      <CollapseButton @click="handleCollapse" />
      <Breadcrumb v-if="isVerticalLayout" />
    </div>
    <div class="header-center">
      <Menu v-if="isHorizontalLayout" mode="horizontal" />
    </div>
    <div class="header-right">
      <Search />
      <Fullscreen @toggle="handleFullscreen" />
      <ThemeButton />
      <Notice />
      <UserCenter />
    </div>
  </header>
</template>
```

### 3. 全局侧边栏组件

```typescript
// layouts/modules/global-sider/index.vue

interface GlobalSiderProps {
  collapsed?: boolean;  // 折叠状态
  width?: number;       // 展开宽度
  collapsedWidth?: number;  // 折叠宽度
}

interface GlobalSiderEmits {
  'update:collapsed': (value: boolean) => void;
}

// 组件结构
<template>
  <aside 
    class="global-sider" 
    :class="{ collapsed }"
    :style="siderStyle"
  >
    <div class="sider-logo">
      <Logo :collapsed="collapsed" />
    </div>
    <div class="sider-menu">
      <Menu mode="vertical" :collapsed="collapsed" />
    </div>
  </aside>
</template>
```

### 4. 全局菜单组件

```typescript
// layouts/modules/global-menu/index.vue

interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  hidden?: boolean;
}

interface GlobalMenuProps {
  mode: 'vertical' | 'horizontal';  // 菜单模式
  collapsed?: boolean;               // 是否折叠（仅垂直模式）
  items: MenuItem[];                 // 菜单数据
}

interface GlobalMenuEmits {
  'select': (key: string) => void;
}

// 组件结构
<template>
  <el-menu
    :mode="mode"
    :collapse="collapsed && mode === 'vertical'"
    :default-active="activeKey"
    @select="handleSelect"
  >
    <template v-for="item in visibleItems" :key="item.key">
      <SubMenu v-if="item.children?.length" :item="item" />
      <MenuItem v-else :item="item" />
    </template>
  </el-menu>
</template>
```

### 5. 全局标签页组件

```typescript
// layouts/modules/global-tab/index.vue

interface TabItem {
  key: string;
  label: string;
  path: string;
  closable: boolean;
  affix?: boolean;
}

interface GlobalTabProps {
  // 从 Tab Store 读取数据
}

interface GlobalTabEmits {
  'change': (key: string) => void;
  'close': (key: string) => void;
}

// 组件结构
<template>
  <div class="global-tab">
    <div class="tab-list" ref="tabListRef">
      <TabItem
        v-for="tab in tabs"
        :key="tab.key"
        :tab="tab"
        :active="tab.key === activeKey"
        @click="handleTabClick(tab)"
        @close="handleTabClose(tab)"
        @contextmenu="handleContextMenu($event, tab)"
      />
    </div>
    <div class="tab-actions">
      <el-dropdown @command="handleCommand">
        <el-icon><MoreFilled /></el-icon>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="refresh">刷新当前</el-dropdown-item>
            <el-dropdown-item command="close">关闭当前</el-dropdown-item>
            <el-dropdown-item command="close-other">关闭其他</el-dropdown-item>
            <el-dropdown-item command="close-all">关闭所有</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
    <ContextMenu
      v-if="contextMenuVisible"
      :x="contextMenuX"
      :y="contextMenuY"
      :tab="contextMenuTab"
      @close="contextMenuVisible = false"
    />
  </div>
</template>
```

### 6. 主题抽屉组件

```typescript
// layouts/modules/theme-drawer/index.vue

interface ThemeConfig {
  themeMode: 'light' | 'dark';
  themeColor: string;
  layoutMode: 'vertical' | 'horizontal' | 'mix';
  sidebarWidth: number;
  showTab: boolean;
  showBreadcrumb: boolean;
  showFooter: boolean;
  fixedHeader: boolean;
  fixedSidebar: boolean;
}

interface ThemeDrawerProps {
  visible: boolean;
}

interface ThemeDrawerEmits {
  'update:visible': (value: boolean) => void;
}

// 组件结构
<template>
  <el-drawer
    v-model="drawerVisible"
    title="主题配置"
    direction="rtl"
    size="300px"
  >
    <div class="theme-drawer-content">
      <ThemeMode v-model="config.themeMode" />
      <ThemeColor v-model="config.themeColor" />
      <LayoutMode v-model="config.layoutMode" />
      <LayoutConfig v-model="config" />
      
      <div class="drawer-actions">
        <el-button @click="handleReset">重置为默认</el-button>
        <el-button type="primary" @click="handleCopy">复制配置</el-button>
      </div>
    </div>
  </el-drawer>
</template>
```

## 数据模型

### 布局配置模型

```typescript
// typings/layout.d.ts

// 布局模式
type LayoutMode = 'vertical' | 'horizontal' | 'mix';

// 设备类型（仅支持 desktop）
type DeviceType = 'desktop';

// 布局配置
interface LayoutConfig {
  layoutMode: LayoutMode;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  collapsedWidth: number;
  showTab: boolean;
  showBreadcrumb: boolean;
  showFooter: boolean;
  fixedHeader: boolean;
  fixedSidebar: boolean;
  enableAnimation: boolean;
  minWidth: number;  // 最小窗口宽度，默认 1280px
}

// 菜单项
interface MenuItem {
  key: string;
  label: string;
  icon?: string;
  path?: string;
  children?: MenuItem[];
  hidden?: boolean;
  disabled?: boolean;
  badge?: string | number;
}

// 标签页项
interface TabItem {
  key: string;
  label: string;
  path: string;
  closable: boolean;
  affix?: boolean;
  query?: Record<string, any>;
}

// 面包屑项
interface BreadcrumbItem {
  label: string;
  path?: string;
}
```

### App Store 扩展

```typescript
// stores/modules/app.ts

interface AppState {
  // 现有状态
  sidebarCollapsed: boolean;
  device: DeviceType;
  theme: 'light' | 'dark';
  
  // 新增布局配置
  layoutConfig: LayoutConfig;
}

interface AppStore extends AppState {
  // 现有方法
  toggleSidebar: () => void;
  setDevice: (device: DeviceType) => void;
  setTheme: (theme: 'light' | 'dark') => void;
  
  // 新增方法
  setLayoutMode: (mode: LayoutMode) => void;
  updateLayoutConfig: (config: Partial<LayoutConfig>) => void;
  resetLayoutConfig: () => void;
  getLayoutConfig: () => LayoutConfig;
}
```

## 正确性属性

正确性属性是系统应该满足的特征或行为，这些属性在所有有效执行中都应该成立。

### 属性 1: 布局模式切换一致性

*对于任意* 有效的布局模式（vertical、horizontal、mix），当用户切换到该模式时，界面应该立即应用对应的布局结构，且布局配置应该被持久化到 localStorage。

**验证需求: 1.3, 1.4**

### 属性 2: 侧边栏状态同步一致性

*对于任意* 侧边栏折叠/展开操作，App Store 的 sidebarCollapsed 状态、Global Sider 组件的显示状态和 localStorage 中的持久化状态应该保持一致。

**验证需求: 3.6**

### 属性 3: 菜单权限过滤正确性

*对于任意* 菜单列表和用户权限列表，Global Menu 组件应该只显示用户有权访问的菜单项（菜单项的 permissions 字段为空或与用户权限有交集）。

**验证需求: 4.1, 4.9**

### 属性 4: 标签页操作一致性

*对于任意* 标签页操作（添加、删除、切换），Tab Store 的状态、Global Tab 组件的显示和当前路由应该保持一致。

**验证需求: 5.1, 5.4, 5.6**

### 属性 5: 面包屑路径正确性

*对于任意* 路由路径，Global Breadcrumb 组件生成的面包屑应该准确反映从首页到当前页面的完整导航路径。

**验证需求: 6.1, 6.2**

### 属性 6: 窗口尺寸适配正确性

*对于任意* 桌面窗口宽度（>= 1280px），Layout System 应该正确调整布局，确保所有组件正常显示且不出现布局错乱。

**验证需求: 8.2, 8.4, 8.5**

### 属性 7: 配置持久化往返一致性

*对于任意* 布局配置对象，将其保存到 localStorage 后再读取，应该得到与原始配置等价的对象。

**验证需求: 1.4, 9.2**

### 属性 8: 主题配置实时应用一致性

*对于任意* 主题配置更改（主题模式、主题色、布局模式等），Theme Drawer 的配置、App Store 的状态和界面的实际显示应该保持一致。

**验证需求: 7.3**

## 错误处理

### 布局配置错误

- **配置无效**: 使用默认配置，记录警告日志
- **localStorage 不可用**: 降级为内存存储，显示提示
- **配置解析失败**: 清除损坏的配置，使用默认值

### 菜单渲染错误

- **菜单数据为空**: 显示空状态提示
- **菜单数据格式错误**: 过滤无效项，记录错误
- **路由跳转失败**: 显示错误提示，保持在当前页

### 标签页操作错误

- **关闭固定标签页**: 阻止操作，显示提示
- **标签页数量超限**: 显示警告，建议关闭部分标签页
- **标签页数据损坏**: 重置标签页列表

### 窗口尺寸适配错误

- **窗口宽度小于最小值**: 显示水平滚动条，记录警告
- **窗口大小检测失败**: 使用默认窗口尺寸
- **布局计算错误**: 使用默认布局配置

## 测试策略

### 测试方法

本项目采用**双重测试方法**：

1. **单元测试**: 验证特定示例、边缘情况和错误条件
2. **基于属性的测试**: 验证跨所有输入的通用属性

### 测试框架

- **单元测试框架**: Vitest
- **基于属性的测试库**: fast-check
- **组件测试**: @vue/test-utils

### 测试覆盖范围

#### 布局容器测试

**单元测试**:
- 布局模式切换功能
- 组件显示/隐藏逻辑
- 响应式断点切换
- 路由缓存功能

**基于属性的测试**:
- 属性 1: 布局模式切换一致性
- 属性 6: 窗口尺寸适配正确性

#### 全局头部测试

**单元测试**:
- 用户操作按钮功能
- 退出登录流程
- 全屏切换功能
- 主题切换功能

#### 全局侧边栏测试

**单元测试**:
- 折叠/展开功能
- 宽度调整功能
- 不同布局模式下的显示

**基于属性的测试**:
- 属性 2: 侧边栏状态同步一致性

#### 全局菜单测试

**单元测试**:
- 菜单项点击导航
- 多级菜单展开/折叠
- 当前菜单项高亮
- 垂直/水平模式切换

**基于属性的测试**:
- 属性 3: 菜单权限过滤正确性

#### 全局标签页测试

**单元测试**:
- 标签页添加/删除
- 标签页切换
- 右键菜单功能
- 固定标签页保护

**基于属性的测试**:
- 属性 4: 标签页操作一致性

#### 全局面包屑测试

**单元测试**:
- 面包屑生成逻辑
- 面包屑点击导航
- 特殊路由处理

**基于属性的测试**:
- 属性 5: 面包屑路径正确性

#### 主题抽屉测试

**单元测试**:
- 配置项更改
- 重置为默认
- 复制配置功能

**基于属性的测试**:
- 属性 7: 配置持久化往返一致性
- 属性 8: 主题配置实时应用一致性

### 性能测试

- 菜单渲染性能（1000+ 菜单项）
- 标签页切换性能（50+ 标签页）
- 布局模式切换性能
- 响应式适配性能

### 可访问性测试

- 键盘导航测试
- 屏幕阅读器测试
- 焦点管理测试
- ARIA 属性验证
