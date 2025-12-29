# 测试规范

## 测试策略

### 测试金字塔
```
        /\
       /  \
      / E2E \      端到端测试 (少量)
     /______\
    /        \
   / 集成测试  \    集成测试 (适量)
  /___________\
 /             \
/   单元测试     \  单元测试 (大量)
/_______________\
```

### 测试类型
1. **单元测试**: 测试独立的函数、组件
2. **集成测试**: 测试组件之间的交互
3. **E2E 测试**: 测试完整的用户流程

## 单元测试规范

### 工具选择
- **测试框架**: Vitest
- **测试工具**: @vue/test-utils
- **断言库**: Vitest (内置)
- **Mock 工具**: Vitest (内置)

### 测试文件组织
```
src/
├── components/
│   ├── UserSelector/
│   │   ├── index.vue
│   │   └── __tests__/
│   │       └── index.spec.ts
│   └── DeptTree/
│       ├── index.vue
│       └── __tests__/
│           └── index.spec.ts
├── utils/
│   ├── format.ts
│   └── __tests__/
│       └── format.spec.ts
└── stores/
    └── modules/
        ├── user.ts
        └── __tests__/
            └── user.spec.ts
```

### 工具函数测试
```typescript
// src/utils/__tests__/format.spec.ts
import { describe, it, expect } from 'vitest';
import { formatDate, formatNumber, formatCurrency } from '../format';

describe('format utils', () => {
  describe('formatDate', () => {
    it('应该正确格式化日期', () => {
      const date = new Date('2024-01-01 12:00:00');
      expect(formatDate(date)).toBe('2024-01-01');
    });
    
    it('应该支持自定义格式', () => {
      const date = new Date('2024-01-01 12:00:00');
      expect(formatDate(date, 'YYYY/MM/DD')).toBe('2024/01/01');
    });
    
    it('应该处理无效日期', () => {
      expect(formatDate(null)).toBe('');
      expect(formatDate(undefined)).toBe('');
    });
  });
  
  describe('formatNumber', () => {
    it('应该正确格式化数字', () => {
      expect(formatNumber(1000)).toBe('1,000');
      expect(formatNumber(1000000)).toBe('1,000,000');
    });
    
    it('应该支持小数位数', () => {
      expect(formatNumber(1000.123, 2)).toBe('1,000.12');
    });
  });
  
  describe('formatCurrency', () => {
    it('应该正确格式化货币', () => {
      expect(formatCurrency(1000)).toBe('¥1,000.00');
    });
    
    it('应该支持自定义货币符号', () => {
      expect(formatCurrency(1000, '$')).toBe('$1,000.00');
    });
  });
});
```

### 组件测试
```typescript
// src/components/UserSelector/__tests__/index.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import UserSelector from '../index.vue';
import * as userApi from '@/service/api/system/user';

// Mock API
vi.mock('@/service/api/system/user', () => ({
  fetchUserList: vi.fn()
}));

describe('UserSelector', () => {
  beforeEach(() => {
    // 创建新的 Pinia 实例
    setActivePinia(createPinia());
    
    // 重置 Mock
    vi.clearAllMocks();
  });
  
  it('应该正确渲染', () => {
    const wrapper = mount(UserSelector);
    expect(wrapper.exists()).toBe(true);
  });
  
  it('应该显示占位文本', () => {
    const wrapper = mount(UserSelector, {
      props: {
        placeholder: '请选择用户'
      }
    });
    
    expect(wrapper.find('input').attributes('placeholder')).toBe('请选择用户');
  });
  
  it('应该加载用户列表', async () => {
    const mockUsers = [
      { userId: 1, userName: 'admin', nickName: '管理员' },
      { userId: 2, userName: 'user', nickName: '普通用户' }
    ];
    
    vi.mocked(userApi.fetchUserList).mockResolvedValue({
      rows: mockUsers,
      total: 2
    });
    
    const wrapper = mount(UserSelector);
    
    // 等待异步操作完成
    await wrapper.vm.$nextTick();
    await new Promise(resolve => setTimeout(resolve, 100));
    
    expect(userApi.fetchUserList).toHaveBeenCalled();
  });
  
  it('应该支持 v-model', async () => {
    const wrapper = mount(UserSelector, {
      props: {
        modelValue: 1,
        'onUpdate:modelValue': (value: number) => {
          wrapper.setProps({ modelValue: value });
        }
      }
    });
    
    expect(wrapper.props('modelValue')).toBe(1);
    
    // 模拟选择变化
    await wrapper.vm.$emit('update:modelValue', 2);
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2]);
  });
  
  it('应该触发 change 事件', async () => {
    const wrapper = mount(UserSelector);
    
    await wrapper.vm.$emit('change', 1, { userId: 1, userName: 'admin' });
    
    expect(wrapper.emitted('change')).toBeTruthy();
    expect(wrapper.emitted('change')?.[0]).toEqual([
      1,
      { userId: 1, userName: 'admin' }
    ]);
  });
  
  it('应该支持禁用状态', () => {
    const wrapper = mount(UserSelector, {
      props: {
        disabled: true
      }
    });
    
    expect(wrapper.find('input').attributes('disabled')).toBeDefined();
  });
  
  it('应该支持多选', async () => {
    const wrapper = mount(UserSelector, {
      props: {
        multiple: true,
        modelValue: [1, 2]
      }
    });
    
    expect(wrapper.props('modelValue')).toEqual([1, 2]);
  });
});
```

### Store 测试
```typescript
// src/stores/modules/__tests__/user.spec.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useUserStore } from '../user';

describe('User Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  
  it('应该初始化为空状态', () => {
    const store = useUserStore();
    
    expect(store.userInfo).toBeNull();
    expect(store.permissions).toEqual([]);
    expect(store.roles).toEqual([]);
    expect(store.isLoggedIn).toBe(false);
  });
  
  it('应该正确设置用户信息', () => {
    const store = useUserStore();
    const userInfo = {
      userId: 1,
      userName: 'admin',
      nickName: '管理员'
    };
    
    store.setUserInfo(userInfo);
    
    expect(store.userInfo).toEqual(userInfo);
    expect(store.isLoggedIn).toBe(true);
    expect(store.nickName).toBe('管理员');
  });
  
  it('应该正确设置权限', () => {
    const store = useUserStore();
    const permissions = ['system:user:add', 'system:user:edit'];
    
    store.setPermissions(permissions);
    
    expect(store.permissions).toEqual(permissions);
    expect(store.hasPermission('system:user:add')).toBe(true);
    expect(store.hasPermission('system:user:delete')).toBe(false);
  });
  
  it('应该正确设置角色', () => {
    const store = useUserStore();
    const roles = ['admin', 'user'];
    
    store.setRoles(roles);
    
    expect(store.roles).toEqual(roles);
    expect(store.hasRole('admin')).toBe(true);
    expect(store.hasRole('guest')).toBe(false);
  });
  
  it('应该正确清空用户信息', () => {
    const store = useUserStore();
    
    // 先设置数据
    store.setUserInfo({ userId: 1, userName: 'admin', nickName: '管理员' });
    store.setPermissions(['system:user:add']);
    store.setRoles(['admin']);
    
    // 清空
    store.clearUserInfo();
    
    expect(store.userInfo).toBeNull();
    expect(store.permissions).toEqual([]);
    expect(store.roles).toEqual([]);
    expect(store.isLoggedIn).toBe(false);
  });
  
  it('应该正确更新用户信息', () => {
    const store = useUserStore();
    
    store.setUserInfo({
      userId: 1,
      userName: 'admin',
      nickName: '管理员'
    });
    
    store.updateUserInfo({
      nickName: '超级管理员'
    });
    
    expect(store.userInfo?.nickName).toBe('超级管理员');
    expect(store.userInfo?.userName).toBe('admin');
  });
});
```

### 异步操作测试
```typescript
// src/stores/modules/__tests__/auth.spec.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAuthStore } from '../auth';
import * as authApi from '@/service/api/auth';

// Mock API
vi.mock('@/service/api/auth', () => ({
  login: vi.fn(),
  logout: vi.fn(),
  getInfo: vi.fn()
}));

describe('Auth Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });
  
  it('应该成功登录', async () => {
    const store = useAuthStore();
    
    vi.mocked(authApi.login).mockResolvedValue({
      access_token: 'test-token',
      refresh_token: 'test-refresh-token'
    });
    
    vi.mocked(authApi.getInfo).mockResolvedValue({
      user: { userId: 1, userName: 'admin', nickName: '管理员' },
      permissions: ['system:user:add'],
      roles: ['admin']
    });
    
    const success = await store.handleLogin({
      username: 'admin',
      password: '123456'
    });
    
    expect(success).toBe(true);
    expect(store.token).toBe('test-token');
    expect(authApi.login).toHaveBeenCalledWith({
      username: 'admin',
      password: '123456'
    });
    expect(authApi.getInfo).toHaveBeenCalled();
  });
  
  it('应该处理登录失败', async () => {
    const store = useAuthStore();
    
    vi.mocked(authApi.login).mockRejectedValue(new Error('登录失败'));
    
    const success = await store.handleLogin({
      username: 'admin',
      password: 'wrong'
    });
    
    expect(success).toBe(false);
    expect(store.token).toBe('');
  });
  
  it('应该成功登出', async () => {
    const store = useAuthStore();
    
    // 先设置 token
    store.setToken('test-token');
    
    vi.mocked(authApi.logout).mockResolvedValue();
    
    await store.handleLogout();
    
    expect(store.token).toBe('');
    expect(authApi.logout).toHaveBeenCalled();
  });
});
```

## 测试覆盖率

### 覆盖率目标
- **语句覆盖率**: >= 80%
- **分支覆盖率**: >= 75%
- **函数覆盖率**: >= 80%
- **行覆盖率**: >= 80%

### 配置覆盖率
```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/mockData',
        'tests/'
      ],
      thresholds: {
        statements: 80,
        branches: 75,
        functions: 80,
        lines: 80
      }
    }
  }
});
```

### 运行测试
```bash
# 运行所有测试
pnpm test

# 运行测试并生成覆盖率报告
pnpm test:coverage

# 监听模式运行测试
pnpm test:watch

# 运行单个测试文件
pnpm test src/utils/__tests__/format.spec.ts
```

## Mock 数据规范

### Mock API 响应
```typescript
// tests/mocks/api/user.ts
export const mockUserList = {
  rows: [
    {
      userId: 1,
      userName: 'admin',
      nickName: '管理员',
      email: 'admin@example.com',
      phonenumber: '13800138000',
      sex: '0',
      status: '0',
      createTime: '2024-01-01 00:00:00'
    },
    {
      userId: 2,
      userName: 'user',
      nickName: '普通用户',
      email: 'user@example.com',
      phonenumber: '13800138001',
      sex: '1',
      status: '0',
      createTime: '2024-01-02 00:00:00'
    }
  ],
  total: 2
};

export const mockUserDetail = {
  userId: 1,
  userName: 'admin',
  nickName: '管理员',
  email: 'admin@example.com',
  phonenumber: '13800138000',
  sex: '0',
  status: '0',
  createTime: '2024-01-01 00:00:00'
};
```

### 使用 Mock 数据
```typescript
import { mockUserList } from '@/tests/mocks/api/user';

vi.mocked(fetchUserList).mockResolvedValue(mockUserList);
```

## 测试最佳实践

### 1. 测试命名
- 使用清晰的描述性名称
- 使用 "应该..." 的格式
- 说明测试的预期行为

```typescript
// ✅ 好的命名
it('应该在用户名为空时显示错误提示', () => {});
it('应该在点击提交按钮时调用 API', () => {});

// ❌ 不好的命名
it('test1', () => {});
it('works', () => {});
```

### 2. 测试结构
- 使用 AAA 模式：Arrange（准备）、Act（执行）、Assert（断言）
- 每个测试只测试一个功能点
- 保持测试简单和独立

```typescript
it('应该正确格式化日期', () => {
  // Arrange - 准备测试数据
  const date = new Date('2024-01-01');
  
  // Act - 执行被测试的函数
  const result = formatDate(date);
  
  // Assert - 断言结果
  expect(result).toBe('2024-01-01');
});
```

### 3. Mock 使用
- 只 Mock 必要的依赖
- 在 beforeEach 中清理 Mock
- 使用类型安全的 Mock

```typescript
beforeEach(() => {
  vi.clearAllMocks();
});

// 类型安全的 Mock
vi.mocked(fetchUserList).mockResolvedValue(mockData);
```

### 4. 异步测试
- 使用 async/await
- 等待异步操作完成
- 处理 Promise 的 reject

```typescript
it('应该成功加载数据', async () => {
  const wrapper = mount(Component);
  
  // 等待异步操作
  await wrapper.vm.$nextTick();
  await new Promise(resolve => setTimeout(resolve, 100));
  
  expect(wrapper.vm.data).toBeDefined();
});
```

### 5. 测试覆盖
- 测试正常流程
- 测试边界情况
- 测试错误处理
- 测试用户交互

```typescript
describe('formatNumber', () => {
  it('应该正确格式化正数', () => {
    expect(formatNumber(1000)).toBe('1,000');
  });
  
  it('应该正确格式化负数', () => {
    expect(formatNumber(-1000)).toBe('-1,000');
  });
  
  it('应该处理零', () => {
    expect(formatNumber(0)).toBe('0');
  });
  
  it('应该处理小数', () => {
    expect(formatNumber(1000.5)).toBe('1,000.5');
  });
  
  it('应该处理无效输入', () => {
    expect(formatNumber(NaN)).toBe('');
    expect(formatNumber(null)).toBe('');
  });
});
```

## 注意事项

1. **测试独立性**: 每个测试应该独立运行，不依赖其他测试
2. **测试速度**: 保持测试快速，避免不必要的延迟
3. **测试可维护性**: 测试代码也需要维护，保持清晰和简洁
4. **Mock 适度**: 不要过度 Mock，保持测试的真实性
5. **覆盖率不是目标**: 关注测试质量而不是数量
6. **持续集成**: 在 CI/CD 中运行测试
7. **测试文档**: 测试本身就是文档，保持清晰
8. **定期维护**: 随着代码变化更新测试
