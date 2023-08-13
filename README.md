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
faster-qs         583.93 ns/iter   (533.32 ns … 1.22 µs) 568.81 ns   1.22 µs   1.22 µs
qs                  5.96 µs/iter   (5.25 µs … 294.51 µs)   5.61 µs  13.49 µs  16.99 µs
fast-querystring  408.39 ns/iter      (381.55 ns … 1 µs) 403.67 ns 600.15 ns      1 µs
node:querystring  450.88 ns/iter (425.73 ns … 604.37 ns) 456.71 ns 532.03 ns 604.37 ns

summary for basic
  faster-qs
   1.43x slower than fast-querystring
   1.3x slower than node:querystring
   10.2x faster than qs

• deep object
-------------------------------------------------------- -----------------------------
faster-qs           3.37 µs/iter     (3.26 µs … 3.89 µs)   3.34 µs   3.89 µs   3.89 µs
qs                 16.91 µs/iter   (15.2 µs … 274.57 µs)  16.08 µs  34.54 µs  51.02 µs
fast-querystring     1.2 µs/iter     (1.16 µs … 1.36 µs)    1.2 µs   1.36 µs   1.36 µs
node:querystring    1.63 µs/iter     (1.57 µs … 1.93 µs)   1.62 µs   1.93 µs   1.93 µs

summary for deep object
  faster-qs
   2.82x slower than fast-querystring
   2.07x slower than node:querystring
   5.01x faster than qs

```
