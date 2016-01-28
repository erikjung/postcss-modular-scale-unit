import postcss from 'postcss'
import {
  __,
  all,
  apply,
  both,
  contains,
  curry,
  divide,
  gt,
  ifElse,
  invoker,
  is,
  length,
  map,
  multiply,
  nth,
  pipe,
  propEq,
  range,
  sort,
  split,
  unnest
} from 'ramda'

const PLUGIN_NAME = 'postcss-modular-scale-unit'
const CONFIG_PROPERTY_PATTERN = /^--modular-scale$/

const pow = curry(Math.pow)
const toInt = curry(parseInt)(__, 10)
const toInts = map(toInt)
const toFloat = curry(parseFloat)
const toFloats = map(toFloat)
const toFixed = invoker(1, 'toFixed')(3)
const toFixedFloat = pipe(toFixed, toFloat)
const sortUp = sort((a, b) => a - b)
const hasSlash = contains('/')
const isNumber = is(Number)
const isAboveZero = both(isNumber, gt(__, 0))
const isAboveOne = both(isNumber, gt(__, 1))
const unnestSort = pipe(unnest, sortUp)
const fractionToFloat = pipe(
  split('/'),
  toInts,
  apply(divide),
  toFloat
)

class ModularScale {
  constructor ({ ratio = 1.618, bases = [1] } = {}) {
    const calc = pow(ratio)

    if (!isAboveOne(ratio)) {
      throw new TypeError('"ratio" must be a number greater than 1.')
    }

    if (!all(isAboveZero, bases)) {
      throw new TypeError('"bases" must be a list of numbers greater than 0.')
    }

    return interval => {
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
    }
  }
}

function plugin ({ name = 'msu' } = {}) {
  const valuePattern = new RegExp(`-?\\d+${name}\\b`, 'g')

  return (css, result) => {
    var msOptions
    var ms

    /**
     * Extract ratio and base values from a custom property defined on `:root`.
     * If `--modular-scale` is found, its value will be used to overwrite
     * the default options for the modular scale.
     */
    css.walkDecls(CONFIG_PROPERTY_PATTERN, decl => {
      if (propEq('selector', ':root', decl.parent)) {
        let [ratio, ...bases] = postcss.list.space(decl.value)
        msOptions = {
          /**
           * If `ratio` is a fraction:
           * convert the fraction to a float,
           * else, parse the raw value as a float.
           */
          ratio: ifElse(hasSlash, fractionToFloat, toFloat)(ratio),
          /**
           * If `bases` has elements:
           * convert all of them to floats,
           * else, default to an array of `1`
           */
          bases: ifElse(length, toFloats, () => [1])(bases)
        }
      }
    })

    ms = new ModularScale(msOptions)

    /**
     * Replace any CSS values using the special unit with numbers resulting from
     * the modular scale instance.
     */
    css.replaceValues(
      valuePattern, { fast: name }, str => ms(toInt(str))
    )
  }
}

export default postcss.plugin(PLUGIN_NAME, plugin)
