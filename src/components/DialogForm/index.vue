<template>
  <DialogEnhance
    v-model="visible"
    :title="props.title"
    :width="props.width"
    :confirm-loading="props.confirmLoading"
    :show-default-buttons="props.showDefaultButtons"
    :custom-buttons="props.customButtons"
    :confirm-text="props.confirmText"
    :cancel-text="props.cancelText"
    @confirm="handleConfirm"
    @cancel="handleCancel"
    draggable
  >
    <el-form
      ref="formRef"
      :model="localFormData"
      :rules="mergedRules"
      :label-width="props.labelWidth"
    >
      <template
        v-for="section in visibleSections"
        :key="section.key"
      >
        <!-- 段落前插槽 -->
        <slot
          :name="`section-before-${section.key}`"
          :section="section"
          :formData="localFormData"
        />

        <!-- 段落内容：优先使用自定义插槽 -->
        <template v-if="$slots[`section-${section.key}`]">
          <h2 v-if="section.title">{{ section.title }}</h2>
          <slot
            :name="`section-${section.key}`"
            :section="section"
            :formData="localFormData"
          />
        </template>

        <!-- 表单段落（默认渲染） -->
        <template v-else-if="section.type === 'form'">
          <h2 v-if="section.title">{{ section.title }}</h2>
          <el-row :gutter="20">
            <template
              v-for="field in getVisibleFields(section.fields)"
              :key="field.prop"
            >
              <el-col :span="field.span || 12">
                <el-form-item
                  :label="field.label"
                  :prop="field.prop"
                  :rules="getSectionRules(section, field.prop)"
                >
                  <!-- 优先级1: 字段替换插槽 (field-{prop}) -->
                  <template v-if="$slots[`field-${field.prop}`]">
                    <slot
                      :name="`field-${field.prop}`"
                      :field="field"
                      :value="localFormData[field.prop]"
                      :formData="localFormData"
                    />
                  </template>
                  <!-- 优先级2: 字段配置的 slotName -->
                  <template v-else-if="field.slotName">
                    <slot
                      :name="field.slotName"
                      :field="field"
                      :value="localFormData[field.prop]"
                      :formData="localFormData"
                      :onClick="field.onClick"
                      :onChange="(val) => handleFieldChange(field, val)"
                      :onFocus="field.onFocus"
                      :onBlur="field.onBlur"
                      :emit="
                        (event, ...args) =>
                          handleFieldEmit(field, event, ...args)
                      "
                    />
                  </template>
                  <!-- 优先级3: 默认组件渲染 -->
                  <template v-else>
                    <component
                      :is="getFieldComponent(field)"
                      v-model="localFormData[field.prop]"
                      v-bind="getFieldProps(field)"
                      @click="field.onClick?.()"
                      @change="
                        (...args) => field.onChange?.(...args, localFormData)
                      "
                    >
                      <!-- 选项类组件的插槽内容 -->
                      <template v-if="hasOptions(field)">
                        <component
                          :is="getOptionComponent(field)"
                          v-for="option in field.options"
                          :key="String(option.value)"
                          :label="option.label"
                          :value="option.value"
                          :disabled="option.disabled"
                        >
                          {{ option.label }}
                        </component>
                      </template>
                    </component>
                  </template>
                  <!-- 字段追加插槽 -->
                  <slot
                    :name="`field-append-${field.prop}`"
                    :field="field"
                    :value="localFormData[field.prop]"
                    :formData="localFormData"
                  />
                </el-form-item>
              </el-col>
            </template>
          </el-row>
        </template>

        <!-- 表格段落 -->
        <template v-else-if="section.type === 'table'">
          <h2 v-if="section.title">{{ section.title }}</h2>
          <!-- 表格工具栏 -->
          <el-row style="margin-bottom: 10px">
            <el-col>
              <el-button
                type="primary"
                :icon="Plus"
                @click="handleTableAdd(section.tableConfig)"
              >
                新增
              </el-button>
              <el-button
                type="danger"
                :icon="Delete"
                :disabled="
                  !tableSelections[section.tableConfig.dataKey]?.length
                "
                @click="handleTableDelete(section.tableConfig)"
              >
                批量删除
              </el-button>
              <!-- 自定义工具栏按钮 -->
              <template
                v-for="toolbar in section.tableConfig.toolbars"
                :key="toolbar.key"
              >
                <el-button
                  :type="toolbar.type"
                  :icon="toolbar.icon"
                  :disabled="getButtonDisabled(toolbar.disabled)"
                  @click="toolbar.onClick"
                >
                  {{ toolbar.label }}
                </el-button>
              </template>
            </el-col>
          </el-row>
          <!-- 表格主体 -->
          <el-table
            ref="tableRefs"
            border
            stripe
            max-height="300px"
            style="width: 100%"
            :data="localFormData[section.tableConfig.dataKey]"
            @selection-change="
              (sel) => handleSelectionChange(section.tableConfig.dataKey, sel)
            "
            row-key="index"
          >
            <el-table-column
              v-if="section.tableConfig.selection !== false"
              type="selection"
              align="center"
              fixed="left"
              width="55"
            />
            <el-table-column
              v-if="section.tableConfig.index !== false"
              align="center"
              label="序号"
              type="index"
              width="80"
            />
            <!-- 动态列渲染 -->
            <template
              v-for="column in section.tableConfig.columns"
              :key="column.prop"
            >
              <el-table-column
                :prop="column.prop"
                :label="column.label"
                :width="column.width"
                :align="column.align || 'center'"
              >
                <template v-if="column.editable" #default="scope">
                  <el-form-item
                    :prop="`${section.tableConfig.dataKey}.${scope.$index}.${column.prop}`"
                    :rules="column.rules"
                    label-width="0"
                    label=" "
                  >
                    <component
                      :is="
                        getFieldComponent({
                          component: column.editComponent || 'input',
                        })
                      "
                      v-model="scope.row[column.prop]"
                      v-bind="getEditFieldProps(column)"
                      style="width: 100%"
                    >
                      <template v-if="column.editOptions?.length">
                        <el-option
                          v-for="opt in column.editOptions"
                          :key="String(opt.value)"
                          :label="opt.label"
                          :value="opt.value"
                        />
                      </template>
                    </component>
                  </el-form-item>
                </template>
              </el-table-column>
            </template>
          </el-table>
        </template>

        <!-- 自定义段落 -->
        <template v-else-if="section.type === 'custom'">
          <h2 v-if="section.title">{{ section.title }}</h2>
          <slot :name="section.slotName" :formData="localFormData" />
        </template>

        <!-- 段落后插槽 -->
        <slot
          :name="`section-after-${section.key}`"
          :section="section"
          :formData="localFormData"
        />
      </template>
    </el-form>
  </DialogEnhance>
</template>

<script setup>
/**
 * DialogForm - 可复用的对话框表单组件
 * @description 支持表单、表格、上传、自定义插槽的可配置对话框组件
 */
import { ref, computed, reactive } from 'vue';
import { Plus, Delete } from '@element-plus/icons-vue';
import DialogEnhance from '@/components/DialogEnhance/index.vue';

// ==================== 常量定义 ====================
const FULL_WIDTH_STYLE = 'width: 100%';
const FULL_WIDTH_COMPONENTS = Object.freeze([
  'select',
  'date-picker',
  'input-number',
]);
const OPTION_COMPONENTS = new Set(['select', 'radio-group', 'checkbox-group']);
const SELECT_COMPONENTS = new Set(['select', 'date-picker']);
const OPTION_COMPONENT_MAP = new Map([
  ['select', 'el-option'],
  ['radio-group', 'el-radio'],
  ['checkbox-group', 'el-checkbox'],
]);

// 组件选项
defineOptions({
  name: 'DialogForm',
  inheritAttrs: false,
});

// Props 定义
const props = defineProps({
  modelValue: { type: Boolean, default: false },
  title: { type: String, default: '' },
  formData: { type: Object, default: () => ({}) },
  sections: { type: Array, default: () => [] },
  rules: { type: Object, default: () => ({}) },
  width: { type: String, default: '80%' },
  labelWidth: { type: String, default: '100px' },
  customButtons: { type: Array, default: () => [] },
  showDefaultButtons: { type: Boolean, default: true },
  confirmLoading: { type: Boolean, default: false },
  confirmText: { type: String, default: '确定' },
  cancelText: { type: String, default: '取消' },
});

// Emits 定义
const emit = defineEmits([
  'update:modelValue',
  'update:formData',
  'confirm',
  'cancel',
  'selection-change',
  'table-add',
  'table-delete',
  /** @event field-change - 字段值变化事件 */
  'field-change',
  /** @event field-emit - 自定义字段事件 */
  'field-emit',
]);

// ==================== Refs ====================
const formRef = ref(null);
const tableSelections = reactive({});

// ==================== 计算属性 ====================

// Dialog 显示状态双向绑定
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 表单数据双向绑定
const localFormData = computed({
  get: () => props.formData,
  set: (val) => emit('update:formData', val),
});

// 过滤可见的段落
const visibleSections = computed(() => {
  return props.sections.filter((section) => {
    if (typeof section.visible === 'function') {
      return section.visible();
    }
    return section.visible !== false;
  });
});

// 合并全局规则和分段规则
const mergedRules = computed(() => {
  const rules = { ...props.rules };
  props.sections.forEach((section) => {
    if (section.type === 'form' && section.rules) {
      Object.assign(rules, section.rules);
    }
  });
  return rules;
});

// ==================== 表单字段渲染辅助函数 ====================

// 获取可见字段
const getVisibleFields = (fields) => {
  return fields.filter((field) => {
    if (typeof field.visible === 'function') {
      return field.visible();
    }
    return field.visible !== false;
  });
};

// 获取分段规则
const getSectionRules = (section, prop) => {
  return section.rules?.[prop] || props.rules?.[prop];
};

/**
 * 判断是否为自定义组件
 * @param {Object} field - 字段配置
 * @returns {boolean}
 */
const isCustomComponent = (field) => {
  const comp = field.component;
  // 组件对象或函数形式视为自定义组件
  return (
    typeof comp === 'object' ||
    typeof comp === 'function' ||
    field.customComponent === true
  );
};

/**
 * 解析组件
 * @param {Object} field - 完整字段配置对象
 * @returns {Component | string} Vue 组件对象或组件名称字符串
 */
const resolveComponent = (field) => {
  const comp = field.component;

  // 🔑 关键：检查是否已经是组件对象或函数
  if (typeof comp === 'object' || typeof comp === 'function') {
    return comp; // 直接返回组件对象，Vue 会处理
  }

  // 检查 customComponent 标识（字符串形式的自定义组件）
  if (field.customComponent === true) {
    return comp; // 直接返回组件名，不添加前缀
  }

  // Element Plus 组件（已有 el- 前缀）
  if (typeof comp === 'string' && comp.startsWith('el-')) {
    return comp;
  }

  // 自动添加 el- 前缀（向后兼容）
  return `el-${comp}`;
};

// 获取字段对应的组件名称
const getFieldComponent = (field) => {
  return resolveComponent(field);
};

// 获取选项组件名称
const getOptionComponent = (field) => {
  // 只有字符串组件名才需要处理
  if (typeof field.component === 'string') {
    return OPTION_COMPONENT_MAP.get(field.component) || `el-${field.component}`;
  }
  return '';
};

// 判断是否有选项的组件
const hasOptions = (field) => {
  // 自定义组件（对象/函数形式）不使用 Element Plus 选项渲染
  if (isCustomComponent(field)) {
    return false;
  }
  return OPTION_COMPONENTS.has(field.component) && !!field.options?.length;
};

// 获取字段的 props
const getFieldProps = (field) => {
  const fieldProps = {
    placeholder: field.placeholder || getPlaceholder(field),
    disabled:
      typeof field.disabled === 'function' ? field.disabled() : field.disabled,
  };

  // 检查是否为自定义组件
  if (isCustomComponent(field)) {
    // 排除 DialogForm 内部使用的配置字段
    const excludeKeys = [
      'prop',
      'label',
      'component',
      'customComponent',
      'span',
      'visible',
      'slotName',
      'onClick',
      'onChange',
      'onFocus',
      'onBlur',
    ];

    // 构建自定义组件的 props
    const customProps = {};
    Object.keys(field).forEach((key) => {
      if (!excludeKeys.includes(key)) {
        customProps[key] = field[key];
      }
    });

    return {
      placeholder: field.placeholder,
      disabled:
        typeof field.disabled === 'function'
          ? field.disabled()
          : field.disabled,
      ...customProps, // 透传用户自定义的 props
    };
  }

  // Element Plus 组件特定处理
  // 添加 clearable 属性（switch 除外）
  if (field.component !== 'switch') {
    fieldProps.clearable = true;
  }

  // 添加 style 属性（需要 100% 宽度的组件）
  if (FULL_WIDTH_COMPONENTS.includes(field.component)) {
    fieldProps.style = FULL_WIDTH_STYLE;
  }

  // 添加 type 属性
  if (field.component === 'date-picker') {
    fieldProps.type = field.type || 'date';
    fieldProps.valueFormat = 'YYYY-MM-DD';
  } else if (field.component === 'input' && field.type === 'textarea') {
    // 文本域：使用 el-input 的 textarea 模式
    fieldProps.type = 'textarea';
    // 添加文本域的 rows（默认 3 行）
    fieldProps.rows = field.rows || 3;
  }

  // 添加数字输入的 min/max
  if (field.component === 'input-number') {
    if (field.min !== undefined) fieldProps.min = field.min;
    if (field.max !== undefined) fieldProps.max = field.max;
  }

  return fieldProps;
};

// 获取编辑字段的 props
const getEditFieldProps = (column) => {
  const fieldProps = {
    placeholder: `请输入${column.label}`,
    clearable: true,
  };

  if (column.editComponent === 'input-number') {
    fieldProps.min = 0;
    fieldProps.precision = 0;
    fieldProps.step = 1;
  }

  return fieldProps;
};

// 获取占位符文本
const getPlaceholder = (field) => {
  const prefix = SELECT_COMPONENTS.has(field.component) ? '请选择' : '请输入';
  return `${prefix}${field.label}`;
};

// 获取按钮禁用状态
const getButtonDisabled = (disabled) => {
  if (typeof disabled === 'function') {
    return disabled();
  }
  return disabled ?? false;
};

// ==================== 字段事件处理 ====================

/**
 * 处理字段值变化
 * @param {Object} field - 字段配置
 * @param {any} value - 新值
 */
const handleFieldChange = (field, value) => {
  localFormData.value[field.prop] = value;
  // 触发字段配置的 onChange 回调
  field.onChange?.(value, localFormData.value);
  // 向父组件派发事件
  emit('field-change', {
    prop: field.prop,
    value,
    formData: localFormData.value,
  });
};

/**
 * 处理自定义字段事件
 * @param {Object} field - 字段配置
 * @param {string} event - 事件名称
 * @param {...any} args - 事件参数
 */
const handleFieldEmit = (field, event, ...args) => {
  // 向父组件派发通用事件
  emit('field-emit', {
    prop: field.prop,
    event,
    args,
    formData: localFormData.value,
  });
};

// ==================== 表格操作 ====================

// 处理表格选择变更
const handleSelectionChange = (dataKey, selection) => {
  tableSelections[dataKey] = selection;
  emit('selection-change', dataKey, selection);
};

// 处理表格新增行
const handleTableAdd = (tableConfig) => {
  const dataKey = tableConfig.dataKey;
  if (!localFormData.value[dataKey]) {
    localFormData.value[dataKey] = [];
  }
  const newRow = {
    index: Date.now(),
    ...tableConfig.defaultRowData,
  };
  localFormData.value[dataKey].push(newRow);
  emit('table-add', dataKey);
};

// 处理表格批量删除
const handleTableDelete = (tableConfig) => {
  const dataKey = tableConfig.dataKey;
  const selections = tableSelections[dataKey] || [];
  if (!selections.length) return;

  const indexSet = new Set(selections.map((item) => item.index));
  localFormData.value[dataKey] = localFormData.value[dataKey].filter(
    (item) => !indexSet.has(item.index),
  );
  tableSelections[dataKey] = [];
  emit('table-delete', dataKey, selections);
};

// ==================== 表单操作 ====================

// 处理确认提交
const handleConfirm = async () => {
  try {
    await formRef.value?.validate();
    emit('confirm', localFormData.value);
  } catch (error) {
    console.error('表单验证失败:', error);
  }
};

// 处理取消
const handleCancel = () => {
  emit('cancel');
};

// ==================== 暴露方法 ====================
defineExpose({
  validate: () => formRef.value?.validate(),
  resetFields: () => formRef.value?.resetFields(),
  clearValidate: (propList) => formRef.value?.clearValidate(propList),
  formRef,
});
</script>

<style scoped>
h2 {
  margin: 20px 0 15px;
  font-size: 16px;
  font-weight: 600;
  color: #303133;
}

h2:first-child {
  margin-top: 0;
}
</style>
