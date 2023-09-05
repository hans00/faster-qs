import { run, bench, group } from 'mitata'

group('String parse', () => {
  const payload = 'a&b&c'
  const regex = /&/g

    const findCharCode = (str, code) => {
        const out = []
        for(let i=0, c=0; i < str.length; ++i) {
            c = payload.charCodeAt(i)
            if (c == code) {
                out.push(i)
            }
        }
        return out
    }
    const findFirstCharCode = (str, code, start=0) => {
        for(let i=start; i < str.length; ++i) {
            if (payload.charCodeAt(i) == code) {
                return i
            }
        }
        return -1
    }

    bench('indexOf', () => {
        const out = []
        for (let st = 0;;) {
            const ind = payload.indexOf('&', st)
            if (ind < 0) {
                out.push(payload.substring(st, payload.length))
                break
            } else {
                out.push(payload.substring(st, ind))
                st = ind + 1
            }
        }
    })
    bench('find char & skip index', () => {
        const out = []
        for (let i = 0, c = 0, start = 0; i < payload.length; ++i) {
            const ind = findFirstCharCode(payload, '&', i)
            if (ind < 0) {
                out.push(payload.substring(start, i))
                break
            } else {
                out.push(payload.substring(start, ind))
                start = ind + 1
                i = ind
            }
        }
    })
    bench('RegExp', () => payload.split(regex))
    bench('string loop - each char', () => {
        const out = []
        for(let i=0, buf='', c=0; i < payload.length; ++i) {
            c = payload.charCodeAt(i)
            if (c == 38) {
                out.push(buf)
            } else {
                buf += payload[i]
            }
        }
    })
    bench('string loop - skip index', () => {
        const out = []
        for (let i=0, prev=0, c=0; i < payload.length; ++i) {
            c = payload.charCodeAt(i)
            if (c == 38) {
                out.push(payload.substring(prev, i))
                prev = i + 1
            }
        }
    })
    bench('split', () => payload.split('&'))
    bench('find - index array', () => findCharCode(payload, 38))
    bench('find - map slice', () => {
        const v = findCharCode(payload, 38)
        v.map((pos, i) => payload.slice(v[i-1]||0, pos) )
    })
    bench('find - while', () => {
        const out = []
        let i = 0
        let st = 0
        while ((i = findFirstCharCode(payload, 38, st)) != -1) {
            out.push(payload.substring(st, i))
            st = i + 1
        }
    })
})

group('Object', () => {
  bench('Object.assign', () => Object.assign({}, { a: 1 }))
  bench('object spread', () => ({ ...{ a: 1 } }))
})

group('Array', () => {
  bench('Array.concat', () => [].concat([1]))
  bench('array spread', () => [...[1]])
  bench('Array.push.apply', () => { const a = []; a.push.apply(a, [1]) })
})

group('Array extend', () => {
  bench('Array.push.apply', () => { const a = []; a.push.apply(a, [1]) })
  bench('Array.push spread', () => { const a = []; a.push(...[1]) })
})

group('isArray', () => {
  const val = 0
  bench('isArray', () => Array.isArray(val))
  bench('constructor', () => val?.constructor === Array)
  bench('instanceof', () => val instanceof Array)
  bench('typeof', () => typeof val === 'object' && val.constructor === Array)
})

group('recursive vs iterative', () => {
  bench('recursive', () => {
    function factorial(n) {
      if (n === 0) return 1
      else return n * factorial(n - 1)
    }
    factorial(100)
  })
  bench('iterative', () => {
    function factorial(n) {
      let result = 1
      for (let i = 2; i <= n; i++) {
        result *= i
      }
      return result
    }
    factorial(100)
  })
})

group('reduce vs loop', () => {
  bench('reduce', () => {
    const arr = [1, 2, 3, 4, 5]
    arr.reduce((a, b) => a + b)
  })
  bench('loop', () => {
    const arr = [1, 2, 3, 4, 5]
    let sum = 0
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i]
    }
  })
})

group('loop keys vs entries', () => {
  bench('loop keys', () => {
    const obj = { a: 1, b: 2, c: 3 }
    for (const k in obj) obj[k];
  })
  bench('entries', () => {
    const obj = { a: 1, b: 2, c: 3 }
    Object.entries(obj).forEach(([k, v]) => {})
  })
})

group('includes vs indexOf', () => {
  bench('includes', () => [1, 2, 3].includes(3))
  bench('indexOf', () => [1, 2, 3].indexOf(3) !== -1)
})

group('Set vs Array', () => {
  const set = new Set([1, 2, 3])
  const arr = [1, 2, 3]
  bench('Set', () => set.has(3))
  bench('Array', () => arr.includes(3))
})

group('Key exists', () => {
  const obj = {}
  bench('get', () => obj['a'])
  bench('in', () => 'a' in obj)
  bench('hasOwnProperty', () => obj.hasOwnProperty('a'))
})

await run()
