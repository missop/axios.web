import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { transformResponseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const { url, data = null, method = 'get', headers, responseType, timeout } = config

    const request = new XMLHttpRequest()
    if (responseType) {
      request.responseType = responseType
    }
    if (timeout) {
      request.timeout = timeout
    }

    request.open(method.toUpperCase(), url, true)

    // setRequestHeaders是有顺序的，在open后面
    Object.keys(headers).forEach(key => {
      if (data === null && key.toLowerCase() === 'content-type') {
        delete headers[key]
      } else {
        request.setRequestHeader(key, headers[key])
      }
    })

    // 异步事件，应该在发送请求之前绑定
    function handleResponse(response: AxiosResponse) {
      const { status } = response
      if (status >= 200 && status < 300) {
        resolve(response)
      } else {
        reject(
          createError(
            `Request failed with status code ${response.status}`,
            config,
            null,
            request,
            response
          )
        )
      }
    }

    request.onreadystatechange = function handleReadyState() {
      const { readyState, status } = request

      if (readyState !== 4) {
        return
      }

      // 出现网络错误或者超时错误的时候，该值都为 0
      if (status === 0) {
        return
      }

      // respnse需要根据type自行处理,不是请求去处理
      const response =
        responseType && responseType !== 'text' ? request.response : request.responseText
      const headers = transformResponseHeaders(request.getAllResponseHeaders())

      const axiosResponse: AxiosResponse = {
        data: response,
        status: request.status,
        statusText: request.statusText,
        headers,
        config,
        request
      }

      handleResponse(axiosResponse)
    }

    // 网络错误
    request.onerror = function handleError() {
      reject(createError('Network Error', config, null, request))
    }

    // 超时错误
    request.ontimeout = function handleTimeout() {
      reject(createError(`Timeout of ${timeout} ms exceeded`, config, 'ECONNABORTED', request))
    }

    request.send(data)
  })
}
