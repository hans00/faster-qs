import { Bench } from 'tinybench'
import qs from 'qs'
import nqs from 'node:querystring'
import fq from 'fast-querystring'
import parse from './index.mjs'

const payload = 'a&a&a&a&a&a&a&a&a&a&a&a&b[]&b[]&b[]&b[]&b[]&b[]&b[]&b[]&b[]&b[]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&d[a][b][c][d][e][f]=1&d[a][b][c][d][e][f]=1&d[a][b][c][d][e][f]=1&d[a][b][c][d][e][f]=1&d[a][b][c][d][e][f]=1&d[a][b][c][d][e][f]=1'

const bench = new Bench({ time: 500 })

bench
  .add('faster-qs', () => parse(payload, { throwError: false }))
  .add('qs', () => qs.parse(payload))
  .add('fast-querystring', () => fq.parse(payload))
  .add('node:querystring', () => nqs.parse(payload))

await bench.run()

console.table(bench.table())