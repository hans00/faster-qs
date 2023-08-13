faster-qs
---

Fast query string parser and has most features of `qs`

## Install

```sh
npm install faster-qs
```

## Usage

```js
const qs = require('faster-qs');
const str = 'a=1&b=2&c[]=3&c[]=4&d[a][b][c]=5';
console.log(qs.parse(str));
// { a: '1', b: '2', c: ['3', '4'], d: { a: { b: { c: '5' } } } }
```

## Benchmark

```sh
> node benchmark/index.mjs

cpu: 11th Gen Intel(R) Core(TM) i7-1165G7 @ 2.80GHz
runtime: node v18.14.0 (x64-linux)

benchmark             time (avg)             (min … max)       p75       p99      p995
-------------------------------------------------------- -----------------------------
faster-qs            6.1 µs/iter   (5.53 µs … 432.77 µs)   5.81 µs  12.17 µs  14.35 µs
qs                 36.64 µs/iter    (31.87 µs … 1.12 ms)  33.45 µs  84.47 µs 108.88 µs
fast-querystring    3.27 µs/iter     (2.87 µs … 5.95 µs)   3.28 µs   5.95 µs   5.95 µs
node:querystring    4.26 µs/iter   (3.74 µs … 369.83 µs)   4.05 µs    7.9 µs   9.06 µs

summary
  faster-qs
   1.87x slower than fast-querystring
   1.43x slower than node:querystring
   6x faster than qs
```
