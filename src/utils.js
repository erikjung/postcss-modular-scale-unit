import {
  __,
  apply,
  both,
  contains,
  curry,
  divide,
  gt,
  invoker,
  is,
  map,
  pipe,
  replace,
  sort,
  split,
  toLower,
  unnest
} from 'ramda'

export const pow = curry(Math.pow)
export const toInt = curry(parseInt)(__, 10)
export const toInts = map(toInt)
export const toFloat = curry(parseFloat)
export const toFloats = map(toFloat)
export const toFixed = invoker(1, 'toFixed')(3)
export const toFixedFloat = pipe(toFixed, toFloat)
export const toLowerWords = pipe(toLower, replace(/[\W_]+/g, ''))
export const sortUp = sort((a, b) => a - b)
export const hasSlash = contains('/')
export const isNumber = is(Number)
export const isAboveZero = both(isNumber, gt(__, 0))
export const isAboveOne = both(isNumber, gt(__, 1))
export const unnestSort = pipe(unnest, sortUp)
export const fractionToFloat = pipe(
  split('/'),
  toInts,
  apply(divide),
  toFloat
)
