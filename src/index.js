import postcss from 'postcss'
import ModularScale from 'modular-scale'
import R, { match } from 'ramda'

/**
 * Pattern to match values for the `--modular-scale` property
 *
 * - Matches <number> ratios: 1.618
 * - Matches <ratio> ratios: 4/3
 * - Matches ratios followed by one <integer> base: 1.618 1
 * - Matches ratios followed by many <integer> bases: 1.618 1 2
 */

const CONFIG_VALUE_PATTERN = /^((?:\d+[\.|\/])?\d+)(\s(?:\s?\d*\.?\d+)+)?$/
const CONFIG_PROPERTY_PATTERN = /^--modular-scale$/

function plugin ({ name = 'msu' } = {}) {
  var isRootSelector = R.propEq('selector', ':root')
  var msOptions = {}
  var ms

  /**
   * --msu-bases, --msu-ratios
   */

  function setScaleOptionLegacy (decl) {
    var propPattern = new RegExp(`^--${name}-(\\w+)`)
    var [, propKey] = match(propPattern, decl.prop)
    if (propKey) msOptions[propKey] = decl.value.split(' ')
  }

  /**
   * --modular-scale
   */

  function setScaleOption (decl) {
    let [, ratios, bases] = match(CONFIG_VALUE_PATTERN, decl.value)
    // TODO: need to support <ratio> type (e.g. 4/3)
    msOptions.ratios = ratios.split(' ')
    if (bases) msOptions.bases = bases.split(' ')
  }

  return (css, result) => {
    /**
     * Extract ratios and bases from custom properties defined on `:root`.
     * If `--msu-ratios` or `--msu-bases` properties are found, their values
     * will be used to overwrite the default options for the modular scale.
     *
     * TODO: Deprecate support of these properties.
     */

    css.walkDecls(new RegExp(`^--${name}-(\\w+)`), decl => {
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
