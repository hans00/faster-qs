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

```js
> node benchmark/index.mjs

cpu: 11th Gen Intel(R) Core(TM) i7-1165G7 @ 2.80GHz
runtime: node v18.14.0 (x64-linux)

benchmark                         time (avg)             (min … max)       p75       p99      p995
-------------------------------------------------------------------- -----------------------------
• simple
-------------------------------------------------------------------- -----------------------------
faster-qs                     221.62 ns/iter (212.21 ns … 327.51 ns) 220.76 ns 305.41 ns 325.99 ns
qs                              3.12 µs/iter     (3.01 µs … 4.08 µs)   3.08 µs   4.08 µs   4.08 µs
fast-querystring (no nested)  145.92 ns/iter  (135.8 ns … 661.87 ns) 146.52 ns 159.14 ns 170.95 ns

summary for simple
  faster-qs
   1.52x slower than fast-querystring (no nested)
   14.09x faster than qs

• array
-------------------------------------------------------------------- -----------------------------
faster-qs                     592.01 ns/iter    (564.85 ns … 1.1 µs) 581.35 ns    1.1 µs    1.1 µs
qs                              5.99 µs/iter     (5.54 µs … 7.43 µs)   6.28 µs   7.43 µs   7.43 µs
fast-querystring (no nested)  437.56 ns/iter (403.75 ns … 876.93 ns) 434.53 ns 851.04 ns 876.93 ns

summary for array
  faster-qs
   1.35x slower than fast-querystring (no nested)
   10.11x faster than qs

• deep object
-------------------------------------------------------------------- -----------------------------
faster-qs                       3.96 µs/iter    (3.37 µs … 559.3 µs)   3.71 µs   7.96 µs   9.08 µs
qs                             17.71 µs/iter  (15.21 µs … 574.35 µs)  16.21 µs  39.41 µs  55.77 µs
fast-querystring (no nested)    1.17 µs/iter     (1.12 µs … 1.45 µs)   1.17 µs   1.45 µs   1.45 µs

summary for deep object
  faster-qs
   3.39x slower than fast-querystring (no nested)
   4.47x faster than qs

```
