faster-qs
---

Fast query string parser with nested keys and most features of `qs`. Zero dependencies.

## Install

```sh
npm install faster-qs
```

## Usage

```js
import parse from 'faster-qs'

parse('a=1&b=2&c[]=3&c[]=4&d[a][b][c]=5')
// { a: '1', b: '2', c: ['3', '4'], d: { a: { b: { c: '5' } } } }

parse('user[name]=John+Doe&tags[0]=x&tags[1]=y&q=%E4%B8%AD%E6%96%87')
// { user: { name: 'John Doe' }, tags: ['x', 'y'], q: '中文' }

// Nesting is limited by `depth` (default 5); the remainder becomes a literal key
parse('a[b][c][d][e][f][g]=1')
// { a: { b: { c: { d: { e: { f: { '[g]': '1' } } } } } } }

// Explicit indices above `arrayLimit` (default 20) are stored as object keys
parse('a[21]=x')
// { a: { '21': 'x' } }
parse('a[21]=x', 5, Infinity)
// { a: [ <21 empty items>, 'x' ] }
```

```ts
parse(str: string, depth?: number, arrayLimit?: number): ParsedObject
```

TypeScript definitions are included.

### Behaviour

- Repeated keys become arrays (`a=1&a=2` → `{ a: ['1', '2'] }`); `a[]` appends, `a[2]` sets an index.
- An index larger than `arrayLimit` turns the container into a plain object, like `qs`. This keeps a crafted `a[4294967294]=1` from allocating a huge sparse array.
- `+` decodes to a space and `%XX` sequences decode as UTF-8. Malformed sequences are kept as-is instead of throwing.
- Keys named after `Object.prototype` properties (`__proto__`, `constructor`, `toString`, …) are dropped at every level, so the result can never pollute prototypes.
- Non-string input returns `{}`.

## Benchmark

```
> node benchmark/index.mjs

cpu: AMD RYZEN AI MAX+ 395 w/ Radeon 8060S
runtime: node v24.13.0 (x64-linux)

benchmark                         time (avg)             (min … max)       p75       p99      p999
-------------------------------------------------------------------- -----------------------------
• simple
-------------------------------------------------------------------- -----------------------------
faster-qs                      64.86 ns/iter      (60.3 ns … 270 ns)  63.18 ns  76.49 ns    122 ns
qs                             1'260 ns/iter   (1'251 ns … 1'441 ns)  1'258 ns  1'408 ns  1'441 ns
fast-querystring (no nested)   48.24 ns/iter     (43.44 ns … 106 ns)  46.81 ns   59.5 ns  80.87 ns

summary for simple
  faster-qs
   1.34x slower than fast-querystring (no nested)
   19.43x faster than qs

• array
-------------------------------------------------------------------- -----------------------------
faster-qs                        167 ns/iter       (157 ns … 348 ns)    172 ns    193 ns    316 ns
qs                             2'278 ns/iter   (2'254 ns … 2'458 ns)  2'276 ns  2'458 ns  2'458 ns
fast-querystring (no nested)     139 ns/iter       (128 ns … 296 ns)    145 ns    165 ns    222 ns

summary for array
  faster-qs
   1.2x slower than fast-querystring (no nested)
   13.61x faster than qs

• deep object
-------------------------------------------------------------------- -----------------------------
faster-qs                      1'237 ns/iter   (1'218 ns … 1'548 ns)  1'236 ns  1'339 ns  1'548 ns
qs                             6'460 ns/iter   (6'402 ns … 6'908 ns)  6'461 ns  6'859 ns  6'908 ns
fast-querystring (no nested)     416 ns/iter       (406 ns … 473 ns)    422 ns    448 ns    473 ns

summary for deep object
  faster-qs
   2.97x slower than fast-querystring (no nested)
   5.22x faster than qs

• indexed array
-------------------------------------------------------------------- -----------------------------
faster-qs                        774 ns/iter     (748 ns … 1'158 ns)    778 ns  1'022 ns  1'158 ns
qs                             4'426 ns/iter   (4'395 ns … 4'599 ns)  4'434 ns  4'548 ns  4'599 ns
fast-querystring (no nested)     336 ns/iter       (324 ns … 496 ns)    340 ns    363 ns    496 ns

summary for indexed array
  faster-qs
   2.3x slower than fast-querystring (no nested)
   5.72x faster than qs

• form
-------------------------------------------------------------------- -----------------------------
faster-qs                        822 ns/iter     (798 ns … 1'084 ns)    824 ns  1'017 ns  1'084 ns
qs                             4'087 ns/iter   (4'060 ns … 4'407 ns)  4'090 ns  4'379 ns  4'407 ns
fast-querystring (no nested)     470 ns/iter       (456 ns … 767 ns)    474 ns    537 ns    767 ns

summary for form
  faster-qs
   1.75x slower than fast-querystring (no nested)
   4.97x faster than qs

• typical url
-------------------------------------------------------------------- -----------------------------
faster-qs                        324 ns/iter       (310 ns … 501 ns)    329 ns    351 ns    501 ns
qs                             2'476 ns/iter   (2'445 ns … 2'916 ns)  2'477 ns  2'845 ns  2'916 ns
fast-querystring (no nested)     320 ns/iter       (313 ns … 553 ns)    320 ns    345 ns    553 ns

summary for typical url
  faster-qs
   1.01x slower than fast-querystring (no nested)
   7.65x faster than qs

• encoded
-------------------------------------------------------------------- -----------------------------
faster-qs                        557 ns/iter       (528 ns … 845 ns)    566 ns    620 ns    845 ns
qs                             1'747 ns/iter   (1'727 ns … 1'859 ns)  1'753 ns  1'844 ns  1'859 ns
fast-querystring (no nested)     654 ns/iter       (640 ns … 803 ns)    657 ns    732 ns    803 ns

summary for encoded
  faster-qs
   1.17x faster than fast-querystring (no nested)
   3.13x faster than qs
```

## License

MIT. The percent-decoder is derived from [fast-decode-uri-component](https://github.com/delvedor/fast-decode-uri-component)
and the pair scanner from [fast-querystring](https://github.com/anonrig/fast-querystring), both MIT.
