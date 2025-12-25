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
    redirect: '/home',
    children: [
      {
        path: 'home',
        name: 'Home',
        component: () => import('@/views/home/index.vue'),
        meta: {
          title: '首页',
          icon: 'HomeFilled',
          requiresAuth: true,
          affix: true,
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
]

/**
 * 动态路由（需要根据权限动态加载）
 */
export const asyncRoutes: RouteRecordRaw[] = [
  // 这里可以添加需要权限控制的路由
  // 示例：
  // {
  //   path: '/system',
  //   component: MainLayout,
  //   meta: {
  //     title: '系统管理',
  //     icon: 'Setting',
  //     requiresAuth: true,
  //     permissions: ['system:view'],
  //   },
  //   children: [
  //     {
  //       path: 'user',
  //       name: 'SystemUser',
  //       component: () => import('@/views/system/user/index.vue'),
  //       meta: {
  //         title: '用户管理',
  //         icon: 'User',
  //         requiresAuth: true,
  //         permissions: ['system:user:view'],
  //       },
  //     },
  //   ],
  // },
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
