import { run, bench, group, baseline } from 'mitata'
import qs from 'qs'
import nqs from 'node:querystring'
import fq from 'fast-querystring'
import parse from '../index.mjs'

group('basic', () => {
  const payload = 'a&a&c&c&b[]&b[]&b[]'
  
  baseline('faster-qs', () => parse(payload))

  bench('qs', () => qs.parse(payload))
  bench('fast-querystring', () => fq.parse(payload))
  bench('node:querystring', () => nqs.parse(payload))
})

group('deep object', () => {
  const payload = 'a[a]&a[a][b]&a[a][b][c]&a[a][b][c][d]&a[a][b][c][d]&a[a][b][c][d]&a[b]&a[b][c]&a[b][c][d]&a[b][c]'
  
  baseline('faster-qs', () => parse(payload))

  bench('qs', () => qs.parse(payload))
  bench('fast-querystring', () => fq.parse(payload))
  bench('node:querystring', () => nqs.parse(payload))
})

await run()
