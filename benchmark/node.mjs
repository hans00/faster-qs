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

group('typecheck', () => {
  bench('typeof', () => typeof 1 === 'number')
  bench('isArray', () => Array.isArray(1))
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

await run()
