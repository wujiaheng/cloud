/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const organizationRouter = {
  path: '/organization',
  component: Layout,
  redirect: '/organization/user',
  name: 'Organization',
  meta: {
    title: '系统管理',
    icon: 'component'
  },
  children: [
    // {
    //   path: '/organization/user',
    //   component: Layout,
    //   name: 'User',
    //   redirect: '/organization/user',
    //   meta: {
    //     title: '测试管理',
    //     icon: 'peoples'
    //   },
    //    children:[
    //      {
    //        path: '/organization/user',
    //        component: () => import('@/views/organization/user'),
    //        name: 'User',
    //        meta: {
    //          title: '测试管理1',
    //          icon: 'peoples'
    //        }
    //      },
    //      {
    //        path: '/organization/user',
    //        component: () => import('@/views/organization/user'),
    //        name: 'User',
    //        meta: {
    //          title: '测试管理2',
    //          icon: 'peoples'
    //        }
    //      },
    //    ]
    // },
    {
      path: '/organization/user',
      component: () => import('@/views/organization/user'),
      name: 'User',
      meta: {
        title: '用户管理',
        icon: 'peoples'
      }
    },
    {
      path: '/organization/role',
      component: () => import('@/views/organization/role'),
      name: 'Role',
      meta: {
        title: '角色管理',
        icon: 'role'
      }
    },
    {
      path: '/organization/menu',
      component: () => import('@/views/organization/menu'),
      name: 'Menu',
      meta: {
        title: '菜单管理',
        icon: 'menu'
      }
    },
    {
      path: '/organization/resource',
      component: () => import('@/views/organization/resource'),
      name: 'Resource',
      meta: {
        title: '权限管理',
        icon: 'resource'
      }
    },
    {
      path: '/organization/dict',
      component: () => import('@/views/organization/dict'),
      name: 'Group',
      meta: {
        title: '数据字典',
        icon: 'dict'
      }
    },
    {
      path: '/organization/group',
      component: () => import('@/views/organization/group'),
      name: 'Group',
      meta: {
        title: '组织架构',
        icon: 'group'
      }
    }, {
      path: '/organization/gateway',
      component: () => import('@/views/organization/gateway'),
      name: 'Gateway',
      meta: {
        title: '路由管理',
        icon: 'guide'
      }
    }
  ]
}

export default organizationRouter
