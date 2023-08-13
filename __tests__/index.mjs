import chai from 'chai'
import qs from 'qs'
import parse from '../index.mjs'

describe('parse', () => {
  it('array', () => {
    chai.expect(parse('a[]&a[]&a[]&a[]&a[]&a[]')).to.be.deep.equal({
      a: ['', '', '', '', '', ''],
    })
    chai.expect(parse('a&a&a&a[]&a[]&a[]')).to.be.deep.equal({
      a: ['', '', '', '', '', ''],
    })
  })

  it('nested array', () => {
    chai.expect(parse('a[][][]&a[][][]&a[][][]&a[][]&a[][]&a[]')).to.be.deep.equal({
      a: [[['', '', '']], ['', ''], ''],
    })
  })

  it('array with index', () => {
    chai.expect(parse('a[3]=3&a[5]=5&a[2]=2&a[4]=4&a[1]=1&a[0]=0&a[10]=10')).to.be.deep.equal({
      a: ['0', '1', '2', '3', '4', '5', undefined, undefined, undefined, undefined, '10'],
    })
  })

  it('object', () => {
    chai.expect(parse('a[a]&a[b]&a[c]')).to.be.deep.equal({
      a: { a: '', b: '', c: '' },
    })
  })

  it('nested object', () => {
    chai.expect(parse('a[a][a]&a[a][b]&a[a][c]')).to.be.deep.equal({
      a: { a: { a: '', b: '', c: '' } },
    })
  })

  it('mix array & object', () => {
    chai.expect(parse('a[a][][a]&a[a][a]&a[a][][b]')).to.be.deep.equal({
      a: { a: { 0: { a: '' }, a: '', 2:{ b: '' } } },
    })
  })

  it('drop insecure key', () => {
    chai.expect(parse('a[constructor][prototype][a]=1')).to.be.deep.equal({
      a: undefined,
    })
    chai.expect(parse('a[toString]=1')).to.be.deep.equal({
      a: undefined,
    })
    chai.expect(parse('a[__proto__]=1')).to.be.deep.equal({
      a: undefined,
    })
  })
})
