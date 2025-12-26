/**
 * 路由配置
 */

import type { RouteRecordRaw } from 'vue-router'
import BlankLayout from '@/layouts/blank/index.vue'
import MainLayout from '@/layouts/index.vue'

/**
 * 常量路由（不需要权限的公共路由）
 */
export const constantRoutes: RouteRecordRaw[] = [
  {
    path: '/login',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'Login',
        component: () => import('@/views/login/index.vue'),
        meta: {
          title: '登录',
          hidden: true,
          requiresAuth: false,
        },
      },
    ],
  },
  {
    path: '/404',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'NotFound',
        component: () => import('@/views/error/404.vue'),
        meta: {
          title: '404',
          hidden: true,
          requiresAuth: false,
        },
      },
    ],
  },
  {
    path: '/403',
    component: BlankLayout,
    children: [
      {
        path: '',
        name: 'Forbidden',
        component: () => import('@/views/error/403.vue'),
        meta: {
          title: '403',
          hidden: true,
          requiresAuth: false,
        },
      },
    ],
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/workbench',
    children: [
      {
        path: 'workbench',
        name: 'Workbench',
        component: () => import('@/views/workbench/index.vue'),
        meta: {
          title: '工作台',
          icon: 'Monitor',
          requiresAuth: true,
          affix: true,
        },
      },
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          icon: 'HomeFilled',
          requiresAuth: true,
        },
      },
      {
        path: 'redirect/:path(.*)',
        name: 'Redirect',
        component: () => import('@/views/redirect/index.vue'),
        meta: {
          title: '重定向',
          hidden: true,
          requiresAuth: true,
        },
      },
    ],
  },
  {
    path: '/demo',
    name: 'Demo',
    component: () => import('@/views/demo/demo.vue'),
    meta: {
      title: '示例页面',
      // icon: 'Monitor',
      // requiresAuth: true,
    },
  },
]

/**
 * 动态路由（需要根据权限动态加载）
 */
export const asyncRoutes: RouteRecordRaw[] = [
  // 系统管理
  {
    path: '/system',
    component: MainLayout,
    redirect: '/system/user',
    meta: {
      title: '系统管理',
      icon: 'Setting',
      requiresAuth: true,
      order: 1,
    },
    children: [
      {
        path: 'user',
        name: 'SystemUser',
        component: () => import('@/views/system/user/index.vue'),
        meta: {
          title: '用户管理',
          icon: 'User',
          requiresAuth: true,
        },
      },
      {
        path: 'role',
        name: 'SystemRole',
        component: () => import('@/views/system/role/index.vue'),
        meta: {
          title: '角色管理',
          icon: 'UserFilled',
          requiresAuth: true,
        },
      },
      {
        path: 'menu',
        name: 'SystemMenu',
        component: () => import('@/views/system/menu/index.vue'),
        meta: {
          title: '菜单管理',
          icon: 'Menu',
          requiresAuth: true,
        },
      },
      {
        path: 'dept',
        name: 'SystemDept',
        component: () => import('@/views/system/dept/index.vue'),
        meta: {
          title: '部门管理',
          icon: 'OfficeBuilding',
          requiresAuth: true,
        },
      },
      {
        path: 'dict',
        name: 'SystemDict',
        component: () => import('@/views/system/dict/index.vue'),
        meta: {
          title: '字典管理',
          icon: 'Collection',
          requiresAuth: true,
        },
      },
    ],
  },
]

/**
 * 404 路由（必须放在最后）
 */
export const notFoundRoute: RouteRecordRaw = {
  path: '/:pathMatch(.*)*',
  redirect: '/404',
  meta: {
    hidden: true,
  },
}
