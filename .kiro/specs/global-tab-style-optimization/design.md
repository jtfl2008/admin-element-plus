# 设计文档：全局标签页样式系统优化

## 概述

本设计文档描述了全局标签页组件的样式系统优化方案。通过引入可配置的主题系统，支持多种视觉风格（卡片、按钮、下划线）和浅色/深色模式，提升用户体验和代码可维护性。

设计采用 CSS 变量 + TypeScript 配置的方式，实现主题的动态切换和自定义配置，同时保持向后兼容性和良好的性能表现。

## 架构设计

### 整体架构

```
src/layouts/modules/global-tab/
├── index.vue                    # 主组件（添加主题支持）
├── components/
│   ├── tab-item.vue            # 标签页项组件（应用主题样式）
│   └── context-menu.vue        # 右键菜单组件
├── config/
│   └── tab-themes.ts           # 主题配置文件（新增）
└── styles/                      # 样式目录（新增）
    ├── _variables.scss         # CSS 变量定义
    ├── _card.scss              # 卡片主题样式
    ├── _button.scss            # 按钮主题样式
    ├── _underline.scss         # 下划线主题样式
    └── index.scss              # 样式入口文件
```

### 数据流

```
用户设置 theme prop
    ↓
主组件读取主题配置
    ↓
应用 CSS 类名 + 更新 CSS 变量
    ↓
子组件继承主题样式
    ↓
渲染对应的视觉效果
```

## 组件和接口

### 1. 主题配置类型定义

```typescript
/**
 * 主题配置接口
 */
export interface TabThemeConfig {
  /** 主题名称 */
  name: string
  /** 主题显示名称 */
  displayName: string
  /** 浅色模式配置 */
  light: TabThemeColors
  /** 深色模式配置 */
  dark: TabThemeColors
}

/**
 * 主题颜色配置
 */
export interface TabThemeColors {
  /** 标签页背景色 */
  tabBg: string
  /** 标签页文字色 */
  tabText: string
  /** 标签页边框色 */
  tabBorder: string
  /** 活动状态背景色 */
  activeBg: string
  /** 活动状态文字色 */
  activeText: string
  /** 活动状态边框色 */
  activeBorder: string
  /** 悬停状态背景色 */
  hoverBg: string
  /** 悬停状态文字色 */
  hoverText: string
  /** 悬停状态边框色 */
  hoverBorder: string
  /** 圆角半径 */
  borderRadius: string
  /** 内边距 */
  padding: string
  /** 标签页间距 */
  gap: string
  /** 阴影效果 */
  shadow?: string
  /** 下划线颜色（仅 underline 主题） */
  underlineColor?: string
  /** 下划线高度（仅 underline 主题） */
  underlineHeight?: string
}

/**
 * 主题类型
 */
export type TabThemeType = 'card' | 'button' | 'underline'
```

### 2. 主组件 Props 扩展

```typescript
interface Props {
  /** 主题类型 */
  theme?: TabThemeType
  /** 自定义主题配置 */
  themeConfig?: Partial<TabThemeConfig>
}

// 默认值
const props = withDefaults(defineProps<Props>(), {
  theme: 'card',
  themeConfig: undefined
})
```

### 3. 主题配置对象

```typescript
// config/tab-themes.ts

/**
 * 卡片主题配置
 */
export const cardTheme: TabThemeConfig = {
  name: 'card',
  displayName: '卡片',
  light: {
    tabBg: 'transparent',
    tabText: '#333333',
    tabBorder: 'transparent',
    activeBg: '#e6f7ff',
    activeText: '#1890ff',
    activeBorder: '#1890ff',
    hoverBg: '#f5f5f5',
    hoverText: '#333333',
    hoverBorder: '#e5e5e5',
    borderRadius: '8px',
    padding: '0 16px',
    gap: '8px',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
  },
  dark: {
    tabBg: 'transparent',
    tabText: '#e8e8e8',
    tabBorder: 'transparent',
    activeBg: '#1890ff',
    activeText: '#ffffff',
    activeBorder: '#1890ff',
    hoverBg: '#2c2c2c',
    hoverText: '#e8e8e8',
    hoverBorder: '#3c3c3c',
    borderRadius: '8px',
    padding: '0 16px',
    gap: '8px',
    shadow: '0 2px 8px rgba(0, 0, 0, 0.3)'
  }
}

/**
 * 按钮主题配置
 */
export const buttonTheme: TabThemeConfig = {
  name: 'button',
  displayName: '按钮',
  light: {
    tabBg: '#f0f0f0',
    tabText: '#666666',
    tabBorder: 'transparent',
    activeBg: '#1890ff',
    activeText: '#ffffff',
    activeBorder: 'transparent',
    hoverBg: '#e0e0e0',
    hoverText: '#333333',
    hoverBorder: 'transparent',
    borderRadius: '4px',
    padding: '8px 12px',
    gap: '6px',
    shadow: 'none'
  },
  dark: {
    tabBg: '#2c2c2c',
    tabText: '#a8a8a8',
    tabBorder: 'transparent',
    activeBg: '#1890ff',
    activeText: '#ffffff',
    activeBorder: 'transparent',
    hoverBg: '#3c3c3c',
    hoverText: '#e8e8e8',
    hoverBorder: 'transparent',
    borderRadius: '4px',
    padding: '8px 12px',
    gap: '6px',
    shadow: 'none'
  }
}

/**
 * 下划线主题配置
 */
export const underlineTheme: TabThemeConfig = {
  name: 'underline',
  displayName: '下划线',
  light: {
    tabBg: 'transparent',
    tabText: '#666666',
    tabBorder: 'transparent',
    activeBg: 'transparent',
    activeText: '#1890ff',
    activeBorder: 'transparent',
    hoverBg: 'transparent',
    hoverText: '#333333',
    hoverBorder: 'transparent',
    borderRadius: '0',
    padding: '0 12px',
    gap: '4px',
    shadow: 'none',
    underlineColor: '#1890ff',
    underlineHeight: '3px'
  },
  dark: {
    tabBg: 'transparent',
    tabText: '#a8a8a8',
    tabBorder: 'transparent',
    activeBg: 'transparent',
    activeText: '#1890ff',
    activeBorder: 'transparent',
    hoverBg: 'transparent',
    hoverText: '#e8e8e8',
    hoverBorder: 'transparent',
    borderRadius: '0',
    padding: '0 12px',
    gap: '4px',
    shadow: 'none',
    underlineColor: '#1890ff',
    underlineHeight: '3px'
  }
}

/**
 * 主题映射表
 */
export const themeMap: Record<TabThemeType, TabThemeConfig> = {
  card: cardTheme,
  button: buttonTheme,
  underline: underlineTheme
}

/**
 * 获取主题配置
 */
export function getThemeConfig(
  themeName: TabThemeType,
  customConfig?: Partial<TabThemeConfig>
): TabThemeConfig {
  const baseTheme = themeMap[themeName]
  if (!customConfig) {
    return baseTheme
  }
  
  // 深度合并自定义配置
  return {
    ...baseTheme,
    light: { ...baseTheme.light, ...customConfig.light },
    dark: { ...baseTheme.dark, ...customConfig.dark }
  }
}
```

## 数据模型

### CSS 变量命名规范

所有主题相关的 CSS 变量使用 `--tab-theme-*` 前缀：

```scss
// 基础变量
--tab-theme-bg              // 标签页背景色
--tab-theme-text            // 标签页文字色
--tab-theme-border          // 标签页边框色

// 活动状态
--tab-theme-active-bg       // 活动状态背景色
--tab-theme-active-text     // 活动状态文字色
--tab-theme-active-border   // 活动状态边框色

// 悬停状态
--tab-theme-hover-bg        // 悬停状态背景色
--tab-theme-hover-text      // 悬停状态文字色
--tab-theme-hover-border    // 悬停状态边框色

// 布局
--tab-theme-border-radius   // 圆角半径
--tab-theme-padding         // 内边距
--tab-theme-gap             // 标签页间距
--tab-theme-shadow          // 阴影效果

// 下划线主题专用
--tab-theme-underline-color  // 下划线颜色
--tab-theme-underline-height // 下划线高度
```

### 主题应用逻辑

```typescript
// 在主组件中
import { computed, watch, onMounted } from 'vue'
import { getThemeConfig } from './config/tab-themes'

// 计算当前主题配置
const currentThemeConfig = computed(() => {
  return getThemeConfig(props.theme, props.themeConfig)
})

// 检测当前是否为深色模式
const isDarkMode = computed(() => {
  // 从 appStore 或其他地方获取深色模式状态
  return appStore.isDarkMode
})

// 获取当前模式的主题颜色
const currentColors = computed(() => {
  return isDarkMode.value 
    ? currentThemeConfig.value.dark 
    : currentThemeConfig.value.light
})

// 应用主题样式
function applyTheme() {
  const colors = currentColors.value
  const root = document.documentElement
  
  // 更新 CSS 变量
  root.style.setProperty('--tab-theme-bg', colors.tabBg)
  root.style.setProperty('--tab-theme-text', colors.tabText)
  root.style.setProperty('--tab-theme-border', colors.tabBorder)
  root.style.setProperty('--tab-theme-active-bg', colors.activeBg)
  root.style.setProperty('--tab-theme-active-text', colors.activeText)
  root.style.setProperty('--tab-theme-active-border', colors.activeBorder)
  root.style.setProperty('--tab-theme-hover-bg', colors.hoverBg)
  root.style.setProperty('--tab-theme-hover-text', colors.hoverText)
  root.style.setProperty('--tab-theme-hover-border', colors.hoverBorder)
  root.style.setProperty('--tab-theme-border-radius', colors.borderRadius)
  root.style.setProperty('--tab-theme-padding', colors.padding)
  root.style.setProperty('--tab-theme-gap', colors.gap)
  root.style.setProperty('--tab-theme-shadow', colors.shadow || 'none')
  
  if (colors.underlineColor) {
    root.style.setProperty('--tab-theme-underline-color', colors.underlineColor)
  }
  if (colors.underlineHeight) {
    root.style.setProperty('--tab-theme-underline-height', colors.underlineHeight)
  }
}

// 监听主题变化
watch([currentColors], () => {
  applyTheme()
}, { immediate: true })

onMounted(() => {
  applyTheme()
})
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的正式陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*

### 属性 1：主题配置完整性

*对于任何*主题类型（card、button、underline），其配置对象必须包含所有必需的样式属性（背景色、文字色、边框色、活动状态、悬停状态、布局参数），且同时提供 light 和 dark 两种模式的完整配置。

**验证：需求 1.3, 1.4**

### 属性 2：CSS 变量应用一致性

*对于任何*主题切换操作，所有 CSS 变量必须在 100ms 内完成更新，且更新后的变量值必须与当前主题配置和模式（浅色/深色）完全一致。

**验证：需求 2.3, 11.1**

### 属性 3：主题类名映射正确性

*对于任何*主题类型，应用到组件根元素的 CSS 类名必须与主题名称一致（如 theme='card' 对应 'theme-card' 类名），且类名切换不会触发组件重新渲染。

**验证：需求 4.6, 11.2**

### 属性 4：自定义配置合并正确性

*对于任何*提供的自定义主题配置，合并后的配置必须保留基础主题的所有未被覆盖的属性，且自定义属性必须完全覆盖对应的基础属性。

**验证：需求 3.4, 12.2**

### 属性 5：交互功能保持不变性

*对于任何*主题切换操作，标签页的所有交互功能（点击切换、关闭、右键菜单、拖拽排序、滚动）必须保持完全正常工作，不受主题样式影响。

**验证：需求 9.1, 9.2, 9.3, 9.4, 9.5**

### 属性 6：模式切换平滑性

*对于任何*浅色/深色模式切换操作，所有颜色变化必须通过 CSS 过渡效果实现平滑变化，过渡时间不超过 300ms，且不触发组件重新渲染。

**验证：需求 8.3, 8.5**

### 属性 7：主题扩展兼容性

*对于任何*新增的主题配置，只要符合 TabThemeConfig 类型定义，就能够被系统正确识别和应用，无需修改组件代码。

**验证：需求 12.1, 12.3, 12.5**

## 错误处理

### 1. 无效主题类型

```typescript
function getThemeConfig(
  themeName: TabThemeType,
  customConfig?: Partial<TabThemeConfig>
): TabThemeConfig {
  const baseTheme = themeMap[themeName]
  
  // 如果主题不存在，回退到默认主题
  if (!baseTheme) {
    console.warn(`主题 "${themeName}" 不存在，使用默认 card 主题`)
    return themeMap.card
  }
  
  // ... 其他逻辑
}
```

### 2. 不完整的自定义配置

```typescript
// 使用深度合并确保所有属性都有值
function mergeThemeConfig(
  base: TabThemeColors,
  custom?: Partial<TabThemeColors>
): TabThemeColors {
  if (!custom) return base
  
  return {
    ...base,
    ...Object.fromEntries(
      Object.entries(custom).filter(([_, value]) => value !== undefined)
    )
  }
}
```

### 3. CSS 变量应用失败

```typescript
function applyTheme() {
  try {
    const colors = currentColors.value
    const root = document.documentElement
    
    // 批量更新 CSS 变量
    Object.entries(cssVariableMap).forEach(([key, cssVar]) => {
      const value = colors[key as keyof TabThemeColors]
      if (value) {
        root.style.setProperty(cssVar, value)
      }
    })
  } catch (error) {
    console.error('应用主题失败:', error)
    // 回退到默认样式
    applyDefaultTheme()
  }
}
```

## 测试策略

### 单元测试

1. **主题配置测试**
   - 测试每个内置主题的配置完整性
   - 测试自定义配置的合并逻辑
   - 测试无效主题类型的回退机制

2. **CSS 变量应用测试**
   - 测试 CSS 变量的正确设置
   - 测试主题切换时变量的更新
   - 测试模式切换时变量的更新

3. **组件 Props 测试**
   - 测试 theme prop 的默认值
   - 测试 themeConfig prop 的合并
   - 测试 props 变化时的响应

### 集成测试

1. **主题切换测试**
   - 测试在三种主题之间切换
   - 测试切换过程中的视觉效果
   - 测试切换后的交互功能

2. **模式切换测试**
   - 测试浅色/深色模式切换
   - 测试模式切换时的颜色变化
   - 测试模式切换的平滑过渡

3. **交互功能测试**
   - 测试标签页点击切换
   - 测试标签页关闭功能
   - 测试右键菜单功能
   - 测试拖拽排序功能
   - 测试滚动按钮功能

### 性能测试

1. **主题切换性能**
   - 测试主题切换的响应时间（< 100ms）
   - 测试是否触发不必要的重新渲染
   - 测试大量标签页时的性能表现

2. **CSS 变量更新性能**
   - 测试 CSS 变量批量更新的性能
   - 测试过渡动画的流畅度
   - 测试内存占用情况

### 视觉回归测试

1. **主题视觉效果**
   - 截图对比三种主题的视觉效果
   - 验证活动状态的视觉表现
   - 验证悬停状态的视觉表现

2. **模式适配效果**
   - 截图对比浅色/深色模式
   - 验证对比度和可读性
   - 验证颜色过渡效果
