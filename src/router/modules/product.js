/** When your routing table is too long, you can split it into small modules **/

import Layout from '@/layout'

const organizationRouter = {
  path: '/product',
  component: Layout,
  redirect: '/product/productCate',
  name: 'Product',
  meta: {
    title: '商品管理',
    icon: 'component'
  },
  children: [
    {
       path: '/product/productNorm',
       component: () => import('@/views/product/productNorm'),
       name: 'productNorm',
       meta: {
         title: '商品规格管理',
         icon: 'peoples'
       }
     },
   {
      path: '/product/productCate',
      component: () => import('@/views/product/productCate'),
      name: 'productCate',
      meta: {
        title: '商品分类管理',
        icon: 'peoples'
      }
    }
  
  ]
}

export default organizationRouter
