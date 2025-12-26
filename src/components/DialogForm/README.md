# DialogForm 组件使用说明

## 自定义组件支持

DialogForm 组件支持使用项目中的自定义组件，提供了灵活的组件扩展能力。

### 使用方式

**方式 1：直接传递组件对象（推荐）✨**

这是最简单、最优雅的方式，无需任何额外配置。

```vue
<script setup>
import { ref } from 'vue'
import DialogForm from '@/components/DialogForm/index.vue'
import userSelect from '@/components/user/index.vue'  // 导入自定义组件

const formData = ref({
  name: '',
  userId: null,
})

const sections = [{
  type: 'form',
  title: '基本信息',
  fields: [
    // Element Plus 组件（字符串形式）
    {
      prop: 'name',
      label: '名称',
      component: 'input',
      span: 24,
    },
    // 自定义组件（直接传递组件对象）✨
    {
      prop: 'userId',
      label: '用户选择',
      component: userSelect,  // 直接传组件对象，无需字符串
      span: 24,
    },
  ],
}]
</script>

<template>
  <DialogForm
    v-model="visible"
    v-model:formData="formData"
    :sections="sections"
  />
</template>
```

**方式 2：字符串形式 + customComponent 标识**

如果需要使用字符串形式的组件名，可以添加 `customComponent: true` 标识。

**注意**：此方式要求组件已全局注册。

```javascript
// main.js - 全局注册组件
import userSelect from '@/components/user/index.vue'
app.component('userSelect', userSelect)

// 页面中使用
{
  prop: 'userId',
  label: '用户选择',
  component: 'userSelect',  // 字符串形式
  customComponent: true,     // 标识为自定义组件
  span: 24,
}
```

### 自定义组件 Props 传递

DialogForm 会自动将字段配置中的属性传递给自定义组件（排除内部使用的配置字段）。

```javascript
{
  prop: 'userId',
  label: '用户',
  component: userSelect,
  multiple: true,        // 自定义组件的 prop
  showDepartment: true,  // 自定义组件的 prop
  placeholder: '请选择用户',
  disabled: false,
}
```

**排除的内部字段**（不会传递给自定义组件）：
- `prop`, `label`, `component`, `customComponent`, `span`
- `visible`, `slotName`, `onClick`, `onChange`, `onFocus`, `onBlur`

### 自定义组件要求

自定义组件需要遵循以下规范才能正常工作：

1. **支持 v-model**：
   ```vue
   <script setup>
   defineProps({
     modelValue: {
       type: [String, Number, Array, Object],
       default: null
     }
   })
   
   const emit = defineEmits(['update:modelValue'])
   </script>
   ```

2. **接收常用 Props**（可选）：
   ```javascript
   defineProps({
     modelValue: {},
     placeholder: String,
     disabled: Boolean,
     // 其他自定义 props
   })
   ```

### 完整示例

```vue
<script setup>
import { ref } from 'vue'
import DialogForm from '@/components/DialogForm/index.vue'
import userSelect from '@/components/user/index.vue'
import MaterialSelector from '@/components/MaterialSelector/index.vue'

const visible = ref(false)
const formData = ref({
  name: '',
  userId: null,
  materialIds: [],
})

const sections = [{
  type: 'form',
  title: '采购信息',
  fields: [
    // Element Plus 组件
    {
      prop: 'name',
      label: '采购单名称',
      component: 'input',
      span: 24,
    },
    
    // 自定义组件：用户选择器
    {
      prop: 'userId',
      label: '采购员',
      component: userSelect,  // 组件对象
      span: 12,
    },

    // 自定义组件：物料选择器（多选）
    {
      prop: 'materialIds',
      label: '采购物料',
      component: MaterialSelector,  // 组件对象
      multiple: true,               // 自定义 prop
      showStock: true,              // 自定义 prop
      span: 12,
    },
  ],
}]

const handleConfirm = (data) => {
  console.log('提交的数据:', data)
  visible.value = false
}
</script>

<template>
  <el-button @click="visible = true">打开表单</el-button>

  <DialogForm
    v-model="visible"
    v-model:formData="formData"
    title="新增采购单"
    :sections="sections"
    @confirm="handleConfirm"
  />
</template>
```

### 技术优势

| 特性 | 字符串方式 | 组件对象方式 ✨ |
|-----|----------|---------------|
| 全局注册 | ❌ 需要 | ✅ 不需要 |
| 类型安全 | ⚠️ 弱 | ✅ 强 |
| IDE 支持 | ⚠️ 有限 | ✅ 完整 |
| 运行时检查 | ⚠️ 运行时错误 | ✅ 编译时检查 |

### 注意事项

1. **推荐使用组件对象方式**：直接传递组件对象是最简单、最安全的方式
2. **自定义组件必须支持 v-model**：确保组件实现了 `modelValue` prop 和 `update:modelValue` 事件
3. **Props 透传**：DialogForm 会透传字段配置中的属性，自定义组件应忽略不需要的 props
4. **表格编辑场景**：表格列的 `editComponent` 同样支持传递组件对象


