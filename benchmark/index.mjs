import { run, bench, group, baseline } from 'mitata'
import qs from 'qs'
import fq from 'fast-querystring'
import parse from '../index.mjs'

group('simple', () => {
  const payload = 'a&a&c&c'
  
  baseline('faster-qs', () => parse(payload))

  bench('qs', () => qs.parse(payload))
  bench('fast-querystring (no nested)', () => fq.parse(payload))
})

group('array', () => {
  const payload = 'a&a&c&c&b[]&b[]&b[]'
  
  baseline('faster-qs', () => parse(payload))

  bench('qs', () => qs.parse(payload))
  bench('fast-querystring (no nested)', () => fq.parse(payload))
})

group('deep object', () => {
  const payload = 'a[a]&a[a][b]&a[a][b][c]&a[a][b][c][d]&a[a][b][c][d]&a[a][b][c][d]&a[b]&a[b][c]&a[b][c][d]&a[b][c]'
  
  baseline('faster-qs', () => parse(payload))

  bench('qs', () => qs.parse(payload))
  bench('fast-querystring (no nested)', () => fq.parse(payload))
})

await run()
