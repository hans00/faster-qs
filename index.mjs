import { parse as parser } from 'fast-querystring'

const BAD_KEYS = new Set(Object.getOwnPropertyNames(Object.prototype))

const OPEN_BRACKET = 91 // [
const CLOSE_BRACKET = 93 // ]

const isPosInt = (str) => {
  const n = Number(str)
  return Number.isInteger(n) && n >= 0
}


const findFirstCharCode = (str, code, start=0) => {
  for (let i=start; i < str.length; ++i) {
    if (str.charCodeAt(i) == code) return i
  }
  return -1
}

const resolvePath = (o, path, v=null, d) => {
  const vIsArray = v instanceof Array
  let next = path
  let cur = o
  let curIsArray = o instanceof Array
  let l = findFirstCharCode(next, OPEN_BRACKET)
  let r = next.charCodeAt(l + 1) == CLOSE_BRACKET ? l + 1 : findFirstCharCode(next, CLOSE_BRACKET)
  let nextK = next.slice(l + 1, r)
  for (let k; d > 0 || !next; d--) {
    k = nextK || (curIsArray ? cur.length : 0)
    next = next.slice(r + 1, next.length)
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
    l = findFirstCharCode(next, OPEN_BRACKET)
    if (l === -1) break
    r = next.charCodeAt(l + 1) == CLOSE_BRACKET ? l + 1 : findFirstCharCode(next, CLOSE_BRACKET)
    if (r === -1 || l > r) break
    nextK = next.slice(l + 1, r)
    if (r === l + 1 || isPosInt(nextK)) {
      cur = cur[k] ??= []
    } else {
      cur[k] ??= {}
      if (cur[k] instanceof Array)
        cur[k] = { ...cur[k] }
      cur = cur[k]
    }
    curIsArray = cur instanceof Array
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
    l = findFirstCharCode(k, OPEN_BRACKET)
    if (l > 0 && findFirstCharCode(k, CLOSE_BRACKET, l) != -1) {
      const key = k.slice(0, l)
      const path = k.slice(l, k.length)
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
