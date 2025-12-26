<template>
  <div class="select-table-wrapper">
    <!-- 选择框（类似 el-select 的输入框样式） -->
    <el-popover
      ref="popoverRef"
      v-model:visible="visible"
      :width="props.popoverWidth"
      placement="bottom-start"
      trigger="click"
      :teleported="true"
      popper-class="select-table-dropdown"
    >
      <template #reference>
        <div
          class="select-table-trigger"
          :class="{ 'is-focus': visible, 'is-disabled': props.disabled }"
          @click="handleTriggerClick"
          @blur="handleBlur"
        >
          <!-- 显示已选内容 -->
          <div class="select-table-trigger__content">
            <template v-if="displayValue">
              <!-- 多选模式：显示标签 -->
              <template v-if="props.multiple && selectedRows.length > 0">
                <el-tag
                  v-for="(item, index) in selectedRows.slice(
                    0,
                    props.maxTagCount,
                  )"
                  :key="item[props.rowKey]"
                  closable
                  size="small"
                  @close="handleRemoveTag(index)"
                >
                  {{ getDisplayLabel(item) }}
                </el-tag>
                <el-tag
                  v-if="selectedRows.length > props.maxTagCount"
                  size="small"
                >
                  +{{ selectedRows.length - props.maxTagCount }}
                </el-tag>
              </template>
              <!-- 单选模式：显示文本 -->
              <span v-else class="select-table-trigger__text">{{
                displayValue
              }}</span>
            </template>
            <span v-else class="select-table-trigger__placeholder">{{
              props.placeholder
            }}</span>
          </div>
          <!-- 清空按钮 -->
          <el-icon
            v-if="props.clearable && selectedRows.length > 0"
            class="select-table-trigger__clear"
            @click.stop="handleClear"
          >
            <CircleClose />
          </el-icon>
          <!-- 下拉箭头 -->
          <el-icon
            class="select-table-trigger__arrow"
            :class="{ 'is-reverse': visible }"
          >
            <ArrowDown />
          </el-icon>
        </div>
      </template>

      <!-- 下拉面板内容 -->
      <div class="select-table-panel">
        <!-- 搜索表单 -->
        <ConfigurableForm
          v-if="props.queryFields?.length"
          ref="queryFormRef"
          v-model="queryForm"
          :fields="props.queryFields"
          query
          :label-width="props.labelWidth || '80px'"
          :default-span="12"
          @on-query="handleQuery"
          @on-reset="handleReset"
        />

        <!-- 表格区域 -->
        <div class="select-table-panel__table">
          <el-table
            ref="tableRef"
            :data="tableData"
            :row-key="props.rowKey"
            :highlight-current-row="!props.multiple"
            border
            stripe
            max-height="300"
            @row-click="handleRowClick"
            @selection-change="handleSelectionChange"
          >
            <!-- 单选列：使用 Radio -->
            <el-table-column v-if="!props.multiple" width="55" align="center">
              <template #default="{ row }">
                <el-radio
                  v-model="selectedRowKey"
                  :label="row[props.rowKey]"
                  @change="handleRadioChange(row)"
                >
                  <span></span>
                </el-radio>
              </template>
            </el-table-column>

            <!-- 多选列：使用 Checkbox -->
            <el-table-column
              v-else
              type="selection"
              width="55"
              align="center"
            />

            <!-- 序号列 -->
            <el-table-column
              type="index"
              label="序号"
              width="60"
              align="center"
            />

            <!-- 动态列 -->
            <el-table-column
              v-for="col in props.columns"
              :key="col.prop"
              :prop="col.prop"
              :label="col.label"
              :width="col.width"
              :min-width="col.minWidth"
              :align="col.align || 'center'"
            />
          </el-table>
        </div>

        <!-- 分页 -->
        <div class="select-table-panel__pagination">
          <el-pagination
            v-if="total > 0"
            background
            small
            layout="total, prev, pager, next"
            :total="total"
            :current-page="pageNum"
            :page-size="props.pagination.pageSize"
            @current-change="handlePageChange"
          />
        </div>

        <!-- 底部操作栏（固定） -->
        <div class="select-table-panel__footer">
          <span class="select-table-panel__info">
            已选择 <strong>{{ selectedRows.length }}</strong> 项
          </span>
          <div class="select-table-panel__actions">
            <el-button @click="handleCancel">取消</el-button>
            <el-button type="primary" @click="handleConfirm">确定</el-button>
          </div>
        </div>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
/**
 * SelectTable - 下拉表格选择器组件
 * @description 类似 el-select 的交互方式，下拉面板中显示可搜索的表格
 * - 单选模式：使用 Radio Button
 * - 多选模式：使用 Checkbox
 */
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import type { Ref } from 'vue';
import { ArrowDown, CircleClose } from '@element-plus/icons-vue';
import type { TableInstance } from 'element-plus';
// @ts-ignore
import ConfigurableForm from '@/components/ConfigurableForm/index.vue';
import type { FormFieldConfig } from '@/components/ConfigurableForm/types';
import type {
  SelectTableColumn,
  FetchDataParams,
  FetchDataResult,
} from './types';

defineOptions({
  name: 'SelectTable',
});

// Props 定义
interface PaginationConfig {
  pageNum: number;
  pageSize: number;
}

interface SelectTableProps {
  /** v-model 绑定值（支持对象、数组、简单类型） */
  modelValue?: any[] | Record<string, any> | string | number | boolean | null;
  /** 占位符 */
  placeholder?: string;
  /** 是否多选 */
  multiple?: boolean;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否可清空 */
  clearable?: boolean;
  /** 表格列配置 */
  columns?: SelectTableColumn[];
  /** 搜索字段配置 */
  queryFields?: FormFieldConfig[];
  /** 数据获取函数 */
  fetchData?: ((params: FetchDataParams) => Promise<FetchDataResult>) | null;
  /** 行唯一标识 */
  rowKey?: string;
  /** 显示字段（用于显示已选项的文本） */
  labelKey?: string;
  /** 值字段（用于简单值绑定，默认使用 rowKey） */
  valueKey?: string;
  /** 下拉面板宽度 */
  popoverWidth?: string | number;
  /** 多选时最多显示的标签数 */
  maxTagCount?: number;
  /** 分页参数 */
  pagination?: PaginationConfig;
  /** 标签宽度 */
  labelWidth?: string;
}

const props = withDefaults(defineProps<SelectTableProps>(), {
  modelValue: null,
  placeholder: '请选择',
  multiple: false,
  disabled: false,
  clearable: true,
  columns: () => [],
  queryFields: () => [],
  fetchData: null,
  rowKey: 'id',
  labelKey: 'name',
  valueKey: '',
  popoverWidth: 600,
  maxTagCount: 3,
  pagination: () => ({ pageNum: 1, pageSize: 10 }),
  labelWidth: '100px',
});

// 事件定义
interface SelectTableEmits {
  (e: 'update:modelValue', value: any): void;
  (e: 'change', value: any): void;
  (e: 'confirm', value: any): void;
  (e: 'cancel'): void;
  (e: 'blur'): void;
}

const emit = defineEmits<SelectTableEmits>();

// Refs
const popoverRef = ref();
const queryFormRef = ref();
const tableRef = ref<TableInstance>();

// 状态
const visible = ref(false);
const tableData: Ref<any[]> = ref([]);
const total = ref(0);
const pageNum = ref(1);

const queryForm: Ref<Record<string, any>> = ref({});
const selectedRows: Ref<any[]> = ref([]);
const selectedRowKey: Ref<string | number | null> = ref(null);
const loading = ref(false);

// 计算实际使用的值字段（如果没有指定 valueKey，则使用 rowKey）
const actualValueKey = computed(() => props.valueKey || props.rowKey);

// 判断 modelValue 是否为简单类型
const isSimpleValue = computed(() => {
  if (props.modelValue === null || props.modelValue === undefined) return false;
  const type = typeof props.modelValue;
  if (props.multiple) {
    // 多选模式：检查数组元素是否为简单类型
    return (
      Array.isArray(props.modelValue) &&
      (props.modelValue.length === 0 ||
        ['string', 'number', 'boolean'].includes(typeof props.modelValue[0]))
    );
  } else {
    // 单选模式：检查值是否为简单类型
    return ['string', 'number', 'boolean'].includes(type);
  }
});

// 计算显示值
const displayValue = computed(() => {
  if (selectedRows.value.length === 0) return '';
  if (props.multiple) {
    return true; // 多选时显示标签
  }

  const firstItem = selectedRows.value[0];

  // 如果是简单值模式且 selectedRows 中存储的是简单值
  if (isSimpleValue.value && typeof firstItem !== 'object') {
    // 直接显示简单值
    return String(firstItem);
  }

  return getDisplayLabel(firstItem);
});

// 获取显示文本
const getDisplayLabel = (item: any): string => {
  if (!item) return '';

  // 如果是简单值，直接返回
  if (typeof item !== 'object') {
    return String(item);
  }

  return item[props.labelKey!] || item[props.rowKey!] || '';
};

// 初始化查询表单
const initQueryForm = () => {
  const form: Record<string, any> = {};
  props.queryFields?.forEach((field) => {
    form[field.prop] = undefined;
  });
  queryForm.value = form;
};

// 获取数据
const fetchTableData = async () => {
  if (!props.fetchData) return;

  loading.value = true;
  try {
    // 从 queryForm 中过滤掉 pageSize 和 pageNum，避免被外部数据覆盖
    const {
      pageSize: _,
      pageNum: __,
      ...cleanQueryForm
    } = queryForm.value || {};

    const params: FetchDataParams = {
      pageNum: pageNum.value,
      pageSize: props.pagination!.pageSize,
      ...cleanQueryForm,
    };

    const result = await props.fetchData(params);
    tableData.value = result.rows || [];
    total.value = result.total || 0;

    // 回显选中
    await nextTick();
    restoreSelection();
  } catch (error) {
    console.error('SelectTable 数据获取失败:', error);
    tableData.value = [];
    total.value = 0;
  } finally {
    loading.value = false;
  }
};

// 恢复选中状态
const restoreSelection = () => {
  if (!tableRef.value) return;

  if (isSimpleValue.value) {
    // 简单值模式：需要从 tableData 中查找匹配的行
    if (props.multiple) {
      // 多选模式：匹配多个值
      tableRef.value.clearSelection();

      const simpleValues = selectedRows.value; // 这里存储的是简单值数组
      const matchedRows: any[] = [];

      tableData.value.forEach((row) => {
        const rowValue = row[actualValueKey.value];
        if (simpleValues.includes(rowValue)) {
          matchedRows.push(row);
          tableRef.value!.toggleRowSelection(row, true);
        }
      });

      // 更新 selectedRows 为完整对象（用于显示）
      selectedRows.value = [...matchedRows];
    } else {
      // 单选模式：匹配单个值
      const simpleValue = selectedRows.value[0]; // 这里存储的是简单值
      const matchedRow = tableData.value.find(
        (row) => row[actualValueKey.value] === simpleValue,
      );

      if (matchedRow) {
        selectedRows.value = [matchedRow];
        selectedRowKey.value = matchedRow[props.rowKey!];
      } else {
        // 如果在当前页找不到匹配的行，保持简单值（可能在其他页）
        selectedRowKey.value = simpleValue;
      }
    }
  } else {
    // 对象模式：原有逻辑
    if (props.multiple) {
      // 多选模式：恢复 checkbox 选中
      tableRef.value.clearSelection();

      const rowKeyField = props.rowKey!;
      const selectedKeys = selectedRows.value.map((row) => row[rowKeyField]);

      tableData.value.forEach((row) => {
        if (selectedKeys.includes(row[rowKeyField])) {
          tableRef.value!.toggleRowSelection(row, true);
        }
      });
    } else {
      // 单选模式：设置 radio 选中
      if (selectedRows.value.length > 0) {
        selectedRowKey.value = selectedRows.value[0][props.rowKey!];
      }
    }
  }
};

// Radio 选中变化（单选模式）
const handleRadioChange = (row: any) => {
  selectedRows.value = [row];
};

// 行点击处理
const handleRowClick = (row: any) => {
  if (props.multiple) {
    // 多选模式：切换选中状态
    tableRef.value?.toggleRowSelection(row);
  } else {
    // 单选模式：选中当前行
    selectedRowKey.value = row[props.rowKey!];
    selectedRows.value = [row];
  }
};

// 多选 selection 变化
const handleSelectionChange = (selection: any[]) => {
  if (props.multiple) {
    const rowKeyField = props.rowKey!;
    const currentPageKeys = tableData.value.map((row) => row[rowKeyField]);
    const otherPageSelection = selectedRows.value.filter(
      (row) => !currentPageKeys.includes(row[rowKeyField]),
    );
    selectedRows.value = [...otherPageSelection, ...selection];
  }
};

// 触发器点击
const handleTriggerClick = () => {
  if (props.disabled) return;
};

// 处理失焦事件，触发表单验证
const handleBlur = () => {
  emit('blur');
};

// 分页
const handlePageChange = (page: number) => {
  pageNum.value = page;
  fetchTableData();
};

// 查询和重置
const handleQuery = () => {
  pageNum.value = 1;
  fetchTableData();
};

const handleReset = () => {
  initQueryForm();
  pageNum.value = 1;
  fetchTableData();
};

// 确认
const handleConfirm = () => {
  let modelValue: any; // v-model 绑定的值
  let changeValue: any; // change 事件传递的值

  if (props.multiple) {
    // 多选模式
    if (isSimpleValue.value) {
      // v-model 返回简单值数组
      modelValue = selectedRows.value.map((row) => row[actualValueKey.value]);
      // change 事件返回完整对象数组
      changeValue = [...selectedRows.value];
    } else {
      // 对象模式：两者都返回对象数组
      modelValue = [...selectedRows.value];
      changeValue = [...selectedRows.value];
    }
  } else {
    // 单选模式
    const selectedRow = selectedRows.value[0] || null;
    if (isSimpleValue.value && selectedRow) {
      // v-model 返回简单值
      modelValue = selectedRow[actualValueKey.value];
      // change 事件返回完整对象
      changeValue = selectedRow;
    } else {
      // 对象模式：两者都返回对象
      modelValue = selectedRow;
      changeValue = selectedRow;
    }
  }

  emit('update:modelValue', modelValue);
  emit('change', changeValue);
  emit('confirm', changeValue);
  emit('blur'); // 触发表单验证
  visible.value = false;
};

// 取消
const handleCancel = () => {
  initSelectedFromModelValue();
  emit('cancel');
  visible.value = false;
};

// 清空
const handleClear = () => {
  selectedRows.value = [];
  selectedRowKey.value = null;

  const emptyValue = props.multiple ? [] : null;

  emit('update:modelValue', emptyValue);
  emit('change', emptyValue);
};

// 移除标签
const handleRemoveTag = (index: number) => {
  selectedRows.value.splice(index, 1);

  let modelValue: any; // v-model 绑定的值
  let changeValue: any; // change 事件传递的值

  if (isSimpleValue.value) {
    // v-model 返回简单值数组
    modelValue = selectedRows.value.map((row) => row[actualValueKey.value]);
    // change 事件返回完整对象数组
    changeValue = [...selectedRows.value];
  } else {
    // 对象模式：两者都返回对象数组
    modelValue = [...selectedRows.value];
    changeValue = [...selectedRows.value];
  }

  emit('update:modelValue', modelValue);
  emit('change', changeValue);
};

// 从 modelValue 初始化选中状态
const initSelectedFromModelValue = () => {
  if (!props.modelValue) {
    selectedRows.value = [];
    selectedRowKey.value = null;
    return;
  }

  if (isSimpleValue.value) {
    // 简单值模式：需要等待数据加载后再匹配
    // 这里先存储简单值，在 restoreSelection 中进行匹配
    if (props.multiple) {
      // 多选：存储值数组
      selectedRows.value = Array.isArray(props.modelValue)
        ? [...props.modelValue]
        : [];
    } else {
      // 单选：存储单个值
      selectedRows.value = [props.modelValue];
      selectedRowKey.value = props.modelValue as string | number;
    }

    // ✅ 新增：在简单值模式下，如果有 fetchData 函数，自动加载数据以获取完整信息
    if (props.fetchData && !visible.value) {
      // 只在选择器未打开时才自动加载（避免重复加载）
      fetchInitialDataForSimpleValue();
    }
  } else {
    // 对象模式：直接使用对象
    if (props.multiple) {
      selectedRows.value = Array.isArray(props.modelValue)
        ? [...props.modelValue]
        : [];
    } else {
      selectedRows.value = props.modelValue ? [props.modelValue] : [];
      if (props.modelValue) {
        selectedRowKey.value = (props.modelValue as any)[props.rowKey!];
      }
    }
  }
};

// 为简单值模式加载初始数据
const fetchInitialDataForSimpleValue = async () => {
  if (!isSimpleValue.value || !props.fetchData) return;

  try {
    // 获取简单值
    const simpleValues = props.multiple
      ? Array.isArray(props.modelValue)
        ? props.modelValue
        : []
      : [props.modelValue];

    if (simpleValues.length === 0) return;

    // 构建查询参数，使用正确的 pageSize
    const params: FetchDataParams = {
      pageNum: 1,
      pageSize: props.pagination!.pageSize,
    };

    const result = await props.fetchData(params);
    const fetchedData = result.rows || [];

    // 从获取的数据中匹配简单值
    const matchedRows: any[] = [];
    simpleValues.forEach((value) => {
      const matched = fetchedData.find(
        (row) => row[actualValueKey.value] === value,
      );
      if (matched) {
        matchedRows.push(matched);
      }
    });

    // 更新 selectedRows 为完整对象
    if (matchedRows.length > 0) {
      selectedRows.value = matchedRows;
      if (!props.multiple && matchedRows[0]) {
        selectedRowKey.value = matchedRows[0][props.rowKey!];
      }
    }
  } catch (error) {
    console.error('Failed to fetch initial data for simple value:', error);
  }
};

// 公开方法
const open = () => {
  visible.value = true;
};

const close = () => {
  visible.value = false;
};

const clear = () => {
  handleClear();
};

const getSelection = () => {
  return props.multiple
    ? [...selectedRows.value]
    : selectedRows.value[0] || null;
};

// 监听 visible
watch(visible, (val) => {
  if (val) {
    initQueryForm();
    initSelectedFromModelValue();
    nextTick(() => {
      fetchTableData();
    });
  }
});

// 监听 modelValue
watch(
  () => props.modelValue,
  () => {
    initSelectedFromModelValue();
  },
  { immediate: true, deep: true },
);

// 初始化
onMounted(() => {
  initQueryForm();
});

// 暴露方法
defineExpose({
  open,
  close,
  clear,
  getSelection,
});
</script>

<style lang="scss" scoped>
.select-table-wrapper {
  display: inline-block;
  width: 100%;
}

.select-table-trigger {
  display: flex;
  align-items: center;
  min-height: 32px;
  padding: 0 30px 0 12px;
  background-color: var(--el-fill-color-blank);
  border: 1px solid var(--el-border-color);
  border-radius: var(--el-border-radius-base);
  cursor: pointer;
  transition: all 0.2s;
  position: relative;

  &:hover {
    border-color: var(--el-border-color-hover);
  }

  &.is-focus {
    border-color: var(--el-color-primary);
  }

  &.is-disabled {
    background-color: var(--el-disabled-bg-color);
    cursor: not-allowed;
  }

  &__content {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    overflow: hidden;
  }

  &__text {
    color: var(--el-text-color-regular);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__placeholder {
    color: var(--el-text-color-placeholder);
  }

  &__arrow {
    position: absolute;
    right: 8px;
    color: var(--el-text-color-placeholder);
    transition: transform 0.2s;

    &.is-reverse {
      transform: rotate(180deg);
    }
  }

  &__clear {
    position: absolute;
    right: 8px;
    color: var(--el-text-color-placeholder);
    cursor: pointer;

    &:hover {
      color: var(--el-text-color-secondary);
    }
  }

  &:hover &__arrow {
    display: none;
  }

  &:hover &__clear {
    display: block;
  }

  &__clear {
    display: none;
  }
}

.select-table-panel {
  display: flex;
  flex-direction: column;
  max-height: 500px;

  :deep(.configurable-form) {
    padding: 12px;
  }

  &__table {
    flex: 1;
    overflow: auto;
  }

  &__pagination {
    padding: 12px 0;
    display: flex;
    justify-content: flex-end;
  }

  &__footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px;
    background-color: var(--el-fill-color-light);
    border-top: 1px solid var(--el-border-color-lighter);
    position: sticky;
    bottom: 0;
    z-index: 10;
  }

  &__info {
    font-size: 13px;
    color: var(--el-text-color-secondary);

    strong {
      color: var(--el-color-primary);
      font-weight: 600;
    }
  }

  &__actions {
    display: flex;
    gap: 8px;
  }
}

// Radio 隐藏文本
:deep(.el-radio__label) {
  display: none;
}
</style>

<style lang="scss">
.select-table-dropdown {
  padding: 0 !important;

  .el-popover__body {
    padding: 0;
  }
}
</style>
