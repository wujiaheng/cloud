import request from '@/utils/request'

export function fetchGroupByParentId(id) {
  return request({
    url: '/mall-product/productCate/parent/' + id,
    method: 'get'
  })
}

export function getPeoductCate(id) {
  return request({
    url: '/mall-product/productCate/get/' + id,
    method: 'get'
  })
}

export function createGroup(data) {
  return request({
    url: '/mall-product/productCate',
    method: 'post',
    data
  })
}

export function updateGroup(data) {
  return request({
    url: '/mall-product/productCate/' + data.id,
    method: 'put',
    data
  })
}

export function deleteMenu(id) {
  return request({
    url: '/mall-product/productCate/' + id,
    method: 'delete'
  })
}

export function getTree() {
  return request({
    url: '/mall-product/productCate/tree',
    method: 'get'
  })
}
