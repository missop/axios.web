import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL } from '../helpers/url'
import { transformData, transformResponse } from '../helpers/data'
import { transformReqestHeaders } from '../helpers/headers'

function transformUrl(config: AxiosRequestConfig): string {
  // 一般在GET请求中需要这样做
  const { url, params } = config
  return buildURL(url, params)
}

function transformConfig(config: AxiosRequestConfig) {
  const { data, headers = {} } = config

  // 处理参数第一步：GET请求处理url,参数在params中
  config.url = transformUrl(config)

  // 第二步：POST请求处理body,参数为data,需要转化为字符串
  config.data = transformData(data)

  // 第三步：处理headers
  config.headers = transformReqestHeaders(headers, data)
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
  res.data = transformResponse(res.data)
  return res
}

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  // 请求之前先处理好参数
  transformConfig(config)

  return xhr(config).then(res => {
    return transformResponseData(res)
  })
}
