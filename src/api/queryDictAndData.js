import request from '@/utils/request'

//查询启用禁用
export function queryEnableStatus() {
  return request({
    url: '/organization/dict/data/enable_status',
    method: 'get',
  })
}

//查询字典
export function queryDictDataWithCode(key) {
  return request({
    url: '/organization/dict/data/'+key,
    method: 'get',
  })
}
