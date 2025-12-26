/**
 * ConfigurableForm 组件类型定义
 * @description 可配置化动态表单组件的所有 TypeScript 接口定义
 */

import type { Component } from 'vue';
import type { FormRules, FormInstance } from 'element-plus';

/** 表单字段组件类型 */
export type FieldComponentType =
  | 'input'
  | 'textarea'
  | 'input-number'
  | 'select'
  | 'date-picker'
  | 'radio-group'
  | 'checkbox-group'
  | 'switch';

/** 日期选择器类型 */
export type DatePickerType =
  | 'date'
  | 'datetime'
  | 'daterange'
  | 'datetimerange'
  | 'monthrange'
  | 'month'
  | 'dates';

/**
 * 字段选项配置
 */
export interface FieldOption {
  /** 显示标签 */
  label: string;
  /** 选项值 */
  value: string | number | boolean;
  /** 是否禁用 */
  disabled?: boolean;
}

/**
 * 表单字段配置
 */
export interface FormFieldConfig {
  /** 字段名称（对应 modelValue 的 key） */
  prop: string;
  /** 字段标签 */
  label: string;
  /** 组件类型 */
  component: FieldComponentType;
  /** 占据栅格数（默认继承 defaultSpan） */
  span?: number;
  /** 占位符文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否显示（false 时隐藏） */
  visible?: boolean;
  /** 选项列表（select/radio-group/checkbox-group 使用） */
  options?: FieldOption[];
  /** 日期选择器类型 */
  type?: DatePickerType;
  /** 日期范围字段映射 [开始字段, 结束字段] */
  propsMap?: [string, string];
  /** 开始日期占位符（daterange 使用） */
  startPlaceholder?: string;
  /** 结束日期占位符（daterange 使用） */
  endPlaceholder?: string;
  /** 数字输入最小值 */
  min?: number;
  /** 数字输入最大值 */
  max?: number;
  /** 文本域行数 */
  rows?: number;
  /** 扩展属性（透传给组件） */
  [key: string]: any;
}

/**
 * 组件 Props 定义
 */
export interface ConfigurableFormProps {
  /** v-model 绑定的表单数据 */
  modelValue: Record<string, any>;
  /** 表单字段配置数组 */
  fields: FormFieldConfig[];
  /** 表单验证规则 */
  rules?: FormRules;
  /** 是否为查询模式（显示查询/重置按钮） */
  query?: boolean;
  /** 表单标签宽度 */
  labelWidth?: string;
  /** 默认字段占据的列数（24 栅格系统） */
  defaultSpan?: number;
}

/**
 * 组件 Emits 定义
 */
export interface ConfigurableFormEmits {
  /** 表单数据更新 */
  (e: 'update:modelValue', value: Record<string, any>): void;
  /** 点击查询按钮（仅 query 模式） */
  (e: 'on-query', formData: Record<string, any>): void;
  /** 点击重置按钮（仅 query 模式） */
  (e: 'on-reset'): void;
}

/**
 * 组件暴露的方法和属性
 */
export interface ConfigurableFormExpose {
  /** 验证表单 */
  validate: () => Promise<boolean>;
  /** 重置表单 */
  resetFields: () => void;
  /** 清除验证 */
  clearValidate: (props?: string | string[]) => void;
  /** 表单实例引用 */
  formRef: FormInstance | undefined;
}
