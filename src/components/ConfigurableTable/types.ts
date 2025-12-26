/**
 * ConfigurableTable 组件类型定义
 * @description 可配置化表格组件的所有 TypeScript 接口定义
 */

import type { Component } from 'vue';
import type { TableInstance } from 'element-plus';

/** 按钮类型 */
export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default';

/** 对齐方式 */
export type AlignType = 'left' | 'center' | 'right';

/** 固定位置 */
export type FixedType = boolean | 'left' | 'right';

/**
 * 字典选项配置
 */
export interface OptionItem {
  /** 显示标签 */
  label: string;
  /** 选项值 */
  value: string | number;
  /** 扩展属性 */
  [key: string]: any;
}

/**
 * 操作按钮配置
 */
export interface ButtonItem {
  /** 按钮文本 */
  label: string;
  /** 点击回调函数 */
  click: (scope: TableScope) => void;
  /** 按钮类型 */
  type?: ButtonType;
  /** 是否禁用（函数形式，接收 scope 参数） */
  disabled?: (scope: TableScope) => boolean;
  /** 按钮图标 */
  icon?: Component | string;
  /** 扩展属性（透传给 el-button） */
  [key: string]: any;
}

/**
 * 工具栏按钮配置
 */
export interface ToolbarItem {
  /** 按钮文本 */
  label: string;
  /** 点击回调函数 */
  click: () => void;
  /** 按钮图标 */
  icon?: Component | string;
  /** 是否禁用（函数形式） */
  disabled?: () => boolean;
  /** 按钮类型 */
  type?: ButtonType;
  /** 扩展属性（透传给 el-button） */
  [key: string]: any;
}

/**
 * 列配置
 */
export interface ColumnItem {
  /** 字段名称 */
  prop?: string;
  /** 列标题 */
  label?: string;
  /** 列宽度 */
  width?: string | number;
  /** 最小列宽度 */
  minWidth?: string | number;
  /** 固定列位置 */
  fixed?: FixedType;
  /** 对齐方式 */
  align?: AlignType;
  /** 自定义单元格插槽名称 */
  cellSlot?: string;
  /** 操作按钮列表（设置后该列自动固定在右侧） */
  buttons?: ButtonItem[];
  /** 格式化类型 */
  formatType?: 'dateTime';
  /** 日期时间格式（默认 'YYYY-MM-DD HH:mm:ss'） */
  formatDateTime?: string;
  /** 字典选项（用于值到标签的映射） */
  options?: OptionItem[];
  /** 嵌套子列 */
  children?: ColumnItem[];
  /** 是否显示 tooltip */
  'show-overflow-tooltip'?: boolean;
  /** 扩展属性（透传给 el-table-column） */
  [key: string]: any;
}

/**
 * 表格作用域对象
 */
export interface TableScope {
  /** 当前行数据 */
  row: Record<string, any>;
  /** 当前列配置 */
  column: any;
  /** 行索引 */
  $index: number;
}

/**
 * 组件 Props 定义
 */
export interface ConfigurableTableProps {
  /** 工具栏按钮配置 */
  toolbars?: ToolbarItem[];
  /** 表格数据 */
  data: Record<string, any>[];
  /** 列配置 */
  columns: ColumnItem[];
  /** 是否显示序号列 */
  index?: boolean;
  /** 是否显示多选列 */
  selection?: boolean;
  /** 当前页码（支持 v-model:pageNo） */
  pageNo?: number;
  /** 每页条数（支持 v-model:pageSize） */
  pageSize?: number;
  /** 数据总条数 */
  total?: number;
  /** 是否显示边框 */
  showBorder?: boolean;
  /** 是否显示分页 */
  showPagination?: boolean;
  /** 每页条数选项 */
  pageSizes?: number[];
  /** 空数据文本 */
  emptyText?: string;
}

/**
 * 组件暴露的方法和属性
 */
export interface ConfigurableTableExpose {
  /** 表格实例引用 */
  tableRef: TableInstance | undefined;
  /** 清除所有选择 */
  clearSelection: () => void;
  /** 获取选中的行数据 */
  getSelectionRows: () => any[];
  /** 切换某一行的选中状态 */
  toggleRowSelection: (row: any, selected?: boolean) => void;
  /** 切换所有行的选中状态 */
  toggleAllSelection: () => void;
}

/**
 * getLabelByValue 函数参数
 */
export interface GetLabelByValueOptions {
  /** 要查找的值 */
  value: string | number | undefined | null;
  /** 标签字段名 */
  labelKey?: string;
  /** 值字段名 */
  valueKey?: string;
  /** 选项列表 */
  options: OptionItem[];
}

