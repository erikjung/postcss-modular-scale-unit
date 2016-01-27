import postcss from 'postcss'
import {
  __,
  apply,
  contains,
  curry,
  divide,
  flatten,
  invoker,
  isEmpty,
  map,
  match,
  multiply,
  nth,
  pipe,
  propEq,
  range,
  reject,
  sort,
  split,
  toString
} from 'ramda'

/**
 * Pattern to match the `--modular-scale` property
 */
const CONFIG_PROPERTY_PATTERN = /^--modular-scale$/

/**
 * Pattern to match values for the `--modular-scale` property
 *
 * - Matches <number> ratios: 1.618
 * - Matches <ratio> ratios: 4/3
 * - Matches ratios followed by one <integer> base: 1.618 1
 * - Matches ratios followed by many <integer> bases: 1.618 1 2
 */
const CONFIG_VALUE_PATTERN = /^((?:\d+[\.|\/])?\d+)(\s(?:\s?\d*\.?\d+)+)?$/

/**
 * Curried Utility Functions
 */
const pow = curry(Math.pow)
const toInt = curry(parseInt, __)(10)
const toFloat = curry(parseFloat)
const toFixed = invoker(1, 'toFixed')(3)
const toRatio = pipe(toFixed, toFloat)
const rejectEmpty = reject(isEmpty)
const sortUp = sort((a, b) => a - b)
const splitOnSpace = split(' ')
const splitOnSlash = split('/')
const isRootSelector = propEq('selector', ':root')
const prepStrands = pipe(flatten, sortUp)
const prepBases = pipe(
  splitOnSpace,
  rejectEmpty,
  map(toFloat)
)
const ratioToDecimal = pipe(
  splitOnSlash,
  map(toInt),
  apply(divide),
  toRatio
)

class ModularScale {
  constructor ({ ratio = 1.618, bases = [1] } = {}) {
    const calc = pow(ratio)
    return interval => {
      const result = pipe(nth(interval), toRatio)
      const rangePair = sortUp([
        interval ? interval + Math.sign(interval) : 0,
        interval ? interval % 1 : 1
      ])
      const strands = map(base => {
        const x = pipe(calc, multiply(base))
        return map(
          count => x(count),
          range(...rangePair)
        )
      }, bases)
      return result(prepStrands(strands))
    }
  }
}

function plugin ({ name = 'msu' } = {}) {
  const propPattern = new RegExp(`^--${name}-(\\w+)`)
  var msOptions
  var ms

  /**
   * --msu-bases, --msu-ratios
   */

  function setScaleOptionLegacy (decl) {
    const [, propKey] = match(propPattern, decl.prop)
    var ratio
    var bases

    switch (propKey) {
      case 'ratios':
        ratio = decl.value
        break
      case 'bases':
        bases = prepBases(decl.value)
        break
      default:
        break
    }
    msOptions = { bases, ratio }
  }

  /**
   * --modular-scale
   */

  function setScaleOption (decl) {
    var [, ratio, bases = '1'] = match(CONFIG_VALUE_PATTERN, decl.value)

    if (contains('/', ratio)) {
      ratio = toString(ratioToDecimal(ratio))
    }
    bases = prepBases(bases)
    msOptions = { bases, ratio }
  }

  return (css, result) => {
    /**
     * Extract ratios and bases from custom properties defined on `:root`.
     * If `--msu-ratios` or `--msu-bases` properties are found, their values
     * will be used to overwrite the default options for the modular scale.
     *
     * TODO: Deprecate support of these properties.
     */

    css.walkDecls(propPattern, decl => {
      decl.warn(result,
        `Setting options via ${decl.prop} will be deprecated soon. Use the --modular-scale property instead.`
      )
      if (isRootSelector(decl.parent)) {
        setScaleOptionLegacy(decl)
      }
    })

    /**
     * Extract ratios and bases from a custom property defined on `:root`.
     * If `--modular-scale` is found, its value will be used to overwrite
     * the default options for the modular scale.
     */

    css.walkDecls(CONFIG_PROPERTY_PATTERN, decl => {
      if (isRootSelector(decl.parent)) {
        setScaleOption(decl)
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

export default postcss.plugin('postcss-modular-scale-unit', plugin)
