# 组件开发规范

## 组件分类和职责

### 组件分类
1. **基础组件 (Base Components)**: 最基础的 UI 组件，如按钮、输入框等
2. **业务组件 (Business Components)**: 包含业务逻辑的组件，如用户选择器、部门树等
3. **页面组件 (Page Components)**: 完整的页面级组件
4. **布局组件 (Layout Components)**: 页面布局相关组件

### 组件命名规范
```
基础组件: Base + 功能名 (如 BaseButton, BaseInput)
业务组件: 功能名 (如 UserSelector, DeptTree)
页面组件: 页面名 (如 UserList, RoleManagement)
布局组件: Layout + 位置 (如 LayoutHeader, LayoutSider)
```

## 组件开发模板

### 基础组件模板
```vue
<script setup lang="ts">
/**
 * 基础按钮组件
 * @description 扩展 Element Plus 按钮组件，添加自定义功能
 */

// 1. 导入依赖
import { computed } from 'vue';
import type { ButtonProps } from 'element-plus';

// 2. 定义组件名称
defineOptions({
  name: 'BaseButton'
});

// 3. 定义 Props
interface Props extends /* @vue-ignore */ Partial<ButtonProps> {
  /** 是否显示加载状态 */
  loading?: boolean;
  /** 按钮图标 */
  icon?: string;
  /** 权限标识 */
  permission?: string;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  icon: '',
  permission: ''
});

// 4. 定义 Emits
interface Emits {
  (e: 'click', event: MouseEvent): void;
}

const emit = defineEmits<Emits>();

// 5. 计算属性
const hasPermission = computed(() => {
  if (!props.permission) return true;
  // 检查权限逻辑
  return true;
});

// 6. 方法
function handleClick(event: MouseEvent) {
  if (props.loading) return;
  emit('click', event);
}
</script>

<template>
  <el-button
    v-if="hasPermission"
    :loading="loading"
    :icon="icon"
    v-bind="$attrs"
    @click="handleClick"
  >
    <slot />
  </el-button>
</template>

<style scoped lang="scss">
// 组件样式
</style>
```

### 业务组件模板
```vue
<script setup lang="ts">
/**
 * 用户选择器组件
 * @description 用于选择用户的下拉选择器
 */

// 1. 导入依赖
import { ref, onMounted, watch } from 'vue';
import { fetchUserList } from '@/service/api/system/user';
import type { User } from '@/typings/api/system';

// 2. 定义组件名称
defineOptions({
  name: 'UserSelector'
});

// 3. 定义 Props
interface Props {
  /** 选中的用户ID */
  modelValue?: number | number[];
  /** 是否多选 */
  multiple?: boolean;
  /** 占位文本 */
  placeholder?: string;
  /** 是否禁用 */
  disabled?: boolean;
  /** 部门ID过滤 */
  deptId?: number;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  multiple: false,
  placeholder: '请选择用户',
  disabled: false,
  deptId: undefined
});

// 4. 定义 Emits
interface Emits {
  (e: 'update:modelValue', value: number | number[]): void;
  (e: 'change', value: number | number[], user: User | User[]): void;
}

const emit = defineEmits<Emits>();

// 5. 响应式数据
const loading = ref(false);
const userList = ref<User[]>([]);
const selectedValue = ref(props.modelValue);

// 6. 计算属性
// ...

// 7. 方法
async function loadUsers() {
  loading.value = true;
  try {
    const { rows } = await fetchUserList({
      deptId: props.deptId,
      status: '0' // 只加载正常状态的用户
    });
    userList.value = rows;
  } catch (error) {
    console.error('加载用户列表失败:', error);
  } finally {
    loading.value = false;
  }
}

function handleChange(value: number | number[]) {
  emit('update:modelValue', value);
  
  // 查找选中的用户对象
  if (props.multiple) {
    const users = userList.value.filter(user => 
      (value as number[]).includes(user.userId)
    );
    emit('change', value, users);
  } else {
    const user = userList.value.find(u => u.userId === value);
    if (user) {
      emit('change', value, user);
    }
  }
}

// 8. 监听器
watch(() => props.modelValue, (newVal) => {
  selectedValue.value = newVal;
});

watch(() => props.deptId, () => {
  loadUsers();
});

// 9. 生命周期
onMounted(() => {
  loadUsers();
});
</script>

<template>
  <el-select
    v-model="selectedValue"
    :multiple="multiple"
    :placeholder="placeholder"
    :disabled="disabled"
    :loading="loading"
    filterable
    clearable
    @change="handleChange"
  >
    <el-option
      v-for="user in userList"
      :key="user.userId"
      :label="user.nickName"
      :value="user.userId"
    >
      <span>{{ user.nickName }}</span>
      <span style="color: var(--el-text-color-secondary); margin-left: 8px;">
        {{ user.userName }}
      </span>
    </el-option>
  </el-select>
</template>

<style scoped lang="scss">
// 组件样式
</style>
```

### 表格页面组件模板
```vue
<script setup lang="ts">
/**
 * 用户管理页面
 */

// 1. 导入依赖
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import type { FormInstance } from 'element-plus';
import {
  fetchUserList,
  addUser,
  updateUser,
  deleteUser,
  batchDeleteUser
} from '@/service/api/system/user';
import type { User, UserSearchParams } from '@/typings/api/system';

// 2. 定义组件名称
defineOptions({
  name: 'UserManagement'
});

// 3. 响应式数据
const loading = ref(false);
const tableData = ref<User[]>([]);
const total = ref(0);
const selectedRows = ref<User[]>([]);

// 查询表单
const queryFormRef = ref<FormInstance>();
const queryParams = reactive<UserSearchParams>({
  userName: '',
  phonenumber: '',
  status: '',
  pageNum: 1,
  pageSize: 10
});

// 编辑表单
const dialogVisible = ref(false);
const dialogTitle = ref('');
const formRef = ref<FormInstance>();
const formData = reactive<Partial<User>>({
  userId: undefined,
  userName: '',
  nickName: '',
  email: '',
  phonenumber: '',
  sex: '0',
  status: '0'
});

// 表单验证规则
const formRules = {
  userName: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  phonenumber: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
};

// 4. 方法
/** 加载数据 */
async function loadData() {
  loading.value = true;
  try {
    const { rows, total: totalCount } = await fetchUserList(queryParams);
    tableData.value = rows;
    total.value = totalCount;
  } catch (error) {
    console.error('加载数据失败:', error);
  } finally {
    loading.value = false;
  }
}

/** 查询 */
function handleQuery() {
  queryParams.pageNum = 1;
  loadData();
}

/** 重置 */
function handleReset() {
  queryFormRef.value?.resetFields();
  handleQuery();
}

/** 新增 */
function handleAdd() {
  dialogTitle.value = '新增用户';
  dialogVisible.value = true;
  resetForm();
}

/** 编辑 */
function handleEdit(row: User) {
  dialogTitle.value = '编辑用户';
  dialogVisible.value = true;
  Object.assign(formData, row);
}

/** 删除 */
async function handleDelete(row: User) {
  try {
    await ElMessageBox.confirm(
      `确定要删除用户"${row.nickName}"吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    await deleteUser(row.userId);
    ElMessage.success('删除成功');
    await loadData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除失败:', error);
    }
  }
}

/** 批量删除 */
async function handleBatchDelete() {
  if (selectedRows.value.length === 0) {
    ElMessage.warning('请选择要删除的数据');
    return;
  }
  
  try {
    await ElMessageBox.confirm(
      `确定要删除选中的 ${selectedRows.value.length} 条数据吗？`,
      '提示',
      {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }
    );
    
    const userIds = selectedRows.value.map(row => row.userId);
    await batchDeleteUser(userIds);
    ElMessage.success('删除成功');
    await loadData();
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error);
    }
  }
}

/** 提交表单 */
async function handleSubmit() {
  if (!formRef.value) return;
  
  try {
    await formRef.value.validate();
    
    if (formData.userId) {
      await updateUser(formData as User);
      ElMessage.success('更新成功');
    } else {
      await addUser(formData as User);
      ElMessage.success('新增成功');
    }
    
    dialogVisible.value = false;
    await loadData();
  } catch (error) {
    console.error('提交失败:', error);
  }
}

/** 重置表单 */
function resetForm() {
  formRef.value?.resetFields();
  Object.assign(formData, {
    userId: undefined,
    userName: '',
    nickName: '',
    email: '',
    phonenumber: '',
    sex: '0',
    status: '0'
  });
}

/** 表格选择变化 */
function handleSelectionChange(selection: User[]) {
  selectedRows.value = selection;
}

/** 分页变化 */
function handlePageChange(page: number) {
  queryParams.pageNum = page;
  loadData();
}

function handleSizeChange(size: number) {
  queryParams.pageSize = size;
  queryParams.pageNum = 1;
  loadData();
}

// 5. 生命周期
onMounted(() => {
  loadData();
});
</script>

<template>
  <div class="user-management">
    <!-- 查询区域 -->
    <el-card class="search-card">
      <el-form
        ref="queryFormRef"
        :model="queryParams"
        inline
      >
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="queryParams.userName"
            placeholder="请输入用户名"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phonenumber">
          <el-input
            v-model="queryParams.phonenumber"
            placeholder="请输入手机号"
            clearable
            @keyup.enter="handleQuery"
          />
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-select
            v-model="queryParams.status"
            placeholder="请选择状态"
            clearable
          >
            <el-option label="正常" value="0" />
            <el-option label="停用" value="1" />
          </el-select>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleQuery">
            查询
          </el-button>
          <el-button @click="handleReset">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 表格区域 -->
    <el-card class="table-card">
      <!-- 工具栏 -->
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <div class="card-header-actions">
            <el-button
              type="primary"
              @click="handleAdd"
            >
              新增
            </el-button>
            <el-button
              type="danger"
              :disabled="selectedRows.length === 0"
              @click="handleBatchDelete"
            >
              批量删除
            </el-button>
          </div>
        </div>
      </template>

      <!-- 表格 -->
      <el-table
        :data="tableData"
        :loading="loading"
        border
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="55" />
        <el-table-column prop="userId" label="用户ID" width="80" />
        <el-table-column prop="userName" label="用户名" />
        <el-table-column prop="nickName" label="昵称" />
        <el-table-column prop="email" label="邮箱" />
        <el-table-column prop="phonenumber" label="手机号" />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === '0' ? 'success' : 'danger'">
              {{ row.status === '0' ? '正常' : '停用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="handleEdit(row)"
            >
              编辑
            </el-button>
            <el-button
              type="danger"
              link
              @click="handleDelete(row)"
            >
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="queryParams.pageNum"
        v-model:page-size="queryParams.pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
      />
    </el-card>

    <!-- 编辑对话框 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="600px"
      @close="resetForm"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="100px"
      >
        <el-form-item label="用户名" prop="userName">
          <el-input
            v-model="formData.userName"
            placeholder="请输入用户名"
            :disabled="!!formData.userId"
          />
        </el-form-item>
        
        <el-form-item label="昵称" prop="nickName">
          <el-input
            v-model="formData.nickName"
            placeholder="请输入昵称"
          />
        </el-form-item>
        
        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
          />
        </el-form-item>
        
        <el-form-item label="手机号" prop="phonenumber">
          <el-input
            v-model="formData.phonenumber"
            placeholder="请输入手机号"
          />
        </el-form-item>
        
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="formData.sex">
            <el-radio label="0">男</el-radio>
            <el-radio label="1">女</el-radio>
            <el-radio label="2">未知</el-radio>
          </el-radio-group>
        </el-form-item>
        
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="formData.status">
            <el-radio label="0">正常</el-radio>
            <el-radio label="1">停用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      
      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="handleSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.user-management {
  padding: 20px;
  
  .search-card {
    margin-bottom: 20px;
  }
  
  .table-card {
    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      
      &-actions {
        display: flex;
        gap: 10px;
      }
    }
    
    :deep(.el-pagination) {
      margin-top: 20px;
      justify-content: flex-end;
    }
  }
}
</style>
```

## 组件通信规范

### Props 传递
```typescript
// 父组件
<UserSelector
  v-model="formData.userId"
  :dept-id="formData.deptId"
  multiple
  @change="handleUserChange"
/>

// 子组件
interface Props {
  modelValue?: number | number[];
  deptId?: number;
  multiple?: boolean;
}
```

### Emits 事件
```typescript
// 子组件定义
interface Emits {
  (e: 'update:modelValue', value: number): void;
  (e: 'change', value: number, user: User): void;
}

const emit = defineEmits<Emits>();

// 触发事件
emit('update:modelValue', userId);
emit('change', userId, user);
```

### Provide/Inject
```typescript
// 父组件提供
import { provide } from 'vue';

provide('theme', 'dark');
provide('config', { size: 'large' });

// 子组件注入
import { inject } from 'vue';

const theme = inject<string>('theme', 'light');
const config = inject<{ size: string }>('config');
```

## 组件样式规范

### BEM 命名规范
```scss
.user-selector {
  // Block
  
  &__input {
    // Element
  }
  
  &__option {
    // Element
    
    &--selected {
      // Modifier
    }
  }
  
  &--disabled {
    // Modifier
  }
}
```

### 使用 CSS 变量
```scss
.custom-button {
  color: var(--el-color-primary);
  background-color: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  
  &:hover {
    background-color: var(--el-fill-color-light);
  }
}
```

## 性能优化

### 1. 使用 v-show 代替 v-if
```vue
<!-- 频繁切换使用 v-show -->
<div v-show="visible">内容</div>

<!-- 条件渲染使用 v-if -->
<div v-if="hasPermission">内容</div>
```

### 2. 列表使用 key
```vue
<div v-for="item in list" :key="item.id">
  {{ item.name }}
</div>
```

### 3. 计算属性缓存
```typescript
// 使用计算属性
const filteredList = computed(() => {
  return list.value.filter(item => item.status === '0');
});

// 避免在模板中使用方法
// ❌ 不好
<div>{{ filterList() }}</div>

// ✅ 好
<div>{{ filteredList }}</div>
```

### 4. 组件懒加载
```typescript
// 路由懒加载
const UserList = () => import('@/views/system/user/index.vue');

// 组件懒加载
const HeavyComponent = defineAsyncComponent(() =>
  import('@/components/heavy-component.vue')
);
```

## 最佳实践

### 1. 单一职责
- 每个组件只负责一个功能
- 复杂组件拆分为多个子组件

### 2. Props 验证
- 定义完整的 Props 类型
- 提供合理的默认值

### 3. 事件命名
- 使用清晰的事件名称
- 遵循 update:xxx 的命名规范

### 4. 组件文档
- 添加组件描述注释
- 说明 Props、Emits、Slots

### 5. 错误处理
- 异步操作要有错误处理
- 提供友好的错误提示

### 6. 可访问性
- 添加合适的 aria 属性
- 支持键盘操作

## 注意事项

1. **不要直接修改 Props**: 使用 v-model 或 emit 事件
2. **避免深层嵌套**: 组件层级不超过 3 层
3. **合理使用 computed**: 避免副作用
4. **正确使用 watch**: 明确 immediate 和 deep
5. **组件通信**: 优先使用 Props/Emits
6. **样式隔离**: 使用 scoped 避免样式污染
7. **类型安全**: 使用 TypeScript 定义类型
8. **性能优化**: 避免不必要的渲染
