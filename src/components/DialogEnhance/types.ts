/**
 * DialogEnhance 组件类型定义
 * @description 基于 Element Plus el-dialog 的增强型对话框组件
 */

import type { Component } from 'vue';
import type { DialogProps, DialogInstance } from 'element-plus';

/** 按钮类型 */
export type ButtonType =
  | 'primary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info'
  | 'default'
  | '';

/**
 * 自定义按钮配置项
 */
export interface CustomButtonItem {
  /** 按钮唯一标识（可选，用于 key） */
  key?: string | number;
  /** 按钮文本 */
  label: string;
  /** 按钮类型 */
  type?: ButtonType;
  /** 是否禁用 - 支持布尔值或函数 */
  disabled?: boolean | (() => boolean);
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 按钮图标 */
  icon?: Component | string;
  /** 点击事件处理函数 */
  onClick?: () => void | Promise<void>;
  /** 是否显示该按钮，默认 true */
  visible?: boolean | (() => boolean);
  /** 扩展属性（透传给 el-button） */
  [key: string]: any;
}

/**
 * 组件 Props 定义（扩展 el-dialog 原有属性）
 */
export interface DialogEnhanceProps extends Partial<DialogProps> {
  /** 是否显示对话框（v-model） */
  modelValue?: boolean;
  /** 是否显示默认按钮（取消、确定），默认 true */
  showDefaultButtons?: boolean;
  /** 自定义按钮配置数组 */
  customButtons?: CustomButtonItem[];
  /** 确定按钮文本，默认 "确定" */
  confirmText?: string;
  /** 取消按钮文本，默认 "取消" */
  cancelText?: string;
  /** 确定按钮是否显示加载状态 */
  confirmLoading?: boolean;
  /** 是否在点击确定后自动关闭对话框，默认 false */
  closeOnConfirm?: boolean;
  /** 是否显示底部区域，默认 true */
  showFooter?: boolean;
  /** 确定按钮类型，默认 "primary" */
  confirmButtonType?: ButtonType;
  /** 取消按钮类型，默认 "" */
  cancelButtonType?: ButtonType;
}

/**
 * 组件 Emits 定义
 */
export interface DialogEnhanceEmits {
  /** 更新 modelValue */
  (e: 'update:modelValue', value: boolean): void;
  /** 取消事件 */
  (e: 'cancel'): void;
  /** 确认事件 */
  (e: 'confirm'): void;
  /** 对话框打开时触发 */
  (e: 'open'): void;
  /** 对话框打开动画结束时触发 */
  (e: 'opened'): void;
  /** 对话框关闭时触发 */
  (e: 'close'): void;
  /** 对话框关闭动画结束时触发 */
  (e: 'closed'): void;
}

/**
 * 组件暴露的方法和属性
 */
export interface DialogEnhanceExpose {
  /** 关闭对话框 */
  close: () => void;
  /** 打开对话框 */
  open: () => void;
  /** el-dialog 实例引用 */
  dialogRef: DialogInstance | undefined;
}
