import request from '@/utils/request'

export function fetchGroupByParentId(id) {
  return request({
    url: '/organization/menu/parent/' + id,
    method: 'get'
  })
}

export function getGroup(id) {
  return request({
    url: '/organization/menu/' + id,
    method: 'get'
  })
}

export function createGroup(data) {
  return request({
    url: '/organization/menu',
    method: 'post',
    data
  })
}

export function updateGroup(data) {
  return request({
    url: '/organization/menu/' + data.id,
    method: 'put',
    data
  })
}

export function deleteMenu(id) {
  return request({
    url: '/organization/menu/' + id,
    method: 'delete'
  })
}
/*
 * 菜单管理模块
 */
export function getTree() {
  return request({
    url: '/organization/menu/tree',
    method: 'get'
  })
}

// /*
//  * 菜单管理模块
//  */
// export const findMenuTree = () => {
//     return axios({
//         url: 'organization/menu/findTree',
//         method: 'get'
//     })
// }
