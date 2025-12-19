export default [
  {
    path: '/',
    name: 'index',
    meta: { active: '/index' },
    component: () => import('@/pages/index.vue')
  },
]