export type ParsedValue =
  | string
  | string[]
  | ParsedObject
  | ParsedArray
  | undefined

export interface ParsedObject {
  [key: string]: ParsedValue
}

export type ParsedArray = ParsedValue[]

/**
 * Parse a query string into a nested object.
 *
 * @param str        - The query string to parse (e.g. `"a=1&b[]=2&b[]=3"`)
 * @param depth      - Maximum nesting depth for bracket notation. Default `5`.
 * @param arrayLimit - Largest explicit array index (`a[N]`) that still creates
 *                     an array; larger indices are stored as object keys. Default `20`.
 * @returns          Parsed key-value pairs as a nested object.
 *
 * @example
 * import parse from 'faster-qs'
 * parse('a=1&b[]=2&b[]=3')          // { a: '1', b: ['2', '3'] }
 * parse('a[b][c]=1')                // { a: { b: { c: '1' } } }
 * parse('a[21]=1')                  // { a: { '21': '1' } }
 */
declare function parse(str: string, depth?: number, arrayLimit?: number): ParsedObject

export default parse
