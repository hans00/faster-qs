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

```md
> node benchmark/index.mjs

cpu: 11th Gen Intel(R) Core(TM) i7-1165G7 @ 2.80GHz
runtime: node v18.14.0 (x64-linux)

benchmark             time (avg)             (min … max)       p75       p99      p995
-------------------------------------------------------- -----------------------------
• basic
-------------------------------------------------------- -----------------------------
faster-qs         603.21 ns/iter   (547.73 ns … 1.14 µs) 607.07 ns   1.14 µs   1.14 µs
qs                  6.72 µs/iter   (5.28 µs … 440.78 µs)   5.86 µs  16.99 µs  25.17 µs
fast-querystring  490.43 ns/iter   (393.92 ns … 1.02 µs) 455.21 ns 974.32 ns   1.02 µs
node:querystring  479.66 ns/iter (426.49 ns … 897.91 ns) 477.84 ns 814.14 ns 897.91 ns

summary for basic
  faster-qs
   1.26x slower than node:querystring
   1.23x slower than fast-querystring
   11.14x faster than qs

• deep object
-------------------------------------------------------- -----------------------------
faster-qs           4.46 µs/iter      (4.29 µs … 4.9 µs)   4.55 µs    4.9 µs    4.9 µs
qs                 17.48 µs/iter  (15.15 µs … 803.78 µs)  16.15 µs  33.99 µs  43.18 µs
fast-querystring    1.21 µs/iter     (1.14 µs … 1.48 µs)   1.22 µs   1.48 µs   1.48 µs
node:querystring    1.65 µs/iter     (1.54 µs … 2.05 µs)   1.65 µs   2.05 µs   2.05 µs

summary for deep object
  faster-qs
   3.7x slower than fast-querystring
   2.71x slower than node:querystring
   3.92x faster than qs

```
