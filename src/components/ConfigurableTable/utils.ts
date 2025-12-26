/**
 * ConfigurableTable 组件工具函数
 */

import { dayjs } from 'element-plus';
import type { GetLabelByValueOptions, OptionItem, ColumnItem } from './types';

/**
 * 根据值获取对应的标签文本
 * @param options 配置选项
 * @returns 标签文本，未找到返回空字符串
 */
export const getLabelByValue = ({
  value,
  labelKey = 'label',
  valueKey = 'value',
  options,
}: GetLabelByValueOptions): string => {
  if (value === undefined || value === null || !options?.length) {
    return '';
  }
  const item = options.find((opt) => opt[valueKey] === value);
  return item?.[labelKey] ?? '';
};

/**
 * 格式化日期时间
 * @param value 日期值
 * @param format 格式化模板，默认 'YYYY-MM-DD HH:mm:ss'
 * @returns 格式化后的日期字符串
 */
export const formatDateTime = (
  value: string | number | Date | undefined | null,
  format = 'YYYY-MM-DD HH:mm:ss',
): string => {
  if (!value) return '';
  const date = dayjs(value);
  return date.isValid() ? date.format(format) : '';
};

/**
 * 创建选项值到标签的映射 Map
 * @param options 选项列表
 * @param valueKey 值字段名
 * @param labelKey 标签字段名
 * @returns Map 对象
 */
export const createOptionsMap = (
  options: OptionItem[],
  valueKey = 'value',
  labelKey = 'label',
): Map<string | number, string> => {
  const map = new Map<string | number, string>();
  options.forEach((opt) => {
    if (opt[valueKey] !== undefined) {
      map.set(opt[valueKey], opt[labelKey] ?? '');
    }
  });
  return map;
};

/**
 * 计算操作列的最佳宽度
 * @param buttons 按钮配置数组
 * @returns 计算出的宽度值
 */
const calculateButtonColumnWidth = (buttons: any[]): number => {
  if (!buttons?.length) return 160;

  // link 按钮的基础计算：
  // - 纯文本按钮：约 50-60px（取决于文字长度）
  // - 带图标按钮：约 60-70px
  // - 按钮间距：约 8px

  let totalWidth = 40; // 左右内边距

  buttons.forEach((btn) => {
    // 计算文本宽度（中文字符约14px，2个字符约28px，加上内边距约15px）
    const textLength = btn.label?.length || 2;
    const textWidth = textLength * 14 + 15;

    // 如果有图标，额外增加宽度
    const iconWidth = btn.icon ? 20 : 0;

    // 单个按钮的宽度
    const buttonWidth = textWidth + iconWidth;

    totalWidth += buttonWidth + 8; // 8px 为按钮间距
  });

  // 确保最小宽度
  return Math.max(totalWidth, 120);
};

/**
 * 获取列的绑定属性
 * @param column 列配置
 * @returns 处理后的属性对象
 */
export const getColumnBindProps = (column: ColumnItem): Record<string, any> => {
  const {
    cellSlot,
    buttons,
    formatType,
    formatDateTime,
    options,
    children,
    ...rest
  } = column;

  // 如果是操作按钮列且没有指定 width 或 minWidth，自动计算宽度
  const autoWidth = buttons?.length && !column.width && !column.minWidth
    ? calculateButtonColumnWidth(buttons)
    : undefined;

  return {
    ...rest,
    // 如果有操作按钮且未指定 fixed，则默认固定在右侧
    fixed: buttons?.length ? column.fixed ?? 'right' : column.fixed,
    // 默认开启 tooltip
    'show-overflow-tooltip': column.buttons?.length
      ? false
      : column['show-overflow-tooltip'] ?? true,
    align: column.align ?? 'center',
    // 优先使用配置的 width，其次用自动计算的宽度，最后用 minWidth
    ...(autoWidth ? { minWidth: autoWidth } : { minWidth: column.minWidth ?? 160 }),
  };
};

/**
 * 判断列是否需要渲染自定义内容
 * @param column 列配置
 * @returns 是否需要自定义渲染
 */
export const hasCustomContent = (column: ColumnItem): boolean => {
  return !!(
    column.cellSlot ||
    column.buttons?.length ||
    column.formatType ||
    column.options?.length
  );
};
