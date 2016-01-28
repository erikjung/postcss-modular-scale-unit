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
  invoker,
  is,
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

/**
 * Curried Utility Functions
 */
const pow = curry(Math.pow)
const toInt = curry(parseInt, __)(10)
const toFloat = curry(parseFloat)
const toFixed = invoker(1, 'toFixed')(3)
const toFixedFloat = pipe(toFixed, toFloat)
const sortUp = sort((a, b) => a - b)
const isNumber = is(Number)
const isAboveZero = both(isNumber, gt(__, 0))
const isAboveOne = both(isNumber, gt(__, 1))
const isRootSelector = propEq('selector', ':root')
const unnestSort = pipe(unnest, sortUp)
const fractionToFloat = pipe(
  split('/'),
  map(toInt),
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
      }, bases)

      return pipe(
        unnestSort,
        nth(interval),
        toFixedFloat
      )(baseStrands)
    }
  }
}

function plugin ({ name = 'msu' } = {}) {
  var msOptions
  var ms

  function setOptions (decl) {
    var [ratio, ...bases] = postcss.list.space(decl.value)

    if (contains('/', ratio)) {
      ratio = fractionToFloat(ratio)
    } else {
      ratio = toFloat(ratio)
    }

    if (!bases.length) {
      bases.push(1)
    }

    bases = map(toFloat, bases)
    msOptions = { bases, ratio }
  }

  return (css, result) => {
    /**
     * Extract ratios and bases from a custom property defined on `:root`.
     * If `--modular-scale` is found, its value will be used to overwrite
     * the default options for the modular scale.
     */

    css.walkDecls(CONFIG_PROPERTY_PATTERN, decl => {
      if (isRootSelector(decl.parent)) {
        setOptions(decl)
      }
    })

    /**
     * Initialize the modular scale; replace any CSS values using the supplied
     * unit with calculated numbers resulting from the scale.
     */

    ms = new ModularScale(msOptions)

    css.replaceValues(
      new RegExp(`-?\\d+${name}\\b`, 'g'),
      { fast: name },
      str => ms(parseInt(str, 10))
    )
  }
}

export default postcss.plugin(PLUGIN_NAME, plugin)
