import { parse as parser } from 'fast-querystring'

const isPosInt = (str) => {
  const n = Number(str)
  return Number.isInteger(n) && n >= 0
}

const resolvePath = (o, path, v=null, d) => {
  let next = path
  let cur = o
  let l, r, k
  for (; d > 0 || !next; d--) {
    l = next.indexOf('[')
    r = next.indexOf(']')
    if (l === -1 || r === -1 || l > r) return { [next]: v }
    k = next.slice(l + 1, r) || cur?.length || 0
    next = next.slice(r + 1)
    if (isPosInt(k)) {
      let i = Number(k)
      if (!cur) cur = []
      if (!o) o = cur
      if (!Array.isArray(cur)) {
        if (!k && !i) i = Object.keys(cur).length
        cur = cur[i] = {}
        continue
      }
      const extend = i - cur.length + 1
      if (extend > 0) {
        cur.push.apply(cur, Array(extend))
      }
      if (next === '[]' && typeof v !== 'string') {
        cur[i] = [...cur[i] ?? [], ...v]
        return o
      } else if (next) {
        if (next.startsWith('[]')) {
          cur = cur[k] ??= []
        } else {
          if (!cur[i]) cur[i] = {}
          else if (Array.isArray(cur[i]))
            cur[i] = { ...cur[i] }
          cur = cur[i]
        }
      } else {
        cur[i] = v
        return o
      }
    } else if (!{}[k]) {
      if (!cur) cur = {}
      if (!o) o = cur
      if (next) {
        if (next.startsWith('[]')) {
          cur = cur[k] ??= []
        } else {
          if (!cur[k]) cur[k] = {}
          else if (Array.isArray(cur[k]))
            cur[k] = { ...cur[k] }
          cur = cur[k]
        }
      } else {
        cur[k] = v
        return o
      }
    } else {
      break
    }
  }
  if (Array.isArray(cur)) {
    if (next) cur.push({ [next]: v })
    else cur.push(v)
  } else if (typeof cur === 'object') {
    if (next) cur[next] = v
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
      if (path === '[]') {
        if (key in o) {
          if (!Array.isArray(o[key]))
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
