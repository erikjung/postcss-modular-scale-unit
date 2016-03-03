import postcss from 'postcss'
import ModularScale from './ModularScale'

import {
  evolve,
  find,
  ifElse,
  keys,
  length,
  propEq
} from 'ramda'

import {
  toInt,
  toFloat,
  toFloats,
  toLowerWords,
  hasSlash,
  fractionToFloat
} from './utils'

const PLUGIN_NAME = 'postcss-modular-scale-unit'
const CONFIG_PROPERTY_PATTERN = /^--modular-scale$/

const Ratios = {
  MINOR_SECOND: 1.067,
  MAJOR_SECOND: 1.125,
  MINOR_THIRD: 1.2,
  MAJOR_THIRD: 1.25,
  PERFECT_FOURTH: 1.333,
  AUGMENTED_FOURTH: 1.414,
  PERFECT_FIFTH: 1.5,
  MINOR_SIXTH: 1.6,
  GOLDEN_SECTION: 1.618,
  MAJOR_SIXTH: 1.667,
  MINOR_SEVENTH: 1.778,
  MAJOR_SEVENTH: 1.875,
  OCTAVE: 2,
  MAJOR_TENTH: 2.5,
  MAJOR_ELEVENTH: 2.667,
  MAJOR_TWELFTH: 3,
  DOUBLE_OCTAVE: 4
}

function plugin ({ name = 'msu', precision = 3 } = {}) {
  const valuePattern = new RegExp(`-?\\d+${name}\\b`, 'g')

  return (css, result) => {
    const msOptions = { precision }
    var ms

    /**
     * Extract ratio and base values from a custom property defined on `:root`.
     * If `--modular-scale` is found, its value will be used to overwrite
     * the default options for the modular scale.
     */
    css.walkDecls(CONFIG_PROPERTY_PATTERN, decl => {
      if (propEq('selector', ':root', decl.parent)) {
        let [ratio, ...bases] = postcss.list.space(decl.value)

        let matchingKey = find(
          val => toLowerWords(val) === toLowerWords(ratio),
          keys(Ratios)
        )

        ratio = Ratios[matchingKey] || ratio
        Object.assign(msOptions, evolve({
          /**
           * If `ratio` appears as a fraction string:
           * convert the fraction string to a float,
           * else, parse the raw value as a float.
           */
          ratio: ifElse(hasSlash, fractionToFloat, toFloat),
          /**
           * If `bases` has a length of elements:
           * convert all of them to floats,
           * else, default to an array of `1`
           */
          bases: ifElse(length, toFloats, () => [1])
        }, {
          ratio,
          bases
        }))
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
