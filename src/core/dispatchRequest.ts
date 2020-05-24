import { AxiosRequestConfig, AxiosPromise, AxiosResponse } from '../types'
import xhr from './xhr'
import { buildURL } from '../helpers/url'
import { transformResponse } from '../helpers/data'
import { flattenHeaders } from '../helpers/headers'
import transform from './transform'

function transformUrl(config: AxiosRequestConfig): string {
  // 一般在GET请求中需要这样做
  const { url, params } = config
  return buildURL(url!, params)
}

function transformConfig(config: AxiosRequestConfig) {
  const { data, headers = {}, transformRequest } = config

  // 处理参数第一步：GET请求处理url,参数在params中
  config.url = transformUrl(config)

  // 第二步：POST请求处理body,参数为data,需要转化为字符串
  // config.data = transformData(data)

  // 第三步：处理headers
  // config.headers = transformReqestHeaders(headers, data)

  // 合为一步
  config.data = transform(data, headers, transformRequest)
  config.headers = flattenHeaders(config.headers, config.method!)
}

function transformResponseData(res: AxiosResponse): AxiosResponse {
  const { data, headers } = res

  res.data = transform(data, headers, res.config.transformResponse)
  return res
}

function throwIfConcelationRequested(config: AxiosRequestConfig): void {
  if (config.cancelToken) {
    config.cancelToken.throwIfRequested()
  }
}

export default function dispatchRequest(config: AxiosRequestConfig): AxiosPromise {
  // 检查cancelToken是否已经使用过
  throwIfConcelationRequested(config)

  // 请求之前先处理好参数
  transformConfig(config)

  return xhr(config).then(res => {
    return transformResponseData(res)
  })
}
