import { AxiosRequestConfig } from './types'

const defaults: AxiosRequestConfig = {
  method: 'get',

  timeout: 0,

  headers: {
    common: {
      Accept: 'application/json,text/plain,*/*'
    }
  }
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
