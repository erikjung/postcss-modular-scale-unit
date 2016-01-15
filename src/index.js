import postcss from 'postcss'
import ModularScale from 'modular-scale'

function plugin ({ name = 'msu' } = {}) {
  return css => {
    var patterns = [
      new RegExp(`^--${name}-(\\w+)`),
      new RegExp(`-?\\d+${name}\\b`, 'g')
    ]
    var msOptions = {}
    var ms

    /**
     * Extract ratios and bases from custom properties defined on `:root`.
     * If `--msu-ratios` or `--msu-bases` properties are found, their values
     * will be used to overwrite the default options for the modular scale.
     */
    css.walkDecls(decl => {
      var parentSelector = decl.parent.selector
      var [, propKey] = decl.prop.match(patterns[0]) || []

      if (parentSelector === ':root' && propKey) {
        msOptions[propKey] = decl.value.split(' ')
      }
    })

    /**
     * Initialize the modular scale and replace any values using the `msu` unit
     * with numbers resulting from it.
     */
    ms = new ModularScale(msOptions)
    css.replaceValues(
      patterns[1],
      { fast: name },
      str => ms(parseInt(str, 10))
    )
  }
}

export default postcss.plugin('postcss-modular-scale-unit', plugin)
