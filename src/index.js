import postcss from 'postcss'
import ModularScale from 'modular-scale'

function plugin () {
  return css => {
    var msOptions = {}
    var ms

    /**
     * Extract ratios and bases from custom properties defined on `:root`.
     * If `--msu-ratios` or `--msu-bases` properties are found, their values
     * will be used to overwrite the default options for the modular scale.
     */
    css.walkDecls(decl => {
      var parentSelector = decl.parent.selector
      var [, propKey] = decl.prop.match(/^--msu-(\w+)/) || []

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
      /-?\d+msu\b/g,
      { fast: 'msu' },
      str => ms(parseInt(str, 10))
    )
  }
}

export default postcss.plugin('postcss-modular-scale-unit', plugin)
