import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layout/Layout.vue'),
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        meta: { title: '数据概览', icon: 'Odometer' },
        component: () => import('../views/Dashboard.vue'),
      },
      {
        path: 'users',
        name: 'users',
        meta: { title: '用户管理', icon: 'UserFilled' },
        component: () => import('../views/Users.vue'),
      },
      {
        path: 'plants',
        name: 'plants',
        meta: { title: '植物管理', icon: 'Cherry' },
        component: () => import('../views/Plants.vue'),
      },
      {
        path: 'categories',
        name: 'categories',
        meta: { title: '分类管理', icon: 'Collection' },
        component: () => import('../views/Categories.vue'),
      },
      {
        path: 'records',
        name: 'records',
        meta: { title: '养护记录', icon: 'Calendar' },
        component: () => import('../views/Records.vue'),
      },
      {
        path: 'logs',
        name: 'logs',
        meta: { title: '养护日志', icon: 'Clock' },
        component: () => import('../views/Logs.vue'),
      },
      {
        path: 'profile',
        name: 'profile',
        meta: { title: '个人资料', icon: 'User' },
        component: () => import('../views/Profile.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = to.meta.title
    ? `${to.meta.title} · 植物养护日记管理后台`
    : '植物养护日记 · 管理后台'
})

export default router
