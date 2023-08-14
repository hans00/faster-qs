import chai from 'chai'
import parse from '../index.mjs'

const expect = (payload, target) =>
  chai.expect(parse(payload)).to.be.deep.equal(target)

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
  })
})
