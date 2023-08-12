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

Run on node v18.14.0

```sh
> node bench.mjs

┌─────────┬────────────────────┬───────────┬────────────────────┬──────────┬─────────┐
│ (index) │     Task Name      │  ops/sec  │ Average Time (ns)  │  Margin  │ Samples │
├─────────┼────────────────────┼───────────┼────────────────────┼──────────┼─────────┤
│    0    │    'faster-qs'     │ '154,044' │  6491.63782516881  │ '±0.52%' │  77023  │
│    1    │        'qs'        │ '28,744'  │ 34789.24597610986  │ '±0.86%' │  14373  │
│    2    │ 'fast-querystring' │ '330,342' │ 3027.1599327571294 │ '±0.34%' │ 165172  │
│    3    │ 'node:querystring' │ '235,583' │ 4244.776919820133  │ '±0.40%' │ 117792  │
└─────────┴────────────────────┴───────────┴────────────────────┴──────────┴─────────┘
```
