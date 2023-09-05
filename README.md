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
faster-qs                     215.12 ns/iter  (190.79 ns … 326.6 ns) 231.31 ns 314.23 ns 325.66 ns
qs                              3.76 µs/iter      (3.53 µs … 4.2 µs)   3.85 µs    4.2 µs    4.2 µs
fast-querystring (no nested)  156.86 ns/iter (134.91 ns … 696.73 ns) 164.41 ns 292.89 ns 321.29 ns

summary for simple
  faster-qs
   1.37x slower than fast-querystring (no nested)
   17.48x faster than qs

• array
-------------------------------------------------------------------- -----------------------------
faster-qs                     606.92 ns/iter (548.09 ns … 844.72 ns) 657.29 ns 844.72 ns 844.72 ns
qs                              6.76 µs/iter     (6.55 µs … 7.19 µs)   6.88 µs   7.19 µs   7.19 µs
fast-querystring (no nested)  477.43 ns/iter (416.57 ns … 605.23 ns) 523.46 ns 582.79 ns 605.23 ns

summary for array
  faster-qs
   1.27x slower than fast-querystring (no nested)
   11.13x faster than qs

• deep object
-------------------------------------------------------------------- -----------------------------
faster-qs                       3.84 µs/iter   (3.19 µs … 439.42 µs)   3.56 µs    7.8 µs   9.47 µs
qs                             19.48 µs/iter     (16.84 µs … 345 µs)     18 µs  36.89 µs  62.15 µs
fast-querystring (no nested)    1.25 µs/iter     (1.12 µs … 1.68 µs)   1.31 µs   1.68 µs   1.68 µs

summary for deep object
  faster-qs
   3.07x slower than fast-querystring (no nested)
   5.07x faster than qs

```
