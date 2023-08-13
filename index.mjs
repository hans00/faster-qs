import { parse as parser } from 'fast-querystring'

const isPosInt = (str) => {
  const n = Number(str)
  return Number.isInteger(n) && n >= 0
}

const resolvePath = (o, path, v=null, d) => {
  if (!path) {
    if (!o) return v
    o.push(v)
    return o
  }
  if (d === 0) return { [path]: v }
  const l = path.indexOf('[')
  const r = path.indexOf(']')
  if (l === -1 || r === -1 || l > r) return { [path]: v }
  const k = path.slice(l + 1, r) || o?.length || 0
  const next = path.slice(r + 1)
  if (isPosInt(k)) {
    let i = Number(k)
    if (!o) o = []
    else if (!Array.isArray(o)) {
      if (!k && !i) i = Object.keys(o).length
      return {
        ...o,
        [i]: resolvePath(o[i], next, v, d - 1),
      }
    }
    const extend = i - o.length + 1
    if (extend > 0) {
      o = [...o, ...Array(extend)]
    }
    if (next === '[]' && typeof v !== 'string' && (!o[i] || Array.isArray(o[i]))) {
      o[i] = [...o[i] ?? [], ...v]
    } else {
      o[i] = resolvePath(o[i], next, v, d - 1)
    }
    return o
  } else if (!{}[k]) {
    return {
      ...o,
      [k]: resolvePath(o?.[k], next, v, d - 1),
    }
  } else {
    return o
  }
}

export default (str, depth=5) =>
  Object.entries(parser(str))
    .reduce((o, [k, v]) => {
      const l = k.indexOf('[')
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
      return o
    }, {})
