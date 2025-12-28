/**
 * 图标选择器工具函数
 */

/**
 * 获取本地菜单图标列表
 * @returns 本地图标名称数组
 */
export function getLocalMenuIcons(): string[] {
  // 这里返回预定义的本地图标列表
  // 实际项目中可以根据实际的本地图标资源动态获取
  return [
    'local-icon-dashboard',
    'local-icon-system',
    'local-icon-user',
    'local-icon-role',
    'local-icon-menu',
    'local-icon-dept',
    'local-icon-post',
    'local-icon-dict',
    'local-icon-config',
    'local-icon-notice',
    'local-icon-log',
    'local-icon-monitor',
    'local-icon-job',
    'local-icon-online',
    'local-icon-tool',
    'local-icon-build',
    'local-icon-swagger',
    'local-icon-druid',
    'local-icon-server',
    'local-icon-cache'
  ]
}

/**
 * 判断图标是否为本地图标
 * @param iconName 图标名称
 * @returns 是否为本地图标
 */
export function isLocalIcon(iconName: string): boolean {
  return !!(iconName && iconName.startsWith('local-icon-'))
}

/**
 * 获取图标类型
 * @param iconName 图标名称
 * @returns 图标类型 '1' 为 Iconify，'2' 为本地图标
 */
export function getIconType(iconName: string): '1' | '2' {
  return isLocalIcon(iconName) ? '2' : '1'
}
