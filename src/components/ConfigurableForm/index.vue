<template>
  <el-form
    ref="formRef"
    :model="formModel"
    :rules="rules"
    :label-width="labelWidth"
    class="configurable-form"
  >
    <el-row :gutter="20">
      <el-col
        v-for="field in computedFields"
        :key="field.prop"
        :span="field.span || computedDefaultSpan"
      >
        <el-form-item :label="field.label" :prop="field.prop">
          <!-- 动态组件渲染 -->
          <component
            :is="getFieldComponent(field)"
            :model-value="formModel[field.prop]"
            @update:model-value="updateField(field.prop, $event)"
            v-bind="getFieldProps(field)"
          >
            <!-- 选项类组件的插槽内容 -->
            <template v-if="hasOptions(field)">
              <component
                :is="getOptionComponent(field)"
                v-for="option in field.options"
                :key="option.value"
                :label="option.label"
                :value="option.value"
              >
                {{ option.label }}
              </component>
            </template>
          </component>
        </el-form-item>
      </el-col>
      <!-- <el-col v-if="query" :span="4"> -->
      <el-form-item label-width="20">
        <el-button type="primary" :icon="Search" @click="handleQuery">
          查询
        </el-button>
        <el-button :icon="Refresh" @click="handleReset"> 重置 </el-button>
        <slot name="append"></slot>
      </el-form-item>
      <!-- </el-col> -->
    </el-row>

    <!-- 非查询模式的插槽 -->
    <!-- <slot v-else name="footer"></slot> -->
  </el-form>
</template>

<script setup>
import { ref, computed } from 'vue';
import { Search, Refresh } from '@element-plus/icons-vue';

// ==================== 常量定义 ====================
const DATE_RANGE_PICKER_TYPES = Object.freeze([
  'datetimerange',
  'daterange',
  'monthrange',
  'dates',
]);
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

// ==================== Props 定义 ====================
const props = defineProps({
  // v-model 绑定的表单数据
  modelValue: {
    type: Object,
    default: () => ({}),
  },
  // 表单字段配置
  fields: {
    type: Array,
    default: () => [],
  },
  // 表单验证规则
  rules: {
    type: Object,
    default: () => ({}),
  },
  // 是否为查询模式
  query: {
    type: Boolean,
    default: false,
  },
  // 标签宽度
  labelWidth: {
    type: String,
    default: '120px',
  },
  // 默认字段占据的列数
  defaultSpan: {
    type: Number,
    default: 5,
  },
});

// 计算实际使用的 span（避免与 props.defaultSpan 命名冲突）
const computedDefaultSpan = computed(() => {
  return props.defaultSpan ? props.defaultSpan : props.query ? 5 : 12;
});

// ==================== Emits 定义 ====================
const emits = defineEmits(['update:modelValue', 'on-query', 'on-reset']);

// ==================== Refs ====================
const formRef = ref(null);

// ✅ 直接使用 computed 计算 formModel（只读）
const formModel = computed(() => modelValueToFormModel(props.modelValue));

// ✅ 更新字段值的方法
const updateField = (prop, value) => {
  const currentModel = { ...props.modelValue };
  const field = fieldMap.value.get(prop);

  if (isRangeDateField(field)) {
    // 范围型日期：拆分为 startProp 和 endProp
    // 使用 getPropsMapForRangeField 获取 propsMap（支持默认值）
    const propsMap = getPropsMapForRangeField(field);
    const [startProp, endProp] = propsMap;
    const rangeValue = Array.isArray(value) ? value : [];

    // ✅ 删除原始的 timeRange 属性
    delete currentModel[prop];

    // ✅ 格式化并设置拆分后的日期
    if (startProp) {
      setValueByPath(
        currentModel,
        startProp,
        formatDate(rangeValue[0], field.type),
      );
    }
    if (endProp) {
      setValueByPath(
        currentModel,
        endProp,
        formatDate(rangeValue[1], field.type),
      );
    }
  } else {
    // 普通字段：直接赋值
    setValueByPath(currentModel, prop, value);
  }

  emits('update:modelValue', currentModel);
};

// ==================== Computed ====================
// 处理后的字段配置
const computedFields = computed(() => {
  return props.fields.filter((field) => field.visible !== false);
});

// 创建字段映射表（用于快速查找，使用 Map 提升性能）
const fieldMap = computed(() => {
  return new Map(computedFields.value.map((field) => [field.prop, field]));
});

// ==================== Helper Functions ====================
// 获取字段对应的组件名称
const getFieldComponent = (field) => {
  // 直接将 component 转换为 el- 开头的组件名
  // 例如：'input' -> 'el-input', 'date-picker' -> 'el-date-picker'
  return `el-${field.component}`;
};

// 获取选项组件名称
const getOptionComponent = (field) => {
  // 根据父组件类型返回对应的选项组件
  // select -> el-option, radio-group -> el-radio, checkbox-group -> el-checkbox
  return OPTION_COMPONENT_MAP.get(field.component) || `el-${field.component}`;
};

// 判断是否有选项的组件（使用 Set 提升查找性能）
const hasOptions = (field) => {
  return OPTION_COMPONENTS.has(field.component);
};

// 获取字段的 props
const getFieldProps = (field) => {
  const fieldProps = {
    placeholder: field.placeholder || getPlaceholder(field),
    disabled: field.disabled,
    ...field,
  };

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
    fieldProps.startPlaceholder = field.startPlaceholder || '开始日期';
    fieldProps.endPlaceholder = field.endPlaceholder || '结束日期';
  } else if (field.component === 'textarea') {
    fieldProps.type = 'textarea';
  }

  // 添加数字输入的 min/max
  if (field.component === 'input-number') {
    if (field.min !== undefined) fieldProps.min = field.min;
    if (field.max !== undefined) fieldProps.max = field.max;
  }

  // 添加文本域的 rows
  if (field.component === 'textarea' && field.rows) {
    fieldProps.rows = field.rows;
  }

  return fieldProps;
};

// 获取占位符文本（使用 Set 提升查找性能）
const getPlaceholder = (field) => {
  const prefix = SELECT_COMPONENTS.has(field.component) ? '请选择' : '请输入';
  return `${prefix}${field.label}`;
};

// 判断字段是否为范围型日期组件
const isRangeDateField = (field) => {
  return (
    field &&
    field.component === 'date-picker' &&
    DATE_RANGE_PICKER_TYPES.includes(field.type)
  );
};

/**
 * 获取日期范围字段的 propsMap
 * @description
 * - 如果已显式设置 propsMap（包括空数组），直接返回
 * - 如果是范围日期字段且没有 propsMap，使用默认值 ['beginTime', 'endTime']
 * - 其他情况返回空数组
 * @param {Object} field - 字段配置对象
 * @returns {Array} propsMap 数组 [startProp, endProp]
 */
const getPropsMapForRangeField = (field) => {
  // 优先级 1: 如果已显式设置 propsMap（包括空数组），直接返回
  if (Array.isArray(field.propsMap)) {
    return field.propsMap;
  }

  // 优先级 2: 如果是范围日期字段且没有 propsMap，使用默认值
  if (isRangeDateField(field)) {
    return ['beginTime', 'endTime'];
  }

  // 优先级 3: 其他情况返回空数组
  return [];
};

// ✅ 格式化日期（优化：提取 pad 函数，简化逻辑结构）
const formatDate = (date, type) => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const pad = (n) => String(n).padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  const seconds = pad(d.getSeconds());

  // 根据类型返回不同格式
  if (type === 'datetime' || type === 'datetimerange') {
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  if (type === 'month' || type === 'monthrange') {
    return `${year}-${month}`;
  }
  // date, daterange 等默认格式
  return `${year}-${month}-${day}`;
};

// 支持多级路径的赋值
const setValueByPath = (obj, path, value) => {
  const pathArr = path.split('.');
  const lastKeyIndex = pathArr.length - 1;
  pathArr.reduce((acc, cur, index) => {
    if (index === lastKeyIndex) {
      acc[cur] = value;
    } else if (!acc[cur]) {
      acc[cur] = {};
    }
    return acc[cur];
  }, obj);
};

// ✅ 将 modelValue 转换为 formModel（处理 propsMap）
const modelValueToFormModel = (source) => {
  const src = source || {};
  const nextForm = {};

  // 遍历所有字段
  Object.entries(src).forEach(([key, value]) => {
    const field = fieldMap.value.get(key);
    if (isRangeDateField(field)) {
      // 范围型日期：直接保存数组
      const rangeValue = Array.isArray(value) ? value : [];
      nextForm[key] = rangeValue;
    } else {
      // 普通字段：支持多级路径
      setValueByPath(nextForm, key, value);
    }
  });

  // 处理 propsMap：将拆分的字段合并为范围
  computedFields.value.forEach((field) => {
    if (!isRangeDateField(field)) return;

    // 使用 getPropsMapForRangeField 获取 propsMap（支持默认值）
    const propsMap = getPropsMapForRangeField(field);
    const [startProp, endProp] = propsMap;
    if (!startProp || !endProp) return;

    const startVal = src[startProp];
    const endVal = src[endProp];

    if (startVal !== undefined || endVal !== undefined) {
      nextForm[field.prop] = [startVal || '', endVal || ''];
    }
  });

  return nextForm;
};

// ==================== Methods ====================
// 查询按钮点击
const handleQuery = () => {
  emits('on-query', props.modelValue);
};

// 重置按钮点击
const handleReset = () => {
  formRef.value?.resetFields();
  emits('on-reset');
};

// 表单验证
const validate = async () => {
  if (!formRef.value) return false;
  try {
    await formRef.value.validate();
    return true;
  } catch (error) {
    return false;
  }
};

// 重置表单
const resetFields = () => {
  formRef.value?.resetFields();
};

// 清除验证
const clearValidate = (props) => {
  formRef.value?.clearValidate(props);
};

// ==================== Expose ====================
defineExpose({
  validate,
  resetFields,
  clearValidate,
  formRef,
});
</script>

<style scoped>
.configurable-form {
  width: 100%;
}

.form-actions {
  margin-top: 10px;
}

.form-actions .el-form-item {
  margin-bottom: 0;
}
</style>
