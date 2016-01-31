import {
  all,
  map,
  memoize,
  multiply,
  nth,
  pipe,
  range
} from 'ramda'

import {
  isAboveOne,
  isAboveZero,
  pow,
  sortUp,
  toFixedFloat,
  unnestSort
} from './utils'

export default class ModularScale {
  constructor ({ ratio = 1.618, bases = [1] } = {}) {
    const calc = pow(ratio)

    if (!isAboveOne(ratio)) {
      throw new TypeError('"ratio" must be a number greater than 1.')
    }

    if (!all(isAboveZero, bases)) {
      throw new TypeError('"bases" must be a list of numbers greater than 0.')
    }

    return memoize(interval => {
      const intervalRange = sortUp([
        interval ? interval + Math.sign(interval) : 0,
        interval ? interval % 1 : 1
      ])
      const baseStrands = map(base => {
        const step = pipe(calc, multiply(base))
        return map(i => step(i), range(...intervalRange))
      }, sortUp(bases))

      return pipe(
        unnestSort,
        nth(interval),
        toFixedFloat
      )(baseStrands)
    })
  }
}
