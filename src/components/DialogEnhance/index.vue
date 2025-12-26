<template>
  <ElDialog
    ref="dialogRef"
    v-model="visible"
    v-bind="$attrs"
    @open="handleOpen"
    @opened="handleOpened"
    @close="handleClose"
    @closed="handleClosed"
    draggable
    :close-on-click-modal="false"
  >
    <!-- 透传 header 插槽 -->
    <template v-if="$slots.header" #header="scope">
      <slot name="header" v-bind="scope" />
    </template>

    <!-- 默认内容插槽 -->
    <slot />

    <!-- 底部按钮区域 -->
    <template v-if="showFooter" #footer>
      <slot name="footer">
        <div class="dialog-enhance-footer">
          <!-- 自定义按钮区域（左侧） -->
          <div class="dialog-enhance-footer__custom">
            <template
              v-for="(btn, index) in visibleCustomButtons"
              :key="btn.key ?? index"
            >
              <el-button
                :type="btn.type"
                :loading="btn.loading"
                :disabled="getButtonDisabled(btn)"
                :icon="btn.icon"
                v-bind="getButtonExtraProps(btn)"
                @click="handleCustomButtonClick(btn)"
              >
                {{ btn.label }}
              </el-button>
            </template>
          </div>

          <!-- 默认按钮区域（右侧） -->
          <div v-if="showDefaultButtons" class="dialog-enhance-footer__default">
            <el-button :type="cancelButtonType" @click="handleCancel">
              {{ cancelText }}
            </el-button>
            <el-button
              :type="confirmButtonType"
              :loading="confirmLoading"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </el-button>
          </div>
        </div>
      </slot>
    </template>
  </ElDialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import type { DialogInstance } from 'element-plus';
import type { CustomButtonItem, ButtonType } from './types';

defineOptions({
  name: 'DialogEnhance',
  inheritAttrs: false,
});

// Props 定义
const props = withDefaults(
  defineProps<{
    /** 是否显示对话框 */
    modelValue?: boolean;
    /** 是否显示默认按钮（取消、确定） */
    showDefaultButtons?: boolean;
    /** 自定义按钮配置数组 */
    customButtons?: CustomButtonItem[];
    /** 确定按钮文本 */
    confirmText?: string;
    /** 取消按钮文本 */
    cancelText?: string;
    /** 确定按钮加载状态 */
    confirmLoading?: boolean;
    /** 点击确定后是否自动关闭 */
    closeOnConfirm?: boolean;
    /** 是否显示底部区域 */
    showFooter?: boolean;
    /** 确定按钮类型 */
    confirmButtonType?: ButtonType;
    /** 取消按钮类型 */
    cancelButtonType?: ButtonType;
  }>(),
  {
    modelValue: false,
    showDefaultButtons: true,
    customButtons: () => [],
    confirmText: '确定',
    cancelText: '取消',
    confirmLoading: false,
    closeOnConfirm: false,
    showFooter: true,
    confirmButtonType: 'primary',
    cancelButtonType: '',
  },
);

// Emits 定义
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'cancel'): void;
  (e: 'confirm'): void;
  (e: 'open'): void;
  (e: 'opened'): void;
  (e: 'close'): void;
  (e: 'closed'): void;
}>();

// el-dialog 实例引用
const dialogRef = ref<DialogInstance>();

// 双向绑定 visible
const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

// 计算可见的自定义按钮
const visibleCustomButtons = computed(() => {
  return props.customButtons.filter((btn) => {
    if (typeof btn.visible === 'function') {
      return btn.visible();
    }
    return btn.visible !== false;
  });
});

// 获取按钮禁用状态
const getButtonDisabled = (btn: CustomButtonItem): boolean => {
  if (typeof btn.disabled === 'function') {
    return btn.disabled();
  }
  return btn.disabled ?? false;
};

// 获取按钮额外属性（排除已处理的属性）
const getButtonExtraProps = (btn: CustomButtonItem) => {
  const {
    key,
    label,
    type,
    disabled,
    loading,
    icon,
    onClick,
    visible,
    ...rest
  } = btn;
  return rest;
};

// 处理自定义按钮点击
const handleCustomButtonClick = async (btn: CustomButtonItem) => {
  if (btn.onClick) {
    await btn.onClick();
  }
};

// 处理取消按钮点击
const handleCancel = () => {
  emit('cancel');
  close();
};

// 处理确定按钮点击
const handleConfirm = () => {
  emit('confirm');
  if (props.closeOnConfirm) {
    close();
  }
};

// 事件透传
const handleOpen = () => emit('open');
const handleOpened = () => emit('opened');
const handleClose = () => emit('close');
const handleClosed = () => emit('closed');

// 关闭对话框
const close = () => {
  visible.value = false;
};

// 打开对话框
const open = () => {
  visible.value = true;
};

// 暴露方法和属性
defineExpose({
  close,
  open,
  dialogRef,
});
</script>

<style scoped lang="scss">
.dialog-enhance-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  &__custom {
    display: flex;
    gap: 10px;
  }

  &__default {
    display: flex;
    gap: 10px;
    margin-left: auto;
  }
}

// 当没有自定义按钮时，默认按钮靠右
.dialog-enhance-footer__custom:empty + .dialog-enhance-footer__default {
  margin-left: auto;
}
</style>
