# 全局标签页组件

## 概述

全局标签页组件支持三种主题风格，可以通过主题配置抽屉进行切换。

## 主题类型

### 1. 卡片主题 (card)
- **特点**：明显的背景色和边框，清晰的视觉分隔
- **圆角**：8px
- **适用场景**：传统的管理后台界面，需要明确标签页边界的场景

### 2. 按钮主题 (button)
- **特点**：类似按钮的外观，紧凑现代
- **圆角**：4px
- **适用场景**：现代化、扁平化的界面设计，空间有限的场景

### 3. 下划线主题 (underline)
- **特点**：透明背景，活动状态显示底部下划线
- **圆角**：0
- **适用场景**：极简主义设计，内容驱动的应用

## 使用方式

### 方式一：通过主题配置抽屉切换（推荐）

1. 点击页面右上角的主题配置按钮（齿轮图标）
2. 在抽屉中找到"标签页主题"部分
3. 选择你喜欢的主题样式

配置会自动保存到 localStorage，刷新页面后依然生效。

### 方式二：通过 Props 指定

如果需要在特定场景下使用不同的主题，可以通过 props 传递：

```vue
<template>
  <!-- 使用按钮主题 -->
  <GlobalTab theme="button" />
  
  <!-- 使用下划线主题 -->
  <GlobalTab theme="underline" />
  
  <!-- 自定义主题配置 -->
  <GlobalTab 
    theme="card"
    :theme-config="{
      light: {
        activeBg: '#ff0000',
        activeText: '#ffffff'
      }
    }"
  />
</template>
```

## 主题配置

每个主题都支持浅色和深色两种模式，配置文件位于：
`src/layouts/modules/global-tab/config/tab-themes.ts`

### 配置结构

```typescript
interface TabThemeConfig {
  name: string              // 主题名称
  displayName: string       // 显示名称
  light: TabThemeColors     // 浅色模式配置
  dark: TabThemeColors      // 深色模式配置
}

interface TabThemeColors {
  tabBg: string            // 标签页背景色
  tabText: string          // 标签页文字色
  tabBorder: string        // 标签页边框色
  activeBg: string         // 活动状态背景色
  activeText: string       // 活动状态文字色
  activeBorder: string     // 活动状态边框色
  hoverBg: string          // 悬停状态背景色
  hoverText: string        // 悬停状态文字色
  hoverBorder: string      // 悬停状态边框色
  borderRadius: string     // 圆角半径
  padding: string          // 内边距
  gap: string              // 标签页间距
  shadow?: string          // 阴影效果
  underlineColor?: string  // 下划线颜色（仅 underline 主题）
  underlineHeight?: string // 下划线高度（仅 underline 主题）
}
```

## 自定义主题

如果内置的三种主题不能满足需求，可以通过以下方式自定义：

### 1. 添加新主题

在 `tab-themes.ts` 中添加新的主题配置：

```typescript
export const customTheme: TabThemeConfig = {
  name: 'custom',
  displayName: '自定义',
  light: {
    // ... 配置
  },
  dark: {
    // ... 配置
  }
}

// 更新主题映射表
export const themeMap: Record<TabThemeType, TabThemeConfig> = {
  card: cardTheme,
  button: buttonTheme,
  underline: underlineTheme,
  custom: customTheme  // 添加新主题
}
```

### 2. 创建主题样式文件

在 `styles/` 目录下创建新的样式文件，例如 `_custom.scss`：

```scss
.global-tab.theme-custom {
  .tab-item {
    // 自定义样式
  }
}
```

然后在 `styles/index.scss` 中导入：

```scss
@import './custom';
```

## 技术实现

### CSS 变量系统

主题系统使用 CSS 变量实现动态切换，所有主题相关的变量使用 `--tab-theme-*` 前缀：

```scss
:root {
  --tab-theme-bg: transparent;
  --tab-theme-text: #333333;
  --tab-theme-active-bg: #e6f7ff;
  // ... 更多变量
}
```

### 主题应用流程

1. 用户在主题配置抽屉中选择主题
2. 配置保存到 appStore 的 layoutConfig.tabTheme
3. 全局标签页组件从 appStore 读取主题配置
4. 通过 `applyTheme()` 函数更新 CSS 变量
5. 应用对应的主题类名（如 `theme-card`）
6. 样式立即生效

## 浏览器兼容性

- 现代浏览器（Chrome、Firefox、Safari、Edge）
- 需要支持 CSS 变量（CSS Custom Properties）
- 需要支持 ES6+

## 性能优化

- CSS 变量更新在 100ms 内完成
- 主题切换不触发组件重新渲染
- 使用 CSS 过渡实现平滑的视觉变化
- 配置持久化到 localStorage，避免重复计算

## 常见问题

### Q: 如何重置为默认主题？
A: 在主题配置抽屉中点击"重置配置"按钮，会恢复到默认的 card 主题。

### Q: 主题配置会保存吗？
A: 是的，主题配置会自动保存到 localStorage，刷新页面后依然生效。

### Q: 可以为不同页面设置不同主题吗？
A: 可以，通过 props 传递 theme 参数即可覆盖全局配置。

### Q: 如何支持深色模式？
A: 每个主题都包含 light 和 dark 两种模式的配置，系统会根据当前模式自动切换。目前深色模式检测逻辑需要根据项目实际情况调整。

## 维护指南

### 添加新的样式属性

1. 在 `TabThemeColors` 接口中添加新属性
2. 在所有主题配置中添加对应的值
3. 在 `_variables.scss` 中定义对应的 CSS 变量
4. 在 `applyTheme()` 函数中添加变量更新逻辑
5. 在主题样式文件中使用新变量

### 修改现有主题

直接编辑 `tab-themes.ts` 中的主题配置对象即可，修改会立即生效。

## 相关文件

- `config/tab-themes.ts` - 主题配置
- `styles/_variables.scss` - CSS 变量定义
- `styles/_card.scss` - 卡片主题样式
- `styles/_button.scss` - 按钮主题样式
- `styles/_underline.scss` - 下划线主题样式
- `styles/index.scss` - 样式入口
- `components/tab-item.vue` - 标签页项组件
- `index.vue` - 主组件
