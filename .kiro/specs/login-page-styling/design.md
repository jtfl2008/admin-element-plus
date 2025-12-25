# 设计文档

## 概述

本设计文档描述了登录页面样式改进的技术方案。我们将移除现有的渐变紫色背景，采用现代简约的设计风格，使用蓝灰色系配色方案，确保在不同设备和主题模式下都能提供优秀的用户体验。

设计目标：
- 移除渐变紫色背景，采用专业的配色方案
- 优化全局样式，避免与登录页面冲突
- 提升表单元素的视觉效果和交互体验
- 支持响应式设计和主题模式切换
- 保持与 Element Plus 设计语言的一致性

## 架构

### 样式架构层次

```
全局样式层
├── base.css (CSS变量定义、基础重置)
└── main.css (全局布局样式)

组件样式层
├── App.vue (应用根组件样式)
└── 页面组件样式
    └── login/index.vue (登录页面独立样式)
```

### 样式隔离策略

1. **全局样式优化**：修改 `main.css` 中影响登录页面的全局样式
2. **组件样式隔离**：使用 Vue 的 `scoped` 样式确保登录页面样式不影响其他页面
3. **CSS 变量系统**：在 `base.css` 中定义主题相关的 CSS 变量
4. **条件样式应用**：根据路由或布局类型应用不同的全局样式

## 组件和接口

### 1. 全局样式配置

**文件：** `src/assets/base.css`

**修改内容：**
- 添加登录页面专用的 CSS 变量
- 定义主题模式下的配色方案
- 确保暗色模式的适配

**新增 CSS 变量：**
```css
:root {
  /* 主色调 - 蓝色系 */
  --primary-color: #409eff;
  --primary-hover: #66b1ff;
  --primary-active: #3a8ee6;
  
  /* 背景色 */
  --login-bg: #f0f2f5;
  --login-box-bg: #ffffff;
  
  /* 文字色 */
  --text-primary: #303133;
  --text-secondary: #606266;
  --text-placeholder: #c0c4cc;
  
  /* 边框色 */
  --border-color: #dcdfe6;
  --border-hover: #409eff;
  
  /* 阴影 */
  --box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

@media (prefers-color-scheme: dark) {
  :root {
    --login-bg: #1a1a1a;
    --login-box-bg: #2c2c2c;
    --text-primary: #e5e5e5;
    --text-secondary: #b3b3b3;
    --text-placeholder: #666666;
    --border-color: #4c4c4c;
    --box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.3);
  }
}
```

### 2. 全局布局样式优化

**文件：** `src/assets/main.css`

**问题分析：**
当前 `main.css` 中的以下样式会影响登录页面：
```css
#app {
  max-width: 1280px;
  margin: 0 auto;
  padding: 2rem;
}

@media (min-width: 1024px) {
  body {
    display: flex;
    place-items: center;
  }
  
  #app {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

**解决方案：**
- 移除或条件化应用这些样式
- 为登录页面提供独立的布局容器
- 使用路由元信息或 body class 来区分不同页面的布局需求

### 3. 登录页面组件

**文件：** `src/views/login/index.vue`

**当前问题：**
- 使用渐变紫色背景 `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`
- 缺少暗色模式支持
- 响应式设计不够完善
- 交互反馈不够明显

**设计改进：**

#### 3.1 布局结构
```
.login-container (全屏容器)
└── .login-box (登录卡片)
    ├── .login-header (头部区域)
    │   ├── .login-logo (可选logo)
    │   └── .login-title (标题)
    ├── .login-form (表单区域)
    │   ├── .form-item (表单项)
    │   │   ├── .form-label (标签)
    │   │   └── .form-input (输入框)
    │   └── .login-button (登录按钮)
    └── .login-footer (底部区域，可选)
```

#### 3.2 配色方案

**亮色模式：**
- 背景色：`#f0f2f5` (浅灰蓝)
- 卡片背景：`#ffffff` (纯白)
- 主色调：`#409eff` (Element Plus 蓝)
- 文字色：`#303133` (深灰)
- 边框色：`#dcdfe6` (浅灰)

**暗色模式：**
- 背景色：`#1a1a1a` (深黑)
- 卡片背景：`#2c2c2c` (深灰)
- 主色调：`#409eff` (保持一致)
- 文字色：`#e5e5e5` (浅灰白)
- 边框色：`#4c4c4c` (中灰)

#### 3.3 响应式断点

```css
/* 移动设备 */
@media (max-width: 768px) {
  .login-box {
    width: 90%;
    max-width: 400px;
    padding: 30px 20px;
  }
}

/* 平板设备 */
@media (min-width: 769px) and (max-width: 1024px) {
  .login-box {
    width: 450px;
    padding: 40px 30px;
  }
}

/* 桌面设备 */
@media (min-width: 1025px) {
  .login-box {
    width: 480px;
    padding: 50px 40px;
  }
}
```

## 数据模型

本功能主要涉及样式改进，不涉及数据模型的变更。登录表单的数据结构保持不变：

```typescript
interface LoginForm {
  username: string
  password: string
}
```

## 正确性属性

*属性是一个特征或行为，应该在系统的所有有效执行中保持为真——本质上是关于系统应该做什么的形式化陈述。属性作为人类可读规范和机器可验证正确性保证之间的桥梁。*


### 属性 1：颜色对比度符合可访问性标准

*对于任何* 文字和背景的颜色组合，在亮色和暗色模式下，对比度都应该达到 WCAG AA 标准（至少 4.5:1 用于正常文字，3:1 用于大文字）

**验证：需求 3.4, 5.3**

### 属性 2：响应式布局适配

*对于任何* 视口宽度（移动、平板、桌面），登录框应该正确调整尺寸并保持可用性，表单元素的最小可点击区域应该至少为 44x44px

**验证：需求 4.1, 4.2, 4.3, 4.4**

### 属性 3：CSS 变量一致性

*对于任何* 使用颜色、字体、圆角、阴影的地方，登录页面应该使用全局定义的 CSS 变量，而不是硬编码的值

**验证：需求 7.1, 7.2, 7.3**

## 错误处理

本功能主要涉及样式改进，不涉及复杂的错误处理逻辑。但需要考虑以下情况：

1. **CSS 变量未定义**：确保所有使用的 CSS 变量都有默认值
2. **浏览器兼容性**：使用 CSS 变量时提供降级方案
3. **主题切换失败**：确保在主题切换失败时使用默认主题

## 测试策略

### 单元测试

由于这是纯样式改进功能，传统的单元测试不太适用。我们将使用以下测试方法：

1. **视觉回归测试**：
   - 使用截图对比工具（如 Percy、Chromatic）
   - 测试不同视口尺寸下的显示效果
   - 测试亮色和暗色模式

2. **样式计算测试**：
   - 使用 Jest + Testing Library 测试计算后的样式
   - 验证关键样式属性的值
   - 测试 CSS 变量的应用

3. **可访问性测试**：
   - 使用 axe-core 或 jest-axe 测试可访问性
   - 验证颜色对比度
   - 测试键盘导航

### 属性测试

虽然这是样式功能，但我们仍然可以使用属性测试来验证某些通用规则：

**属性测试 1：对比度验证**
- 生成随机的文字和背景颜色组合
- 验证所有组合都满足 WCAG AA 标准
- 标签：**Feature: login-page-styling, Property 1: 颜色对比度符合可访问性标准**

**属性测试 2：响应式断点**
- 生成随机的视口宽度
- 验证登录框的宽度和布局在所有视口下都合理
- 标签：**Feature: login-page-styling, Property 2: 响应式布局适配**

**属性测试 3：CSS 变量使用**
- 检查所有样式声明
- 验证颜色、字体等关键属性使用 CSS 变量
- 标签：**Feature: login-page-styling, Property 3: CSS 变量一致性**

### 测试配置

- 使用 Vitest 作为测试运行器
- 使用 @testing-library/vue 进行组件测试
- 使用 jest-axe 进行可访问性测试
- 每个属性测试至少运行 100 次迭代

### 手动测试检查清单

由于样式改进的主观性，还需要进行手动测试：

1. ✓ 登录页面在不同浏览器中显示正常（Chrome、Firefox、Safari、Edge）
2. ✓ 渐变紫色背景已完全移除
3. ✓ 新配色方案在视觉上令人愉悦且专业
4. ✓ 表单元素的交互反馈清晰明显
5. ✓ 移动设备上的显示和操作流畅
6. ✓ 暗色模式下的显示效果良好
7. ✓ 与应用其他页面的视觉风格一致

## 实现注意事项

1. **渐进式改进**：先修改全局样式，再优化登录页面样式
2. **保持向后兼容**：确保修改不影响其他页面
3. **使用 CSS 变量**：便于后续主题定制和维护
4. **移动优先**：从移动端样式开始，逐步增强到桌面端
5. **性能优化**：避免使用复杂的 CSS 选择器和过度的动画
6. **可访问性优先**：确保所有交互元素都可以通过键盘访问

## 设计决策

### 为什么选择蓝灰色系？

1. **专业性**：蓝色在企业应用中广泛使用，传达信任和稳定
2. **与 Element Plus 一致**：Element Plus 的主色调就是蓝色（#409eff）
3. **良好的对比度**：蓝灰色系在亮色和暗色模式下都能提供良好的对比度
4. **视觉舒适**：相比渐变紫色，蓝灰色系更加柔和，减少视觉疲劳

### 为什么移除全局布局样式？

当前 `main.css` 中的全局布局样式（grid、max-width 等）是为内容页面设计的，不适合全屏的登录页面。我们需要：

1. 为登录页面提供独立的布局容器
2. 使用路由元信息或布局组件来区分不同页面的布局需求
3. 保持其他页面的布局不受影响

### 为什么使用 CSS 变量而不是 SCSS 变量？

1. **运行时切换**：CSS 变量可以在运行时动态修改，支持主题切换
2. **浏览器支持**：现代浏览器都支持 CSS 变量
3. **简化构建**：不需要额外的 SCSS 编译步骤
4. **更好的调试**：可以在浏览器开发工具中直接查看和修改

## 参考资料

- [Element Plus 设计规范](https://element-plus.org/zh-CN/guide/design.html)
- [WCAG 2.1 颜色对比度指南](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
- [响应式设计最佳实践](https://web.dev/responsive-web-design-basics/)
- [CSS 变量使用指南](https://developer.mozilla.org/zh-CN/docs/Web/CSS/Using_CSS_custom_properties)
