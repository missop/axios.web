import { isPlaginObject, deepMerge } from './util'
import { Method } from '../types'

const setContentType = (headers: any) =>
  (headers['Content-Type'] = 'application/json;charset=utf-8')

export function transformReqestHeaders(headers: any, data: any): any {
  let hasContentType = false

  // 如果headers没有设置，则直接返回空对象，不设置headers
  if (!headers) {
    return
  }

  // 如果headers设置了Content-Type则转化为大写
  Object.keys(headers).forEach(key => {
    if (key !== 'Content-Type' && key.toLowerCase() === 'content-type') {
      hasContentType = true
      delete headers[key]
      setContentType(headers)
    }
  })

  // 如果headers存在但是没有设置Content-Type则添加
  if (isPlaginObject(data)) {
    if (headers && !hasContentType) {
      setContentType(headers)
    }
  }

  return headers
}

export function transformResponseHeaders(headers: string): any {
  const responseHeaders = Object.create(null)
  if (!headers) {
    return responseHeaders
  }

  headers.split('\r\n').forEach(item => {
    if (!item) {
      return
    }

    let [key, value = ''] = item.split(':')
    key = key.trim().toLowerCase()

    responseHeaders[key] = value.trim()
  })

  return responseHeaders
}

export function flattenHeaders(headers: any, method: Method): any {
  if (!headers) {
    return headers
  }
  headers = deepMerge(headers.common || {}, headers[method] || {}, headers)

  const methodsToDelete = ['delete', 'get', 'head', 'options', 'post', 'put', 'patch', 'common']

  methodsToDelete.forEach(method => {
    delete headers[method]
  })

  return headers
}
