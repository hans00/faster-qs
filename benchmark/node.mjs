import { run, bench, group } from 'mitata'

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
