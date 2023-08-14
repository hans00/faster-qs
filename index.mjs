import { parse as parser } from 'fast-querystring'

const BAD_KEYS = new Set(Object.getOwnPropertyNames(Object.prototype))

const isPosInt = (str) => {
  const n = Number(str)
  return Number.isInteger(n) && n >= 0
}

const resolvePath = (o, path, v=null, d) => {
  const vIsArray = v instanceof Array
  let next = path
  let cur = o
  let curIsArray = o instanceof Array
  let l = next.indexOf('[')
  let r = next.indexOf(']')
  let nextK = next.slice(l + 1, r)
  for (let k; d > 0 || !next; d--) {
    curIsArray = cur instanceof Array
    k = nextK || (curIsArray ? cur.length : 0)
    next = next.slice(r + 1)
    if (isPosInt(k)) {
      if (!cur) {
        cur = []
        o = cur
        curIsArray = true
      }
      if (!curIsArray) {
        if (!k) k = Object.keys(cur).length
      } else {
        k = Number(k)
      }
    } else if (!BAD_KEYS.has(k)) {
      if (!cur) {
        cur = {}
        o = cur
      }
      if (curIsArray || typeof cur === 'string') {
        break
      }
    } else {
      break
    }
    // resolve value apply
    if (!next) {
      if (curIsArray && vIsArray) { // join array
        if (r === l + 1) {
          cur.push.apply(cur, v)
        } else {
          cur.splice(k, 0, v)
        }
      } else { // set index
        cur[k] = v
      }
      return o
    }
    // resolve next cursor
    l = next.indexOf('[')
    r = next.indexOf(']')
    nextK = next.slice(l + 1, r)
    if (l === -1 || r === -1 || l > r) {
      break
    }
    if (r === l + 1 || isPosInt(nextK)) {
      cur = cur[k] ??= []
    } else {
      cur[k] ??= {}
      if (cur[k] instanceof Array)
        cur[k] = { ...cur[k] }
      cur = cur[k]
    }
  }
  if (next) {
    if (curIsArray) {
      cur.push({ [next]: v })
    } else if (typeof cur === 'object') {
      cur[next] = v
    }
  }
  return o
}

export default (str, depth=5) => {
  const data = parser(str)
  const o = {}
  let v, l
  for (const k in data) {
    v = data[k]
    l = k.indexOf('[')
    if (l > 0 && k.indexOf(']') > l) {
      const key = k.slice(0, l)
      const path = k.slice(l)
      if (path === '[]') { // optimize 1d array
        if (key in o) {
          if (
            typeof o[key] === 'string' ||
            o[key] instanceof Array
          ) {
            o[key] = [].concat(o[key], v)
          } else {
            const ki = Object.keys(o[key]).length
            o[key][ki] = v
          }
        } else o[key] = v
      } else {
        o[key] = resolvePath(o[key], path, v, depth)
      }
    } else o[k] = v
  }
  return o
}
