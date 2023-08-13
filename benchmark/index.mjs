import { run, bench, baseline } from 'mitata'
import qs from 'qs'
import nqs from 'node:querystring'
import fq from 'fast-querystring'
import parse from '../index.mjs'

const payload = 'a&a&a&a&a&a&a&a&a&a&a&a&b[]&b[]&b[]&b[]&b[]&b[]&b[]&b[]&b[]&b[]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&c[a]&d[a][b][c][d][e][f]=1&d[a][b][c][d][e][f]=1&d[a][b][c][d][e][f]=1&d[a][b][c][d][e][f]=1&d[a][b][c][d][e][f]=1&d[a][b][c][d][e][f]=1'

baseline('faster-qs', () => parse(payload))

bench('qs', () => qs.parse(payload))
bench('fast-querystring', () => fq.parse(payload))
bench('node:querystring', () => nqs.parse(payload))

await run()
