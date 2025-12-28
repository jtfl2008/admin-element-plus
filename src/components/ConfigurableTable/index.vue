<template>
  <div class="pro-table">
    <!-- 工具栏区域 -->
    <div class="pro-toolbar">
      <slot v-if="slots['toolbar-prepend']" name="toolbar-prepend"></slot>
      <div class="button-group">
        <el-button
          v-for="(toolbar, toolbarIndex) in props.toolbars"
          :key="`toolbar-${toolbarIndex}`"
          :icon="toolbar.icon"
          :type="toolbar.type"
          :disabled="toolbar.disabled?.()"
          @click="toolbar.click?.()"
          v-bind="getToolbarButtonProps(toolbar)"
          plain
        >
          {{ toolbar.label }}
        </el-button>
      </div>
      <slot v-if="slots['toolbar-append']" name="toolbar-append"></slot>
    </div>

    <!-- 表格主体 -->
    <el-table
      ref="tableRef"
      :data="props.data"
      :empty-text="props.emptyText"
      :max-height="props.maxHeight"
      row-key="id"
      v-bind="$attrs"
      @selection-change="onSelectionChange"
    >
      <!-- 多选列 -->
      <el-table-column
        v-if="props.selection"
        align="center"
        type="selection"
        width="60"
      />
      <!-- 序号列 -->
      <el-table-column
        v-if="props.index"
        align="center"
        type="index"
        label="序号"
        width="60"
      />

      <!-- 动态列 -->
      <template
        v-for="column in props.columns"
        :key="column.prop || column.label"
      >
        <!-- 有子列的情况（多级表头） -->
        <el-table-column
          v-if="column.children?.length"
          v-bind="getColumnBindProps(column)"
        >
          <el-table-column
            v-for="child in column.children"
            :key="child.prop || child.label"
            v-bind="getColumnBindProps(child)"
          >
            <template #default="scope">
              <CellContent :column="child" :scope="scope" />
            </template>
          </el-table-column>
        </el-table-column>
        <!-- 普通列 -->
        <el-table-column 
          v-else 
          v-bind="getColumnBindProps(column)"
          :fixed="column.buttons?.length ? 'right' : column.fixed"
        >
          <template v-if="hasCustomContent(column)" #default="scope">
            <CellContent :column="column" :scope="scope" />
          </template>
        </el-table-column>
      </template>
    </el-table>

    <!-- 分页区域 -->
    <div class="pro-pagination" v-if="showPaginationArea">
      <el-pagination
        background
        layout="total, sizes, prev, pager, next, jumper"
        :page-sizes="props.pageSizes"
        :total="props.total"
        :current-page="props.pageNum"
        :page-size="props.pageSize"
        @current-change="onCurrentChange"
        @size-change="onSizeChange"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
/**
 * ConfigurableTable - 可配置化表格组件
 * @description 基于 Element Plus el-table 封装，支持工具栏、动态列配置、分页等功能
 * @author EMS Team
 */
import { ref, computed, useSlots, type FunctionalComponent, h } from 'vue';
import { ElButton } from 'element-plus';
import type { TableInstance } from 'element-plus';
import type { ToolbarItem, ColumnItem, TableScope } from './types';

import {
  getLabelByValue,
  formatDateTime,
  getColumnBindProps,
  hasCustomContent,
} from './utils';

// 组件名称
defineOptions({
  name: 'ConfigurableTable',
  inheritAttrs: false,
});

// Props 定义（保持响应性）
// const props = withDefaults(defineProps(), {
//   toolbars: () => [],
//   data: () => [],
//   columns: () => [],
//   index: true,
//   selection: false,
//   pageNo: 1,
//   pageSize: 10,
//   total: 0,
//   showBorder: true,
//   showPagination: true,
//   pageSizes: () => [10, 20, 30, 40, 50, 100],
//   emptyText: '暂无数据',
// });
const props = defineProps({
  toolbars: {
    type: Array as () => ToolbarItem[],
    default: () => [],
  },
  data: {
    type: Array as () => Record<string, any>[],
    default: () => [],
  },
  columns: {
    type: Array as () => ColumnItem[],
    default: () => [],
  },
  index: {
    type: Boolean,
    default: true,
  },
  selection: {
    type: Boolean,
    default: false,
  },
  pageNum: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  total: {
    type: Number,
    default: 0,
  },
  showBorder: {
    type: Boolean,
    default: true,
  },
  showPagination: {
    type: Boolean,
    default: true,
  },
  pageSizes: {
    type: Array as () => number[],
    default: () => [10, 20, 30, 40, 50, 100],
  },
  emptyText: {
    type: String,
    default: '暂无数据',
  },
  maxHeight: {
    type: [Number, String],
    default: 'calc(100vh - 380px)',
  },
});

// Emits 定义（类型化）
const emit = defineEmits<{
  /** 页码变化 */
  'current-change': [pageNo: number];
  /** 每页条数变化 */
  'size-change': [pageSize: number];
  /** 页码双向绑定 */
  'update:pageNo': [pageNo: number];
  /** 每页条数双向绑定 */
  'update:pageSize': [pageSize: number];
  /** 选择项变化 */
  'selection-change': [selection: any[]];
}>();

// Slots
const slots = useSlots();

// Refs
const tableRef = ref<TableInstance>();

// 计算属性
/** 是否显示分页区域 */
const showPaginationArea = computed(() => {
  return props.showPagination && props.total > 0;
});

// 事件处理
/** 页码变化处理 */
const onCurrentChange = (pageNo: number) => {
  emit('current-change', pageNo);
  emit('update:pageNo', pageNo);
};

/** 每页条数变化处理 */
const onSizeChange = (pageSize: number) => {
  emit('size-change', pageSize);
  emit('update:pageSize', pageSize);
};

/** 选择项变化处理 */
const onSelectionChange = (selection: any[]) => {
  emit('selection-change', selection);
};

// 工具函数
/** 获取工具栏按钮的额外属性 */
const getToolbarButtonProps = (toolbar: ToolbarItem) => {
  const { label, click, icon, disabled, type, ...rest } = toolbar;
  return rest;
};

// 单元格内容渲染组件
const CellContent: FunctionalComponent<{
  column: ColumnItem;
  scope: TableScope;
}> = ({ column, scope }) => {
  // 自定义插槽
  if (column.cellSlot && slots[column.cellSlot]) {
    return slots[column.cellSlot]!(scope);
  }

  // 操作按钮列
  if (column.buttons?.length) {
    return h(
      'div',
      { class: 'cell-button-group' },
      column.buttons
        .filter((btn) => {
          return typeof btn.visible === 'function'
            ? btn.visible(scope)
            : btn.visible ?? true;
        })
        .map((btn, btnIndex) =>
          h(
            ElButton,
            {
              key: `btn-${btnIndex}`,
              link: true,
              type: btn.type || 'primary',
              // 支持函数形式和布尔值的禁用判断
              disabled:
                typeof btn.disabled === 'function'
                  ? btn.disabled(scope)
                  : btn.disabled ?? false,
              icon: btn.icon,
              onClick: () => btn.click?.(scope),
            },
            () => btn.label,
          ),
        ),
    );
  }

  // 日期时间格式化
  if (column.formatType === 'dateTime' && column.prop) {
    return formatDateTime(scope.row[column.prop], column.formatDateTime);
  }

  // 字典映射
  if (column.options?.length && column.prop) {
    return getLabelByValue({
      value: scope.row[column.prop],
      options: column.options,
    });
  }

  // 默认显示原始值
  // return column.prop ? scope.row[column.prop] : '';
};

// 暴露给父组件的方法和属性
defineExpose({
  /** 表格实例引用 */
  tableRef,
  /** 清除所有选择 */
  clearSelection: () => tableRef.value?.clearSelection(),
  /** 获取选中的行数据 */
  getSelectionRows: () => tableRef.value?.getSelectionRows() ?? [],
  /** 切换某一行的选中状态 */
  toggleRowSelection: (row: any, selected?: boolean) =>
    tableRef.value?.toggleRowSelection(row, selected),
  /** 切换所有行的选中状态 */
  toggleAllSelection: () => tableRef.value?.toggleAllSelection(),
});
</script>

<style scoped lang="scss">
.pro-table {
  height: 100%;
  display: flex;
  flex-direction: column;

  .pro-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
    flex-shrink: 0;

    .button-group {
      display: flex;
      align-items: center;
      gap: 10px;
    }
  }

  :deep(.el-table) {
    flex: 1;
    
    // 固定表头样式优化
    .el-table__header-wrapper {
      position: sticky;
      top: 0;
      z-index: 2;
    }
    
    // 固定列阴影优化
    .el-table__fixed-right {
      box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
    }
  }

  .pro-pagination {
    margin-top: 16px;
    display: flex;
    justify-content: flex-end;
    flex-shrink: 0;
  }

  // 操作按钮组样式
  :deep(.cell-button-group) {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-wrap: wrap;
    gap: 4px;
  }
}

// 分页组件样式修正
:deep(.el-pagination) {
  justify-content: flex-end;
}
</style>
