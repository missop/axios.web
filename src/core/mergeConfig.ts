import { AxiosRequestConfig } from '../types'
import { isPlaginObject, deepMerge } from '../helpers/util'

// 存放所有策略的处理函数
const strats = Object.create(null)

// 三种策略
// 1.对于大部分属性执行默认合并策略:target中有就取，没有则取source
function defaultStrat(source: any, target: any): any {
  return typeof target !== 'undefined' ? target : source
}

// 2.对于url,params,data只从自定义配置中取，source--默认配置中是没有意义的
function fromTargetStrat(source: any, target: any): any {
  if (typeof target !== 'undefined') {
    return target
  }
}

const stratKeysFormTarget = ['url', 'params', 'data']

stratKeysFormTarget.forEach(key => {
  strats[key] = fromTargetStrat
})

// 3.headers复杂对象合并
function deepMergeStrat(source: any, target: any): any {
  if (isPlaginObject(target)) {
    // target是对象
    return deepMerge(source, target)
  } else if (typeof target !== 'undefined') {
    // target为简单类型
    return target
  } else if (isPlaginObject(source)) {
    // target为undefined,source为对象
    return deepMerge(source)
  } else if (typeof source !== 'undefined') {
    // target为undefined,source为简单类型
    return source
  }
}

const stratKeysDeepMerge = ['headers', 'auth']

stratKeysDeepMerge.forEach(key => {
  strats[key] = deepMergeStrat
})

export default function mergeConfig(source: AxiosRequestConfig, target?: AxiosRequestConfig) {
  // 这种方式可以让config自动设置为any
  const config = Object.create(null)

  if (!target) {
    target = {}
  }

  function mergeField(key: string): void {
    // 取出具体的处理策略
    const strat = strats[key] || defaultStrat
    config[key] = strat(source[key], target![key])
  }

  // 1. 对于target中有的key先进行合并
  for (const key in target) {
    mergeField(key)
  }
  // 2.target中不存在而source中存在的
  for (const key in source) {
    if (!target[key]) {
      mergeField(key)
    }
  }

  return config
}
