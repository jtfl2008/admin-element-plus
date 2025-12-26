/**
 * SelectTable 组件类型定义
 */

/** 表格列配置 */
export interface SelectTableColumn {
    /** 列属性名 */
    prop: string;
    /** 列标题 */
    label: string;
    /** 列宽度 */
    width?: string | number;
    /** 最小宽度 */
    minWidth?: string | number;
    /** 对齐方式 */
    align?: 'left' | 'center' | 'right';
    /** 是否固定列 */
    fixed?: boolean | 'left' | 'right';
    /** 格式化类型 */
    formatType?: 'dateTime';
    /** 日期格式化模式 */
    formatDateTime?: string;
    /** 字典选项 */
    options?: { label: string; value: any }[];
}

/** 搜索字段配置 */
export interface SelectTableField {
    /** 字段属性名 */
    prop: string;
    /** 字段标签 */
    label: string;
    /** 组件类型 */
    component: 'input' | 'select' | 'date-picker' | 'input-number';
    /** 占位符 */
    placeholder?: string;
    /** 字典选项（select 组件使用） */
    options?: { label: string; value: any }[];
    /** 组件额外属性 */
    props?: Record<string, any>;
}

/** 数据获取函数返回值 */
export interface FetchDataResult<T = any> {
    /** 数据列表 */
    rows: T[];
    /** 总条数 */
    total: number;
}

/** 数据获取函数参数 */
export interface FetchDataParams {
    pageNum: number;
    pageSize: number;
    [key: string]: any;
}

/** 组件 Props */
export interface SelectTableProps {
    /** 标题 */
    title?: string;
    /** 是否多选 */
    multiple?: boolean;
    /** 表格列配置 */
    columns?: SelectTableColumn[];
    /** 搜索字段配置 */
    queryFields?: SelectTableField[];
    /** 数据获取函数 */
    fetchData?: (params: FetchDataParams) => Promise<FetchDataResult>;
    /** 行唯一标识字段 */
    rowKey?: string;
    /** 显示字段（用于显示已选项的文本） */
    labelKey?: string;
    /** 值字段（用于简单值绑定，默认使用 rowKey） */
    valueKey?: string;
    /** 每页条数 */
    pageSize?: number;
    /** 弹出框宽度 */
    popoverWidth?: string;
    /** 默认选中项 */
    defaultSelection?: any[];
}

/** 组件暴露方法 */
export interface SelectTableExpose {
    /** 打开弹出框 */
    open: () => void;
    /** 关闭弹出框 */
    close: () => void;
    /** 清空选择 */
    clear: () => void;
    /** 获取当前选中项 */
    getSelection: () => any[];
}
