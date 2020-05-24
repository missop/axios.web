import { AxiosRequestConfig } from './types'
import { transformReqestHeaders } from './helpers/headers'
import { transformData, transformResponse } from './helpers/data'

const defaults: AxiosRequestConfig = {
  method: 'get',

  timeout: 0,

  headers: {
    common: {
      Accept: 'application/json,text/plain,*/*'
    }
  },

  xsrfCookieName: 'XSRF-TOKEN',

  xsrfHeaderName: 'X-XSRF-TOKEN',

  transformRequest: [
    function(data: any, headers: any): any {
      transformReqestHeaders(headers, data)
      return transformData(data)
    }
  ],

  transformResponse: [
    function(data: any): any {
      return transformResponse(data)
    }
  ]
}

const methodsNoHeader = ['delete', 'get', 'head', 'options']

methodsNoHeader.forEach(method => {
  defaults.headers[method] = {}
})

const methodsWithHeader = ['post', 'put', 'patch']

methodsWithHeader.forEach(method => {
  defaults.headers[method] = {}
})

export default defaults
