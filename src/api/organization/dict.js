import request from '@/utils/request'

export function queryDict(data) {
  return request({
    url: '/organization/dict/conditions',
    method: 'post',
    data
  })
}

export function queryDictData(data) {
  return request({
    url: '/organization/dictData/conditions',
    method: 'post',
    data
  })
}


export function getDict(id) {
  return request({
    url: '/organization/dict/get/' +  id ,
    method: 'get'
  })
}

export function getDictData(id) {
  return request({
    url: '/organization/dictData/get/' +  id ,
    method: 'get'
  })
}

export function createDict(data) {
  return request({
    url: '/organization/dict',
    method: 'post',
    data
  })
}

export function createDictData(data) {
  return request({
    url: '/organization/dictData',
    method: 'post',
    data
  })
}

export function updateDict(data) {
  return request({
    url: '/organization/dict/' + data.id,
    method: 'put',
    data
  })
}

export function updateDictData(data) {
  return request({
    url: '/organization/dictData/' + data.id,
    method: 'put',
    data
  })
}

export function deleteDict(id) {
  return request({
    url: '/organization/dict/' + id,
    method: 'delete'
  })
}

export function deleteDictData(id) {
  return request({
    url: '/organization/dictData/' + id,
    method: 'delete'
  })
}
