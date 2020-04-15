import request from '@/utils/request'

export function queryBrand(data) {
  return request({
    url: '/mall-product/productBrand/conditions',
    method: 'post',
    data
  })
}

export function getBrand(id) {
  return request({
    url: '/mall-product/productBrand/get/' + id,
    method: 'get'
  })
}

export function queryAllBrand() {
  return request({
    url: '/mall-product/productBrand/all',
    method: 'get'
  })
}

export function createBrand(data) {
  return request({
    url: '/mall-product/productBrand',
    method: 'post',
    data
  })
}

export function updateBrand(data) {
  return request({
    url: '/mall-product/productBrand/' + data.id,
    method: 'put',
    data
  })
}

export function deleteBrand(id) {
  return request({
    url: '/mall-product/productBrand/' + id,
    method: 'delete'

  })
}

export function batchDeleteBrand(data) {
  return request({
    url: '/mall-product/productBrand/batch/delete',
    method: 'delete',
    data
  })
}
