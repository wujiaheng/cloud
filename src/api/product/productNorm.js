import request from '@/utils/request'

export function queryNorm(data) {
  return request({
    url: '/mall-product/productNorm/conditions',
    method: 'post',
    data
  })
}

export function getNorm(id) {
  return request({
    url: '/mall-product/productNorm/get/' +  id ,
    method: 'get'
  })
}

export function queryAllNorm() {
  return request({
    url: '/mall-product/productNorm/all',
    method: 'get'
  })
}

export function queryTree() {
  return request({
    url: '/mall-product/productNorm/tree',
    method: 'get'
  })
}

export function createNorm(data) {
  return request({
    url: '/mall-product/productNorm',
    method: 'post',
    data
  })
}

export function updateNorm(data) {
  return request({
    url: '/mall-product/productNorm/' + data.id,
    method: 'put',
    data
  })
}

export function deleteNorm(id) {
  return request({
    url: '/mall-product/productNorm/' + id,
    method: 'delete'
  })
}

export function batchDeleteNorm(data) {
  return request({
    url: '/mall-product/productNorm/all/delete',
    method: 'delete',
    data
  })
}
