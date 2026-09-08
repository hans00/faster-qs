/*!
 * faster-qs — zero-dependency query string parser with nested keys.
 * Copyright (c) 2023 Hans. MIT License.
 *
 * Contains code derived from:
 *   fast-querystring        — Copyright (c) 2022 Yagiz Nizipli (MIT)
 *   fast-decode-uri-component — Copyright (c) 2018 Tomas Della Vedova,
 *                             Copyright (c) 2017 Justin Ridgewell,
 *                             Copyright (c) 2008-2009 Bjoern Hoehrmann (MIT)
 */

const BAD_KEYS = new Set(Object.getOwnPropertyNames(Object.prototype))
// First characters of the names above, so ordinary keys skip the Set lookup.
const BAD_FIRST = new Uint8Array(128)
for (const name of BAD_KEYS) BAD_FIRST[name.charCodeAt(0)] = 1
const isBadKey = (str) => {
  const c = str.charCodeAt(0)
  return c < 128 && BAD_FIRST[c] === 1 && BAD_KEYS.has(str)
}

const sameStart = (a, b, n) => {
  for (let i = 0; i < n; i++) if (a.charCodeAt(i) !== b.charCodeAt(i)) return false
  return true
}

const indexOfChar = (str, code, from) => {
  for (let i = from; i < str.length; i++) if (str.charCodeAt(i) === code) return i
  return -1
}

// char codes
const PCT = 37 // %
const AMP = 38 // &
const PLUS = 43 // +
const EQ = 61 // =
const LB = 91 // [
const RB = 93 // ]

const replacePlus = (str) => {
  let out = ''
  let last = 0
  let i = str.indexOf('+')
  while (i !== -1) {
    out += str.slice(last, i) + ' '
    last = i + 1
    i = str.indexOf('+', last)
  }
  return out + str.slice(last)
}

// `new Empty()` is cheaper than `Object.create(null)` in V8.
function Empty () {}
Empty.prototype = Object.create(null)

// ---------------------------------------------------------------------------
// Percent decoding (UTF-8 DFA by Bjoern Hoehrmann, via fast-decode-uri-component)
// ---------------------------------------------------------------------------

const UTF8_ACCEPT = 12
const UTF8_REJECT = 0
const UTF8_DATA = new Uint8Array([
  // byte -> character class
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
  2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3,
  4, 4, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5,
  6, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 8, 7, 7,
  10, 9, 9, 9, 11, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4,
  // (state + class) -> next state
  0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  12, 0, 0, 0, 0, 24, 36, 48, 60, 72, 84, 96,
  0, 12, 12, 12, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 0, 24, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 24, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 24, 24, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 48, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 0, 48, 48, 0, 0, 0, 0, 0, 0, 0, 0,
  0, 48, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  // class -> payload mask
  0x7F, 0x3F, 0x3F, 0x3F, 0x00, 0x1F, 0x0F, 0x0F, 0x0F, 0x07, 0x07, 0x07
])

const hexValue = (c) => {
  if (c >= 48 && c <= 57) return c - 48 // 0-9
  c |= 32
  if (c >= 97 && c <= 102) return c - 87 // a-f / A-F
  return -1
}

/**
 * Decode `%XX` sequences as UTF-8.
 * Returns `null` when the input is not valid percent-encoded UTF-8.
 */
const decodePercent = (str) => {
  let pos = str.indexOf('%')
  if (pos === -1) return str
  const len = str.length
  let out = ''
  let last = 0
  let cp = 0
  let start = pos
  let state = UTF8_ACCEPT
  while (pos > -1 && pos < len) {
    const hi = hexValue(str.charCodeAt(pos + 1))
    const lo = hexValue(str.charCodeAt(pos + 2))
    if (hi < 0 || lo < 0) return null
    const byte = (hi << 4) | lo
    const type = UTF8_DATA[byte]
    state = UTF8_DATA[256 + state + type]
    cp = (cp << 6) | (byte & UTF8_DATA[364 + type])
    if (state === UTF8_ACCEPT) {
      out += str.slice(last, start)
      out += cp <= 0xFFFF
        ? String.fromCharCode(cp)
        : String.fromCharCode(0xD7C0 + (cp >> 10), 0xDC00 + (cp & 0x3FF))
      cp = 0
      last = pos + 3
      pos = start = str.indexOf('%', last)
    } else if (state === UTF8_REJECT) {
      return null
    } else {
      pos += 3
      if (pos < len && str.charCodeAt(pos) === PCT) continue
      return null
    }
  }
  return out + str.slice(last)
}

// ---------------------------------------------------------------------------
// Nested key resolution
// ---------------------------------------------------------------------------

const parseIndexSlow = (str) => {
  const n = Number(str)
  return Number.isInteger(n) && n >= 0 ? n : -1
}

/**
 * Classify the segment `str[s, e)` without slicing it:
 *   >= 0  a plain decimal index (no leading zero, at most 15 digits) — its value
 *   -1    not numeric
 *   -2    may be numeric under `Number()` rules (leading zero, exponent, sign,
 *         whitespace, ...); slice it and use `parseIndexSlow`
 */
const parseIndexAt = (str, s, e) => {
  const c = str.charCodeAt(s)
  if (c >= 48 && c <= 57) {
    if (e - s > 15 || (c === 48 && e - s > 1)) return -2
    let n = c - 48
    for (let i = s + 1; i < e; i++) {
      const d = str.charCodeAt(i)
      if (d < 48 || d > 57) return -2
      n = n * 10 + (d - 48)
    }
    return n
  }
  // Number() can still yield a non-negative integer for strings starting with
  // whitespace, '+', '-' ('-0') or '.' ('.0'); anything else is NaN or non-integer.
  if (c === PLUS || c === 45 || c === 46 || c <= 32 || c >= 0xA0 || c !== c) return -2
  return -1
}

/**
 * Walk the bracket path of `key` (starting at `l`, the first `[`; `r` is the
 * first `]` after it) and store `v` at the end of it, inside `root`.
 * Numeric segments up to `limit` are array indices; larger ones become
 * plain object keys (and turn an existing array into an object).
 * Returns the (possibly newly created) root container.
 */
const resolvePath = (root, key, l, r, v, d, limit) => {
  const end = key.length
  const vIsArray = Array.isArray(v)
  let cur = root
  let curIsArray = Array.isArray(cur)
  let parent = null // container that holds `cur`; null while `cur` is the root
  let pk // key of `cur` inside `parent`
  let p = l // start of the unconsumed remainder of `key`
  // current segment: `empty` for `[]`; otherwise `idx` (its numeric value, or -1)
  // and `seg` (its string, sliced lazily: stays null for a plain decimal index)
  let empty = r === l + 1
  let seg = null
  let idx = -1
  if (!empty) {
    idx = parseIndexAt(key, l + 1, r)
    if (idx === -2) {
      seg = key.slice(l + 1, r)
      idx = parseIndexSlow(seg)
    } else if (idx === -1) {
      seg = key.slice(l + 1, r)
    }
  }
  let segIsIndex = empty || (idx >= 0 && idx <= limit)
  let k
  while (d > 0) {
    p = r + 1
    if (segIsIndex) {
      if (!cur) { // undefined or ''
        cur = []
        curIsArray = true
        if (parent === null) root = cur
        else parent[pk] = cur
      } else if (typeof cur === 'string') {
        break // a scalar is already stored here; keep it
      }
      if (curIsArray) k = empty ? cur.length : idx
      else k = empty ? Object.keys(cur).length : seg === null ? idx : seg
    } else if (idx >= 0) { // numeric index above `limit`: use a plain object instead of a sparse array
      k = seg === null ? idx : seg
      if (!cur) {
        cur = {}
        if (parent === null) root = cur
        else parent[pk] = cur
      } else if (typeof cur === 'string') {
        break
      } else if (curIsArray) {
        cur = { ...cur }
        curIsArray = false
        if (parent === null) root = cur
        else parent[pk] = cur
      }
    } else if (!isBadKey(seg)) {
      k = seg
      if (!cur) {
        cur = {}
        if (parent === null) root = cur
        else parent[pk] = cur
      } else if (curIsArray || typeof cur === 'string') {
        break
      }
    } else {
      break
    }
    // last segment: store the value
    if (p === end) {
      if (curIsArray && vIsArray) {
        if (empty) cur.push.apply(cur, v)
        else cur.splice(k, 0, v)
      } else {
        cur[k] = v
      }
      return root
    }
    // locate the next segment
    l = indexOfChar(key, LB, p)
    if (l === -1) break
    r = key.charCodeAt(l + 1) === RB ? l + 1 : indexOfChar(key, RB, p)
    if (r === -1 || l > r) break
    empty = r === l + 1
    seg = null
    idx = -1
    if (!empty) {
      idx = parseIndexAt(key, l + 1, r)
      if (idx === -2) {
        seg = key.slice(l + 1, r)
        idx = parseIndexSlow(seg)
      } else if (idx === -1) {
        seg = key.slice(l + 1, r)
      }
    }
    segIsIndex = empty || (idx >= 0 && idx <= limit)
    // descend
    parent = cur
    pk = k
    let next = cur[k]
    if (segIsIndex) {
      if (next == null) cur[k] = next = []
    } else if (next == null) {
      cur[k] = next = {}
    } else if (Array.isArray(next)) {
      cur[k] = next = { ...next }
    }
    cur = next
    curIsArray = Array.isArray(cur)
    d--
  }
  // depth exhausted or malformed remainder: keep the rest as a literal key
  if (p < end) {
    const rest = key.slice(p)
    if (!isBadKey(rest)) {
      if (curIsArray) cur.push({ [rest]: v })
      else if (typeof cur === 'object') cur[rest] = v
    }
  }
  return root
}

// ---------------------------------------------------------------------------
// Parser
// ---------------------------------------------------------------------------

/**
 * Split `input` into decoded key/value pairs and store them in `target`,
 * grouping duplicate keys into arrays.
 * In `flat` mode `target` is the plain result object: keys named after
 * `Object.prototype` properties are dropped, and the function gives up
 * (returns false) as soon as a key turns out to contain an encoded bracket.
 */
const parseFlat = (input, target) => {
  const len = input.length
  let start = -1 // index of the `&` that opened the current pair
  let eq = -1 // index of `=` in the current pair; equals `start` while none seen
  let flags = 0 // 1: key has '+', 2: key has '%', 4: value has '+', 8: value has '%'

  for (let i = 0; i <= len; i++) {
    const c = i !== len ? input.charCodeAt(i) : AMP
    if (c > EQ || c < PCT) continue // letters, brackets, most punctuation: nothing to do
    if (c === AMP) {
      const hasValue = eq > start
      if (!hasValue) eq = i
      if (hasValue || eq - start > 1) {
        let key = input.slice(start + 1, eq)
        if (flags & 1) key = replacePlus(key)
        if (flags & 2) {
          const decoded = decodePercent(key)
          if (decoded !== null) {
            key = decoded
          }
        }
        let value = ''
        if (hasValue) {
          value = input.slice(eq + 1, i)
          if (flags & 4) value = replacePlus(value)
          if (flags & 8) {
            const decoded = decodePercent(value)
            if (decoded !== null) value = decoded
          }
        }
        if (!isBadKey(key)) {
          const prev = target[key]
          if (prev === undefined) {
            target[key] = value
          } else if (Array.isArray(prev)) {
            prev.push(value)
          } else {
            target[key] = [prev, value]
          }
        }
      }
      start = eq = i
      flags = 0
    } else if (c === EQ) {
      if (eq <= start) eq = i
    } else if (c === PLUS) {
      flags |= eq > start ? 4 : 1
    } else if (c === PCT) {
      if (eq > start) {
        flags |= 8
      } else {
        flags |= 2
        // `%5B` / `%5b` decodes to `[`: this key is nested after all
        if (input.charCodeAt(i + 1) === 53 && (input.charCodeAt(i + 2) | 32) === 98) return false
      }
    }
  }

  return true
}

/**
 * Like parseFlat, but groups pairs into a null-prototype map, without filtering
 * or bailing out. Kept as a separate copy on purpose: one function serving both
 * target kinds measured 10-20% slower on flat inputs.
 */
const parseGrouped = (input, target) => {
  const len = input.length
  let start = -1 // index of the `&` that opened the current pair
  let eq = -1 // index of `=` in the current pair; equals `start` while none seen
  let flags = 0 // 1: key has '+', 2: key has '%', 4: value has '+', 8: value has '%'

  for (let i = 0; i <= len; i++) {
    const c = i !== len ? input.charCodeAt(i) : AMP
    if (c > EQ || c < PCT) continue // letters, brackets, most punctuation: nothing to do
    if (c === AMP) {
      const hasValue = eq > start
      if (!hasValue) eq = i
      if (hasValue || eq - start > 1) {
        let key = input.slice(start + 1, eq)
        if (flags & 1) key = replacePlus(key)
        if (flags & 2) {
          const decoded = decodePercent(key)
          if (decoded !== null) {
            key = decoded
          }
        }
        let value = ''
        if (hasValue) {
          value = input.slice(eq + 1, i)
          if (flags & 4) value = replacePlus(value)
          if (flags & 8) {
            const decoded = decodePercent(value)
            if (decoded !== null) value = decoded
          }
        }
        const prev = target[key]
        if (prev === undefined) {
          target[key] = value
        } else if (Array.isArray(prev)) {
          prev.push(value)
        } else {
          target[key] = [prev, value]
        }
      }
      start = eq = i
      flags = 0
    } else if (c === EQ) {
      if (eq <= start) eq = i
    } else if (c === PLUS) {
      flags |= eq > start ? 4 : 1
    } else if (c === PCT) {
      if (eq > start) {
        flags |= 8
      } else {
        flags |= 2
      }
    }
  }
}

/**
 * Parse a query string into a nested object.
 * @param {string} input
 * @param {number} [depth=5] maximum bracket nesting depth
 * @param {number} [arrayLimit=20] largest explicit array index; bigger ones become object keys
 */
export default (input, depth = 5, arrayLimit = 20) => {
  let result = {}
  if (typeof input !== 'string') return result

  // No raw `[` anywhere: every key is flat unless one hides an encoded bracket,
  // so fill the result directly and skip the second pass. If an encoded
  // bracket does show up, start over with the full two-pass parse.
  if (input.indexOf('[') === -1) {
    if (parseFlat(input, result)) return result
    result = {}
  }

  // Pass 1: group pairs by decoded key in a null-prototype map.
  const map = new Empty()
  parseGrouped(input, map)
  // Pass 2: resolve bracket paths (for-in order: integer-like keys first, then insertion order).
  // Consecutive keys usually share a top-level name (`a[x]`, `a[y]`, ...): remember
  // the name and its container so neither the slice nor the result lookup repeats.
  let prevName = ''
  let prevL = 0
  let root
  for (const key in map) {
    const v = map[key]
    const l = indexOfChar(key, LB, 0)
    if (l > 0) {
      const r = indexOfChar(key, RB, l + 1)
      if (r !== -1) {
        let name
        if (l === prevL && sameStart(key, prevName, l)) {
          name = prevName
        } else {
          name = key.slice(0, l)
          if (isBadKey(name)) continue
          prevName = name
          prevL = l
          root = result[name]
        }
        const prev = root
        if (r === l + 1 && r === key.length - 1) { // `name[]`: 1-d array fast path
          if (prev === undefined) {
            root = v
          } else if (typeof prev === 'string') {
            root = [prev].concat(v)
          } else if (Array.isArray(prev)) {
            root = prev.concat(v)
          } else {
            prev[Object.keys(prev).length] = v
          }
        } else {
          root = resolvePath(prev, key, l, r, v, depth, arrayLimit)
        }
        if (root !== prev || prev === undefined) result[name] = root
        continue
      }
    }
    if (!isBadKey(key)) {
      result[key] = v
      if (key === prevName) root = v // keep the cache in sync with the flat write
    }
  }
  return result
}
