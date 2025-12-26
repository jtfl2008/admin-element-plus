/**
 * DialogForm 组件类型定义
 * @description 可复用的对话框表单组件，支持表单、表格、自定义插槽
 */

import type { Component } from 'vue';
import type { FormRules, FormInstance } from 'element-plus';

// ==================== 按钮类型 ====================

/** 按钮类型 */
export type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'default' | '';

/** 自定义按钮配置 */
export interface CustomButton {
    /** 按钮唯一标识 */
    key: string;
    /** 按钮文本 */
    label: string;
    /** 按钮类型 */
    type?: ButtonType;
    /** 点击事件处理函数 */
    onClick: () => void | Promise<void>;
    /** 是否显示加载状态 */
    loading?: boolean;
    /** 是否禁用 */
    disabled?: boolean | (() => boolean);
    /** 是否显示 */
    visible?: boolean | (() => boolean);
    /** 按钮图标 */
    icon?: Component | string;
}

// ==================== 表单字段配置 ====================

/** 表单字段组件类型（支持自定义组件对象或字符串名称） */
export type FieldComponentType =
    | 'input'
    | 'select'
    | 'date-picker'
    | 'input-number'
    | 'switch'
    | 'radio-group'
    | 'checkbox-group'
    | string      // 允许任意字符串（Element Plus 组件名或自定义组件名）
    | Component;  // 允许直接传递组件对象（推荐用于自定义组件）

/** 选项配置（用于 select、radio-group 等） */
export interface FieldOption {
    label: string;
    value: string | number | boolean;
    disabled?: boolean;
}

/** 表单字段配置 */
export interface FormFieldConfig {
    /** 字段名（绑定到 formData 的键名） */
    prop: string;
    /** 字段标签 */
    label: string;
    /** 组件类型 */
    component: FieldComponentType;
    /** 占据栅格数（默认 12，即半行） */
    span?: number;
    /** 占位符 */
    placeholder?: string;
    /** 是否禁用 */
    disabled?: boolean | (() => boolean);
    /** 选项（用于 select、radio-group 等） */
    options?: FieldOption[];
    /** 组件类型（用于 input 组件）
     * - 'text': 普通文本输入框（默认）
     * - 'textarea': 文本域（多行输入）
     * - 'date': 日期选择器类型（用于 date-picker）
     * - 'datetime': 日期时间选择器
     * - 'daterange': 日期范围选择器
     * - 'datetimerange': 日期时间范围选择器
     */
    type?: 'text' | 'textarea' | 'date' | 'datetime' | 'daterange' | 'datetimerange';
    /** 数字输入最小值 */
    min?: number;
    /** 数字输入最大值 */
    max?: number;
    /** 文本域行数（仅 component='input' 且 type='textarea' 时有效，默认 3） */
    rows?: number;
    /** 是否可见 */
    visible?: boolean | (() => boolean);
    /** 点击事件（用于 input 触发选择弹窗等） */
    onClick?: () => void;
    /** 是否为自定义组件（可选，当 component 为字符串且需要特殊处理时使用） */
    customComponent?: boolean;
}

// ==================== 表格配置 ====================

/** 表格列配置 */
export interface TableColumnConfig {
    /** 字段名 */
    prop: string;
    /** 列标题 */
    label: string;
    /** 宽度 */
    width?: number | string;
    /** 对齐方式 */
    align?: 'left' | 'center' | 'right';
    /** 是否可编辑 */
    editable?: boolean;
    /** 编辑组件类型 */
    editComponent?: FieldComponentType;
    /** 编辑组件选项 */
    editOptions?: FieldOption[];
    /** 验证规则 */
    rules?: FormRules[string];
}

/** 表格工具栏配置 */
export interface TableToolbarConfig {
    /** 标识 */
    key: string;
    /** 按钮文本 */
    label: string;
    /** 按钮类型 */
    type?: ButtonType;
    /** 按钮图标 */
    icon?: Component | string;
    /** 点击事件 */
    onClick: () => void;
    /** 是否禁用 */
    disabled?: boolean | (() => boolean);
}

/** 表格段落配置 */
export interface TableSectionConfig {
    /** 绑定到 formData 的键名 */
    dataKey: string;
    /** 表格列配置 */
    columns: TableColumnConfig[];
    /** 工具栏配置（默认包含新增、批量删除） */
    toolbars?: TableToolbarConfig[];
    /** 是否显示选择列 */
    selection?: boolean;
    /** 是否显示序号列 */
    index?: boolean;
    /** 新增行的默认数据 */
    defaultRowData?: Record<string, any>;
}

// ==================== 分段配置 ====================

/** 表单分段 */
export interface FormSection {
    type: 'form';
    /** 分段标题 */
    title?: string;
    /** 表单字段配置 */
    fields: FormFieldConfig[];
    /** 验证规则 */
    rules?: FormRules;
    /** 是否可见 */
    visible?: boolean | (() => boolean);
}

/** 表格分段 */
export interface TableSection {
    type: 'table';
    /** 分段标题 */
    title?: string;
    /** 表格配置 */
    tableConfig: TableSectionConfig;
    /** 是否可见 */
    visible?: boolean | (() => boolean);
}

/** 上传分段 */
export interface UploadSection {
    type: 'upload';
    /** 分段标题 */
    title?: string;
    /** 上传配置 */
    uploadConfig: {
        /** 绑定到 formData 的键名 */
        dataKey: string;
        /** 文件数量限制 */
        limit?: number;
        /** 允许的文件类型 */
        fileType?: string[];
        /** 文件大小限制（MB） */
        fileSize?: number;
    };
    /** 是否可见 */
    visible?: boolean | (() => boolean);
}

/** 自定义分段 */
export interface CustomSection {
    type: 'custom';
    /** 分段标题 */
    title?: string;
    /** 插槽名称 */
    slotName: string;
    /** 是否可见 */
    visible?: boolean | (() => boolean);
}

/** 分段配置联合类型 */
export type SectionConfig = FormSection | TableSection | UploadSection | CustomSection;

// ==================== 组件 Props & Emits ====================

/** DialogForm 组件 Props */
export interface DialogFormProps {
    /** 是否显示对话框（v-model） */
    modelValue: boolean;
    /** 对话框标题 */
    title: string;
    /** 表单数据（v-model:formData） */
    formData: Record<string, any>;
    /** 分段配置 */
    sections: SectionConfig[];
    /** 全局验证规则（可被分段规则覆盖） */
    rules?: FormRules;
    /** 对话框宽度 */
    width?: string;
    /** 表单标签宽度 */
    labelWidth?: string;
    /** 自定义按钮配置 */
    customButtons?: CustomButton[];
    /** 是否显示默认按钮（确认/取消） */
    showDefaultButtons?: boolean;
    /** 确认按钮加载状态 */
    confirmLoading?: boolean;
    /** 确认按钮文本 */
    confirmText?: string;
    /** 取消按钮文本 */
    cancelText?: string;
}

/** DialogForm 组件 Emits */
export interface DialogFormEmits {
    (e: 'update:modelValue', value: boolean): void;
    (e: 'update:formData', value: Record<string, any>): void;
    (e: 'confirm', data: Record<string, any>): void;
    (e: 'cancel'): void;
    /** 表格行选择变化 */
    (e: 'selection-change', dataKey: string, selection: any[]): void;
    /** 表格行新增 */
    (e: 'table-add', dataKey: string): void;
    /** 表格行删除 */
    (e: 'table-delete', dataKey: string, rows: any[]): void;
}

/** DialogForm 组件暴露方法 */
export interface DialogFormExpose {
    /** 验证表单 */
    validate: () => Promise<boolean>;
    /** 重置表单验证 */
    resetFields: () => void;
    /** 清除验证 */
    clearValidate: (props?: string | string[]) => void;
    /** 表单实例 */
    formRef: FormInstance | undefined;
}
