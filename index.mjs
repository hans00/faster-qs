import { parse as parser } from 'fast-querystring'

const BAD_KEYS = new Set([
  'length',
  ...Object.getOwnPropertyNames(Object.prototype),
])

const isPosInt = (str) => {
  const n = Number(str)
  return Number.isInteger(n) && n >= 0
}

const resolvePath = (o, path, v=null, d) => {
  let next = path
  let cur = o
  for (let l, r, k; d > 0 || !next; d--) {
    l = next.indexOf('[')
    r = next.indexOf(']')
    if (l === -1 || r === -1 || l > r) return { [next]: v }
    k = next.slice(l + 1, r) || cur?.length || 0
    next = next.slice(r + 1)
    if (isPosInt(k)) {
      if (!cur) {
        cur = []
        o = cur
      }
      if (!(cur instanceof Array)) {
        if (!k) k = Object.keys(cur).length
        cur = cur[k] = {}
        continue
      }
      k = Number(k)
      const extend = k - cur.length + 1
      if (extend > 0) {
        cur.push.apply(cur, Array(extend))
      }
      if (!next) {
        if (typeof v !== 'string') { // join array
          cur.splice(k, 1)
          cur.push.apply(cur, v)
        } else { // set index
          cur[k] = v
        }
        return o
      }
    } else if (!BAD_KEYS.has(k)) {
      if (!cur) {
        cur = {}
        o = cur
      }
      if (typeof cur === 'string') {
        break
      }
      if (!next) {
        cur[k] = v
        return o
      }
    } else {
      break
    }
    // resolve next cursor
    if (next.startsWith('[]')) {
      cur = cur[k] ??= []
    } else {
      cur[k] ??= {}
      if (cur[k] instanceof Array)
        cur[k] = { ...cur[k] }
      cur = cur[k]
    }
  }
  if (next) {
    if (cur instanceof Array) {
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
          if (!(o[key] instanceof Array))
            o[key] = [o[key]]
          o[key] = [].concat(o[key], v)
        } else o[key] = v
      } else {
        o[key] = resolvePath(o[key], path, v, depth)
      }
    } else o[k] = v
  }
  return o
}
