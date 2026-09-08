import { expect as chaiExpect } from 'chai'
import parse from '../index.mjs'

const expect = (payload, target, depth, arrayLimit) =>
  chaiExpect(parse(payload, depth, arrayLimit)).to.be.deep.equal(target)

const OBJECT_PROTOTYPE_NAMES = Object.getOwnPropertyNames(Object.prototype)

describe('parse', () => {
  it('array', () => {
    expect('a[]&a[]&a[]&a[]&a[]&a[]', {
      a: ['', '', '', '', '', ''],
    })
    expect('a&a&a&a[]&a[]&a[]', {
      a: ['', '', '', '', '', ''],
    })
  })

  it('nested array', () => {
    expect('a[][][]&a[][][]&a[][][]&a[][]&a[][]&a[]', {
      a: [[['', '', '']], ['', ''], ''],
    })
  })

  it('array with index', () => {
    expect('a[3]=3&a[5]=5&a[2]=2&a[4]=4&a[1]=1&a[0]=0&a[10]=10', {
      a: ['0', '1', '2', '3', '4', '5', undefined, undefined, undefined, undefined, '10'],
    })
  })

  it('object', () => {
    expect('a[a]&a[b]&a[c]', {
      a: { a: '', b: '', c: '' },
    })
  })

  it('nested object', () => {
    expect('a[a][a]&a[a][b]&a[a][c]', {
      a: { a: { a: '', b: '', c: '' } },
    })
  })

  it('complex case', () => {
    expect('a[]&a[]&a[1]&a[1]&a[]&a[]&a[]&a[]', {
      a: ['', ['', ''], '', '', '', '', ''],
    })
    expect('a[a]&a[a]&a[1][]&a[1][]&a[]&a[]&a[]&a[]', {
      a: { a: ['', ''], 1: ['', ''], 2: ['', '', '', ''] },
    })
    expect('a[a][][a][a]&a[a][a]&a[a][]', {
      a: { a: { 0: { a: { a: '' } }, a: '', 2: '' } },
    })
    expect('a[a][][a][a]&a[a][a]&a[a][][b]', {
      a: { a: { 0: { a: { a: '' } }, a: '', 2:{ b: '' } } },
    })
    expect('a[a][a][][b]&a[a][a][][]&a[a][a][][][c]', {
      a: { a: { a: [ { b: '' }, [ '' ], [ { c: '' } ] ] } },
    })
    expect('a=1&a[a]=1', {
      a: '1',
    })
  })

  it('drop insecure key', () => {
    expect('a[constructor][prototype][a]=1', {
      a: undefined,
    })
    expect('a[a][toString]=1', {
      a: { a: {} },
    })
    expect('a[][__proto__]=1', {
      a: [{}],
    })
    expect('a[]=1&a[length]=1e100&a[]=2', {
      a: ['1', '2'],
    })
    expect('a[b]toString=1', {
      a: {},
    })
    expect('a[constructor][prototype][a]=1&a[]=2', {
      a: '2',
    })
  })

  it('plain pairs', () => {
    expect('a=1&b=2', { a: '1', b: '2' })
    expect('a=1&a=2&a=3', { a: ['1', '2', '3'] })
    expect('a', { a: '' })
    expect('a=', { a: '' })
    expect('=1', { '': '1' })
    expect('a&&&b', { a: '', b: '' })
    expect('a=1=2', { a: '1=2' })
    expect('a==', { a: '=' })
    expect('&', {})
    expect('', {})
  })

  it('non-string input', () => {
    expect(123, {})
    expect(null, {})
    expect(undefined, {})
    expect({}, {})
  })

  it('decodes percent-encoding and plus', () => {
    expect('a+b=c+d', { 'a b': 'c d' })
    expect('a=%E4%B8%AD%E6%96%87', { a: '中文' })
    expect('a=%F0%9F%98%80', { a: '😀' })
    expect('a=%2B', { a: '+' })
    expect('a%5B%5D=1&a%5B%5D=2', { a: ['1', '2'] })
    expect('%E4%B8%AD[%E6%96%87]=1', { '中': { '文': '1' } })
    expect('a%20b=1&a+b=2', { 'a b': ['1', '2'] })
  })

  it('encoded brackets take the nested path', () => {
    expect('x=1&y%5B%5D=2&x=3', { x: ['1', '3'], y: '2' })
    expect('a%5b%5d=1&a%5b%5d=2&b%5Bc%5D=3', { a: ['1', '2'], b: { c: '3' } })
    expect('x=%5B&y=%50', { x: '[', y: 'P' })
    expect('a%5=1&b%5B=2', { 'a%5': '1', 'b[': '2' })
  })

  it('keeps malformed percent-encoding as-is', () => {
    expect('a=%ZZ', { a: '%ZZ' })
    expect('a=%ZZ+x', { a: '%ZZ x' })
    expect('a=%E4%B8%AD%', { a: '%E4%B8%AD%' })
    expect('a=%', { a: '%' })
    expect('a=%C0%80', { a: '%C0%80' }) // overlong encoding
    expect('a=%ED%A0%80', { a: '%ED%A0%80' }) // UTF-16 surrogate
  })

  it('integer-like keys are processed first', () => {
    expect('0[]=1&0=2', { 0: ['2', '1'] })
  })

  it('depth', () => {
    expect('a[b][c][d][e][f][g]=1', {
      a: { b: { c: { d: { e: { f: { '[g]': '1' } } } } } },
    })
    expect('a[b][c]=1', { a: { b: { '[c]': '1' } } }, 1)
    expect('a[][b][c]=1', { a: [{ '[b][c]': '1' }] }, 1)
    expect('a[b]=1', { a: undefined }, 0)
    expect('a[b][c][d][e][f][g][h]=1', {
      a: { b: { c: { d: { e: { f: { g: { h: '1' } } } } } } },
    }, Infinity)
  })

  it('malformed brackets', () => {
    expect('[a]=1', { '[a]': '1' })
    expect('[]=1', { '[]': '1' })
    expect('a[=1', { 'a[': '1' })
    expect('a]=1', { 'a]': '1' })
    expect('a[b]c[d]=1', { a: { b: { d: '1' } } })
    expect('a[b]]=1', { a: { ']': '1' } })
  })

  it('an existing scalar wins over a nested key', () => {
    expect('a=1&a[b]=2', { a: '1' })
    expect('a=2&a[0]=1', { a: '2' })
    expect('a=2&a[][]=1', { a: '2' })
    expect('a[]=1&a[1][b]=2', { a: '1' })
    expect('a[b]=x&a[b][0]=1', { a: { b: 'x' } })
    expect('a[b]=x&a[b][][c]=1', { a: { b: 'x' } })
  })

  it('an empty value is replaced by a container', () => {
    expect('a=&a[b]=1', { a: { b: '1' } })
    expect('a=&a[0]=1', { a: ['1'] })
    expect('a[b]=&a[b][c]=1', { a: { b: { c: '1' } } })
    expect('a[b]=1&a[c]=&a[c][d]=2', { a: { b: '1', c: { d: '2' } } })
    expect('a[0]=&a[0][d]=2&a[1]=x', { a: [{ d: '2' }, 'x'] })
  })

  it('never touches Object.prototype', () => {
    const payloads = [
      '__proto__[a]=1',
      '__proto__[a][b]=1',
      'constructor[prototype][a]=1',
      'constructor[prototype][a][b]=1',
      'constructor[assign]=1',
      'toString[]=1',
      'toString[a]=1',
      'hasOwnProperty[]=1',
      '__proto__=1&__proto__=2',
    ]
    for (const payload of payloads) {
      const result = parse(payload)
      chaiExpect(result, payload).to.deep.equal({})
      chaiExpect(Object.getPrototypeOf(result), payload).to.equal(Object.prototype)
    }
    chaiExpect({}.a).to.equal(undefined)
    chaiExpect(Object.prototype.toString[0]).to.equal(undefined)
    chaiExpect(Object.prototype.toString.a).to.equal(undefined)
    chaiExpect(Object.assign).to.be.a('function')
    chaiExpect(Object.getOwnPropertyNames(Object.prototype)).to.deep.equal(OBJECT_PROTOTYPE_NAMES)
  })

  it('array indices above arrayLimit become object keys', () => {
    expect('a[20]=x', { a: [...Array(20), 'x'] })
    expect('a[21]=x', { a: { 21: 'x' } })
    expect('a[21][b]=1', { a: { 21: { b: '1' } } })
    expect('a[b][21]=1', { a: { b: { 21: '1' } } })
    expect('a[0][21]=1', { a: [{ 21: '1' }] })
    expect('a[21]=x&a[21]=y', { a: { 21: ['x', 'y'] } })
    expect('a[1e100]=1', { a: { '1e100': '1' } })
    // an existing array is converted, like qs does
    expect('a[0]=1&a[21]=x', { a: { 0: '1', 21: 'x' } })
    expect('a[21]=x&a[0]=1', { a: { 0: '1', 21: 'x' } })
    expect('a[3]=x&a[25]=y', { a: { 3: 'x', 25: 'y' } })
    expect('a[21]=x&a[]=y', { a: { 1: 'y', 21: 'x' } })
    // custom limit
    expect('a[5]=x', { a: { 5: 'x' } }, 5, 3)
    expect('a[3]=x', { a: [undefined, undefined, undefined, 'x'] }, 5, 3)
    expect('a[1]=x', { a: { 1: 'x' } }, 5, 0)
    expect('a[0]=x', { a: ['x'] }, 5, 0)
    expect('a[0]=x', { a: { 0: 'x' } }, 5, -1)
    expect('a[]=x&a[]=y', { a: ['x', 'y'] }, 5, -1)
    expect('a[100]=x', { a: [...Array(100), 'x'] }, 5, Infinity)
  })

  it('huge indices no longer hang or throw', () => {
    expect('a[4294967294]=1&a[1]=x&a[1]=y', { a: { 1: ['x', 'y'], 4294967294: '1' } })
    expect('a[4294967294]=1&a[]=2', { a: { 1: '2', 4294967294: '1' } })
    expect('a[9999999999999999999999]=1&a[]=2', { a: { 1: '2', '9999999999999999999999': '1' } })
  })

  it('drops top-level prototype property names', () => {
    expect('constructor=1&toString=2&hasOwnProperty=3&a=4', { a: '4' })
    const result = parse('hasOwnProperty=1&valueOf=2')
    chaiExpect(result.hasOwnProperty('x')).to.equal(false)
    chaiExpect(result.valueOf()).to.equal(result)
  })
})
