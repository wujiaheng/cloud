import request from '@/utils/request'

//拿到所有菜单
export function layoutMenu() {
  return request({
    url: '/organization/menu',
    method: 'get'
  })
}