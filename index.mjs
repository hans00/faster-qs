import { parse as parser } from 'fast-querystring'

const isPosInt = (str) => {
  const n = Number(str)
  return n !== Infinity && Number.isInteger(n) && n >= 0
}

const resolvePath = (o, path, v=null, d) => {
  if (d === 0) return { [path]: v }
  if (!path) return o ? [].concat(o, v) : v
  const l = path.indexOf('[')
  const r = path.indexOf(']')
  if (l === -1 || r === -1 || l > r) return { [path]: v }
  const k = path.slice(l + 1, r) || (o?.length ?? '0')
  const next = path.slice(r + 1)
  if (isPosInt(k)) {
    let i = Number(k)
    if (o && typeof o === 'object' && !Array.isArray(o)) {
      if (!i) i = Object.keys(o).length
      return {
        ...o,
        [i]: resolvePath(o[i], next, v, d - 1, opt),
      }
    }
    if (i > 0) {
      if (!o) o = []
      for (let len = o.length; len <= i; len += 1) {
        o.push()
      }
    } else if (!o) {
      o = []
    }
    o[i] = resolvePath(o[i], next, v, d - 1)
    return o
  } else if (!{}[k]) {
    return {
      ...o,
      [k]: resolvePath(o?.[k], next, v, d - 1),
    }
  } else {
    return null
  }
}

export default (str, depth=5) =>
  Object.entries(parser(str))
    .reduce((o, [k, v]) => {
      const l = k.indexOf('[')
      const r = k.indexOf(']')
      if (l > 0 && r > l) {
        const key = k.slice(0, l)
        const path = k.slice(l)
        if (path === '[]') {
          if (o[key]) o[key] = [].concat(o[key], v)
          else o[key] = v
        } else {
          o[key] = resolvePath(o[key], path, v, depth)
        }
      } else o[k] = v
      return o
    }, {})
