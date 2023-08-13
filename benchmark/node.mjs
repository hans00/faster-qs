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

await run()
