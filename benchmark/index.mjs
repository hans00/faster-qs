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

group('indexed array', () => {
  const payload = 'items[0][id]=1&items[0][qty]=2&items[1][id]=3&items[1][qty]=4&items[2][id]=5&items[2][qty]=6'

  baseline('faster-qs', () => parse(payload))

  bench('qs', () => qs.parse(payload))
  bench('fast-querystring (no nested)', () => fq.parse(payload))
})

group('form', () => {
  const payload = 'user[name]=John+Doe&user[email]=john%40example.com&user[tags][]=a&user[tags][]=b&page=2&sort=-created_at&filter[status]=active'

  baseline('faster-qs', () => parse(payload))

  bench('qs', () => qs.parse(payload))
  bench('fast-querystring (no nested)', () => fq.parse(payload))
})

group('typical url', () => {
  const payload = 'page=2&limit=50&sort=-created_at&status=active&search=hello+world&utm_source=newsletter'

  baseline('faster-qs', () => parse(payload))

  bench('qs', () => qs.parse(payload))
  bench('fast-querystring (no nested)', () => fq.parse(payload))
})

group('encoded', () => {
  const payload = 'q=%E4%B8%AD%E6%96%87%20%E6%B8%AC%E8%A9%A6&lang=zh-TW&emoji=%F0%9F%98%80&redirect=https%3A%2F%2Fexample.com%2Fpath%3Fa%3D1'

  baseline('faster-qs', () => parse(payload))

  bench('qs', () => qs.parse(payload))
  bench('fast-querystring (no nested)', () => fq.parse(payload))
})

await run()
