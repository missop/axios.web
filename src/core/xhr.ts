import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import { transformResponseHeaders } from '../helpers/headers'
import { createError } from '../helpers/error'
import { isURLSameOrigin, isFormData } from '../helpers/url'
import cookie from '../helpers/cookie'

export default function xhr(config: AxiosRequestConfig): AxiosPromise {
  return new Promise((resolve, reject) => {
    const {
      url,
      data = null,
      method = 'get',
      headers,
      responseType,
      timeout,
      cancelToken,
      withCredentials,
      xsrfCookieName,
      xsrfHeaderName,
      onDownloadProgress,
      onUploadProgress,
      auth,
      validateStatus
    } = config

    // 异步事件，应该在发送请求之前绑定
    function handleResponse(response: AxiosResponse) {
      const { status } = response
      if (!validateStatus || validateStatus(status)) {
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

    function addEvents(): void {
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

      if (onDownloadProgress) {
        request.onprogress = onDownloadProgress
      }

      if (onUploadProgress) {
        request.upload.onprogress = onUploadProgress
      }
    }

    function processCancel(): void {
      if (cancelToken) {
        cancelToken.promise.then(reason => {
          request.abort()
          reject(reason)
        })
      }
    }

    function processHeaders(): void {
      if (isFormData(data)) {
        delete headers['Content-Type']
      }

      // headers中添加token
      if ((withCredentials || isURLSameOrigin(url!)) && xsrfCookieName) {
        const xsrfValue = cookie.read(xsrfCookieName)
        if (xsrfValue) {
          headers[xsrfHeaderName!] = xsrfValue
        }
      }

      if (auth) {
        headers['Authorization'] = 'Basic ' + btoa(auth.username + ':' + auth.password)
      }

      // setRequestHeaders是有顺序的，在open后面
      Object.keys(headers).forEach(key => {
        if (data === null && key.toLowerCase() === 'content-type') {
          delete headers[key]
        } else {
          request.setRequestHeader(key, headers[key])
        }
      })
    }

    function configRequest(): void {
      if (responseType) {
        request.responseType = responseType
      }
      if (timeout) {
        request.timeout = timeout
      }

      if (withCredentials) {
        request.withCredentials = true
      }
    }

    const request = new XMLHttpRequest()

    request.open(method.toUpperCase(), url!, true)

    configRequest()

    addEvents()

    processHeaders()

    processCancel()

    request.send(data)
  })
}
