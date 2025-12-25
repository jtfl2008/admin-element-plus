# 实施计划: 布局系统

## 概述

本实施计划将布局系统的设计转化为一系列可执行的编码任务。每个任务都建立在前面任务的基础上，确保增量进度和集成。任务专注于编写、修改或测试代码。

## 任务列表

- [x] 1. 扩展 App Store 以支持布局配置
  - 在 stores/modules/app.ts 中添加 layoutConfig 状态
  - 定义默认布局配置（layoutMode: 'vertical', sidebarWidth: 200, collapsedWidth: 64 等）
  - 实现 setLayoutMode 方法
  - 实现 updateLayoutConfig 方法
  - 实现 resetLayoutConfig 方法
  - 实现 getLayoutConfig 方法
  - 配置布局配置的持久化（使用 pinia-plugin-persistedstate）
  - _需求: 1.2, 9.1, 9.2_

- [ ]* 1.1 为布局配置编写基于属性的测试
  - **属性 7: 配置持久化往返一致性**
  - **验证需求: 1.4, 9.2**

- [x] 2. 创建布局类型定义
  - 创建 typings/layout.d.ts
  - 定义 LayoutMode 类型（'vertical' | 'horizontal' | 'mix'）
  - 定义 DeviceType 类型（'desktop'）
  - 定义 LayoutConfig 接口（包含 minWidth: 1280）
  - 定义 MenuItem 接口
  - 定义 TabItem 接口（扩展现有定义）
  - 定义 BreadcrumbItem 接口
  - _需求: 9.1_

- [x] 3. 实现窗口尺寸监听
  - 在 App Store 中添加 windowWidth 状态
  - 实现窗口大小监听（使用 window.addEventListener('resize')）
  - 使用防抖优化 resize 事件处理（300ms）
  - 在窗口宽度小于 1280px 时记录警告
  - 在 main.ts 中初始化窗口监听
  - _需求: 8.1, 8.4_

- [ ]* 3.1 为窗口适配编写基于属性的测试
  - **属性 6: 窗口尺寸适配正确性**
  - **验证需求: 8.2, 8.4, 8.5**

- [x] 4. 实现全局 Logo 组件
  - 创建 layouts/modules/global-logo/index.vue
  - 接收 collapsed 属性（控制是否只显示图标）
  - 显示系统 Logo 图片
  - 显示系统标题（从环境变量读取 VITE_APP_TITLE）
  - 在折叠状态下只显示 Logo 图标
  - 添加点击跳转到首页的功能
  - _需求: 2.1, 3.1_

- [x] 5. 实现全局菜单组件
  - [x] 5.1 创建菜单基础组件
    - 创建 layouts/modules/global-menu/index.vue
    - 接收 mode 属性（'vertical' | 'horizontal'）
    - 接收 collapsed 属性（仅垂直模式）
    - 从 Route Store 获取菜单列表
    - 使用 Element Plus 的 el-menu 组件
    - 根据当前路由高亮激活的菜单项
    - _需求: 4.1, 4.2, 4.4, 4.8_

  - [x] 5.2 创建菜单项组件
    - 创建 layouts/modules/global-menu/components/menu-item.vue
    - 显示菜单图标（使用 el-icon）
    - 显示菜单标题
    - 处理菜单项点击事件（路由跳转）
    - 支持 badge 显示
    - _需求: 4.3, 4.5_

  - [x] 5.3 创建子菜单组件
    - 创建 layouts/modules/global-menu/components/sub-menu.vue
    - 使用 el-sub-menu 组件
    - 递归渲染子菜单项
    - 支持最多 3 级菜单
    - 实现菜单展开/折叠功能
    - _需求: 4.2, 4.6_

  - [x] 5.4 实现菜单权限过滤
    - 在菜单组件中过滤 hidden 为 true 的菜单项
    - 根据用户权限过滤无权访问的菜单项
    - 实现菜单项的 disabled 状态
    - _需求: 4.9_

  - [ ]* 5.5 为菜单权限过滤编写基于属性的测试
    - **属性 3: 菜单权限过滤正确性**
    - **验证需求: 4.1, 4.9**

  - [x] 5.6 实现折叠菜单的弹出效果
    - 在侧边栏折叠时，菜单项悬停显示弹出菜单
    - 使用 el-menu 的 collapse 属性
    - 配置 popper-class 自定义弹出菜单样式
    - _需求: 4.7_

- [x] 6. 实现全局侧边栏组件
  - 创建 layouts/modules/global-sider/index.vue
  - 接收 collapsed、width、collapsedWidth 属性
  - 从 App Store 读取 sidebarCollapsed 状态
  - 在顶部显示 Logo 组件
  - 在主体显示 Menu 组件（mode="vertical"）
  - 根据 collapsed 状态调整宽度
  - 添加折叠/展开的过渡动画（transition: width 0.3s）
  - 在垂直和混合布局中显示，水平布局中隐藏
  - _需求: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9_

- [ ]* 6.1 为侧边栏状态同步编写基于属性的测试
  - **属性 2: 侧边栏状态同步一致性**
  - **验证需求: 3.6**

- [x] 7. 实现全局面包屑组件
  - 创建 layouts/modules/global-breadcrumb/index.vue
  - 使用 Element Plus 的 el-breadcrumb 组件
  - 从当前路由生成面包屑路径
  - 遍历路由的 matched 数组构建面包屑
  - 使用路由 meta.title 作为面包屑文字
  - 实现面包屑项点击导航
  - 高亮显示当前页面的面包屑项
  - 在首页时只显示"首页"
  - _需求: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ]* 7.1 为面包屑路径生成编写基于属性的测试
  - **属性 5: 面包屑路径正确性**
  - **验证需求: 6.1, 6.2**

- [x] 8. 实现全局头部组件
  - [x] 8.1 创建头部容器组件
    - 创建 layouts/modules/global-header/index.vue
    - 接收 fixed 属性（是否固定头部）
    - 分为左、中、右三个区域
    - 根据布局模式显示不同内容
    - 添加固定头部的样式（position: fixed）
    - _需求: 2.1_

  - [x] 8.2 创建折叠按钮组件
    - 创建 layouts/modules/global-header/components/collapse-button.vue
    - 显示折叠/展开图标
    - 点击时调用 App Store 的 toggleSidebar 方法
    - 根据 sidebarCollapsed 状态切换图标
    - _需求: 2.2_

  - [x] 8.3 创建全屏切换组件
    - 创建 layouts/modules/global-header/components/fullscreen.vue
    - 使用 Fullscreen API 实现全屏切换
    - 显示全屏/退出全屏图标
    - 处理全屏状态变化
    - _需求: 2.5_

  - [x] 8.4 创建主题切换按钮组件
    - 创建 layouts/modules/global-header/components/theme-button.vue
    - 显示主题图标（太阳/月亮）
    - 点击时切换主题模式（light/dark）
    - 调用 App Store 的 setTheme 方法
    - _需求: 2.5_

  - [x] 8.5 创建通知消息组件
    - 创建 layouts/modules/global-header/components/notice.vue
    - 显示通知图标和未读数量徽章
    - 点击显示通知列表下拉菜单
    - 从 Notice Store 获取通知数据
    - _需求: 2.5_

  - [x] 8.6 创建用户中心组件
    - 创建 layouts/modules/global-header/components/user-center.vue
    - 显示用户头像
    - 显示用户名称
    - 点击显示下拉菜单（个人中心、系统设置、退出登录）
    - 实现退出登录功能（调用 Auth Store 的 logout 方法）
    - _需求: 2.5, 2.6, 2.7_

  - [x] 8.7 创建全局搜索组件
    - 创建 layouts/modules/global-header/components/search.vue
    - 显示搜索图标
    - 点击打开搜索对话框
    - 实现菜单搜索功能（搜索菜单标题和路径）
    - 支持键盘快捷键（Ctrl/Cmd + K）
    - _需求: 2.4_

  - [x] 8.8 组装头部组件
    - 在头部左侧显示：Logo（可选）、折叠按钮、面包屑（垂直布局）
    - 在头部中间显示：菜单（水平布局）
    - 在头部右侧显示：搜索、全屏、主题、通知、用户中心
    - 根据布局模式调整显示内容
    - _需求: 2.1, 2.2, 2.3, 2.4, 2.5, 2.8_

- [x] 9. 实现全局标签页组件
  - [x] 9.1 创建标签页容器组件
    - 创建 layouts/modules/global-tab/index.vue
    - 从 Tab Store 获取标签页列表
    - 显示标签页列表和操作按钮
    - 实现标签页滚动功能
    - _需求: 5.1, 5.2_

  - [x] 9.2 创建标签页项组件
    - 创建 layouts/modules/global-tab/components/tab-item.vue
    - 显示标签页标题
    - 显示关闭按钮（非固定标签页）
    - 高亮显示激活的标签页
    - 处理标签页点击事件
    - 处理关闭按钮点击事件
    - 支持右键菜单
    - _需求: 5.2, 5.3, 5.4, 5.5, 5.7_

  - [x] 9.3 创建标签页右键菜单组件
    - 创建 layouts/modules/global-tab/components/context-menu.vue
    - 显示右键菜单选项（刷新、关闭、关闭其他、关闭左侧、关闭右侧、关闭所有）
    - 实现各个菜单选项的功能
    - 处理固定标签页的特殊逻辑（不可关闭）
    - _需求: 5.7_

  - [x] 9.4 实现标签页拖拽排序
    - 使用原生拖拽 API
    - 实现标签页拖拽排序功能
    - 更新 Tab Store 中的标签页顺序
    - _需求: 5.8_

  - [x] 9.5 实现标签页滚动控制
    - 在标签页过多时显示左右滚动按钮
    - 实现标签页列表的水平滚动
    - 自动滚动到激活的标签页
    - _需求: 5.9_

  - [ ]* 9.6 为标签页操作编写基于属性的测试
    - **属性 4: 标签页操作一致性**
    - **验证需求: 5.1, 5.4, 5.6**

- [x] 10. 实现全局页脚组件
  - 创建 layouts/modules/global-footer/index.vue
  - 显示版权信息
  - 显示备案号（可选）
  - 显示友情链接（可选）
  - 根据配置显示/隐藏页脚
  - _需求: 9.1_

- [x] 11. 实现主题抽屉组件
  - [x] 11.1 创建主题抽屉容器
    - 创建 layouts/modules/theme-drawer/index.vue
    - 使用 Element Plus 的 el-drawer 组件
    - 从 App Store 读取当前配置
    - 提供配置选项的表单
    - _需求: 7.1_

  - [x] 11.2 创建主题模式配置组件
    - 创建 layouts/modules/theme-drawer/components/theme-mode.vue
    - 提供亮色/暗色模式切换
    - 使用单选按钮或开关组件
    - 实时应用主题模式
    - _需求: 7.1_

  - [x] 11.3 创建主题色配置组件
    - 创建 layouts/modules/theme-drawer/components/theme-color.vue
    - 提供预设主题色选择（8种预设颜色）
    - 支持自定义主题色（颜色选择器）
    - 实时应用主题色到 CSS 变量
    - _需求: 7.1_

  - [x] 11.4 创建布局模式配置组件
    - 创建 layouts/modules/theme-drawer/components/layout-mode.vue
    - 提供布局模式选择（垂直/水平/混合）
    - 显示布局模式的预览图
    - 实时切换布局模式
    - _需求: 7.1_

  - [x] 11.5 创建布局配置组件
    - 创建 layouts/modules/theme-drawer/components/layout-config.vue
    - 提供侧边栏宽度调整（滑块）
    - 提供标签页显示开关
    - 提供面包屑显示开关
    - 提供页脚显示开关
    - 提供固定头部开关
    - 提供固定侧边栏开关
    - _需求: 7.1_

  - [x] 11.6 实现配置操作功能
    - 实现"重置为默认"按钮功能
    - 实现"复制配置"按钮功能（复制到剪贴板）
    - 实时预览配置更改
    - 保存配置到 localStorage
    - _需求: 7.2, 7.3, 7.4, 7.5, 7.6_

  - [x] 11.7 添加主题抽屉触发按钮
    - 在页面右侧添加浮动按钮
    - 点击打开主题抽屉
    - 支持键盘快捷键（Alt + T）
    - _需求: 7.7_

  - [ ]* 11.8 为主题配置编写基于属性的测试
    - **属性 8: 主题配置实时应用一致性**
    - **验证需求: 7.3**

- [x] 12. 实现垂直布局容器
  - 更新 layouts/default/index.vue
  - 使用 Flex 布局组织页面结构
  - 在顶部显示 GlobalHeader
  - 在左侧显示 GlobalSider
  - 在右侧主内容区显示 GlobalTab、GlobalBreadcrumb 和 router-view
  - 在底部显示 GlobalFooter（可选）
  - 根据 App Store 的配置控制各组件的显示/隐藏
  - 添加 ThemeDrawer 组件
  - _需求: 1.1, 2.8, 3.8_

- [x] 13. 实现水平布局容器
  - 创建 layouts/horizontal/index.vue
  - 在顶部显示 GlobalHeader（包含水平菜单）
  - 主内容区显示 GlobalTab、GlobalBreadcrumb 和 router-view
  - 在底部显示 GlobalFooter（可选）
  - 不显示 GlobalSider
  - 添加 ThemeDrawer 组件
  - _需求: 1.1, 3.9_

- [x] 14. 实现混合布局容器
  - 创建 layouts/mix/index.vue
  - 在顶部显示 GlobalHeader（包含顶级菜单）
  - 在左侧显示 GlobalSider（显示二级菜单）
  - 在右侧主内容区显示 GlobalTab、GlobalBreadcrumb 和 router-view
  - 在底部显示 GlobalFooter（可选）
  - 实现顶级菜单和侧边栏菜单的联动
  - 添加 ThemeDrawer 组件
  - _需求: 1.1_

- [x] 15. 实现布局路由配置
  - 创建 layouts/index.vue 布局选择器
  - 根据 App Store 的 layoutMode 动态选择布局组件
  - 为不同的路由配置对应的布局
  - 确保登录页等特殊页面使用 blank 布局
  - 创建 views/redirect/index.vue 用于页面刷新
  - _需求: 1.1, 1.3_

- [ ]* 15.1 为布局模式切换编写基于属性的测试
  - **属性 1: 布局模式切换一致性**
  - **验证需求: 1.3, 1.4**

- [x] 16. 添加最小宽度限制
  - 在根元素添加 min-width: 1280px 样式
  - 在窗口宽度小于 1280px 时显示水平滚动条
  - 在控制台记录警告信息
  - _需求: 8.2, 8.3_

- [x] 17. 实现布局动画和过渡
  - 为侧边栏折叠/展开添加过渡动画（transition: width 0.3s）
  - 为布局模式切换添加淡入淡出动画
  - 为菜单展开/折叠添加滑动动画
  - 为标签页切换添加滑动动画
  - 为页面切换添加过渡动画（fade-slide）
  - 确保所有动画持续时间不超过 300ms
  - 添加禁用动画的配置选项
  - _需求: 10.1, 10.2, 10.3, 10.4, 10.5, 10.6_

- [ ]* 18. 实现键盘快捷键支持（可选 - 暂不实施）
  - 创建 hooks/use-keyboard-shortcuts.ts
  - 实现快捷键监听和处理
  - 注册以下快捷键：
    - Alt + S: 折叠/展开侧边栏
    - Alt + T: 打开主题抽屉
    - Alt + F: 全屏切换
    - Ctrl/Cmd + W: 关闭当前标签页
    - Ctrl/Cmd + K: 打开全局搜索
  - 在布局组件中使用快捷键 hook
  - _需求: 12.1_

- [ ]* 19. 实现可访问性支持（可选 - 暂不实施）
  - 为所有交互元素添加 aria-label
  - 为菜单添加 role="navigation"
  - 为标签页添加 role="tablist"
  - 支持 Tab 键在菜单项之间导航
  - 支持 Enter 键激活菜单项
  - 确保焦点状态清晰可见（outline 样式）
  - 测试屏幕阅读器兼容性
  - _需求: 12.2, 12.3, 12.4, 12.5, 12.6_

- [x] 20. 性能优化
  - 使用 v-show 代替 v-if 优化频繁切换的组件
  - 使用 computed 缓存菜单渲染结果
  - 使用防抖处理窗口 resize 事件（已在任务3实现）
  - 在标签页数量超过 20 个时显示警告
  - _需求: 11.1, 11.2, 11.3, 11.4, 11.5, 11.6_

- [x] 21. 检查点 - 确保布局系统正常工作
  - 测试所有布局模式切换（垂直、水平、混合）
  - 测试窗口尺寸调整（最小宽度 1280px）
  - 测试菜单导航和权限过滤
  - 测试标签页操作（添加、删除、切换、拖拽排序）
  - 测试主题配置和持久化（主题模式、主题色、布局配置）
  - 确保所有功能正常，如有问题请询问用户

## 功能检查清单

### 核心布局功能
- [x] 三种布局模式（垂直、水平、混合）可正常切换
- [x] 侧边栏折叠/展开功能正常
- [x] 侧边栏宽度可配置
- [x] 固定头部和侧边栏功能
- [x] 最小宽度限制（1280px）

### 菜单系统
- [x] 菜单支持最多3级嵌套
- [x] 菜单权限过滤
- [x] 菜单折叠时的弹出效果
- [x] 菜单项高亮显示当前路由
- [x] 菜单图标和徽章显示

### 标签页系统
- [x] 标签页自动添加和激活
- [x] 标签页关闭功能
- [x] 固定标签页（不可关闭）
- [x] 标签页右键菜单（刷新、关闭、关闭其他等）
- [x] 标签页拖拽排序
- [x] 标签页滚动控制
- [x] 标签页数量警告（超过20个）

### 主题配置
- [x] 亮色/暗色主题切换
- [x] 8种预设主题色
- [x] 自定义主题色（颜色选择器）
- [x] 主题色实时应用到CSS变量
- [x] 布局模式配置
- [x] 布局选项配置（标签页、面包屑、页脚等）
- [x] 配置持久化到localStorage
- [x] 复制配置到剪贴板
- [x] 重置为默认配置

### 其他功能
- [x] 面包屑导航
- [x] 全屏切换
- [x] 全局搜索
- [x] 通知消息
- [x] 用户中心
- [x] 页脚显示
- [x] 布局动画和过渡效果

### 性能优化
- [x] 使用v-show优化频繁切换组件
- [x] 使用computed缓存菜单渲染
- [x] 窗口resize事件防抖（300ms）
- [x] 标签页数量警告（>20个）

### 待实现功能（可选）
- [ ] 键盘快捷键支持（任务18）
- [ ] 可访问性支持（任务19）
- [ ] 长菜单列表虚拟滚动
- [ ] 懒加载非首屏组件

- [ ]* 22. 编写集成测试
  - 测试完整的布局切换流程
  - 测试菜单导航和标签页联动
  - 测试窗口尺寸适配
  - 测试主题配置的持久化和恢复
  - _需求: 1.3, 4.5, 5.4, 7.6_

- [ ] 23. 最终检查点 - 确保所有测试通过
  - 运行所有单元测试和基于属性的测试
  - 检查代码覆盖率（目标 80% 以上）
  - 验证性能指标
  - 确保所有测试通过，如有问题请询问用户

## 注意事项

- 标记为 `*` 的任务是可选的，可以跳过以加快 MVP 开发
- 每个任务都引用了具体的需求以便追溯
- 检查点确保增量验证
- 优先实现核心布局功能，然后再添加高级特性
- 使用 Element Plus 组件库加快开发速度
- 本版本仅支持桌面环境（Desktop），最小窗口宽度 1280px
- 可访问性功能（键盘快捷键、ARIA 支持等）标记为可选，暂不实施
- 注意性能优化，避免不必要的重新渲染
