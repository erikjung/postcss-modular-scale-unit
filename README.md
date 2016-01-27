[ci]: https://travis-ci.org/erikjung/postcss-modular-scale-unit
[ci-img]: https://travis-ci.org/erikjung/postcss-modular-scale-unit.svg
[ver-img]: https://img.shields.io/npm/v/postcss-modular-scale-unit.svg
[npm]: https://www.npmjs.com/package/postcss-modular-scale-unit
[PostCSS]: https://github.com/postcss/postcss
[PostCSS usage docs]: https://github.com/postcss/postcss#usage

[modular-scale]: https://github.com/kristoferjoseph/modular-scale
[postcss-modular-scale]: https://github.com/kristoferjoseph/postcss-modular-scale
[postcss-vertical-rhythm]: https://github.com/markgoodyear/postcss-vertical-rhythm
[postcss-cssnext]: https://github.com/MoOx/postcss-cssnext
[postcss-calc]: https://github.com/postcss/postcss-calc

# PostCSS Modular Scale Unit

[![Build Status][ci-img]][ci]
[![npm][ver-img]][npm]

This plugin transforms CSS declaration values using a custom `msu` unit. Instances of this unit are replaced with numbers from a [modular scale](http://modularscale.com).

## Installation

```sh
npm install postcss-modular-scale-unit
```

## Examples

### Setup

The **ratio** and **base** parameters of your modular scale can be supplied with the `--modular-scale` custom property. This property acts as a shorthand, accepting values in this order:


0. **ratio:** a decimal or fraction greater than 1
0. **base:** (optional) one or more positive numbers, defaulting to `1` if omitted

```css
:root {
  /* Just a ratio of 1.5 */
  --modular-scale: 1.5;

  /* Same as above, but as a fraction */
  --modular-scale: 3/2;

  /* Ratio of 1.5 with bases of 1 and 1.25 */
  --modular-scale: 1.5 1 1.25;
}
```

### Input

```css
.Example {
  line-height: 1msu;
}

.Example {
  width: calc(-2msu * 100%);
}

.Example {
  font-size: calc(2msu * 1em);
}
```

### Output

```css
.Example {
  line-height: 1.5;
}

.Example {
  width: calc(0.444 * 100%);
}

.Example {
  font-size: calc(2.25 * 1em);
}
```

If needed, see [postcss-cssnext] or [postcss-calc] for `calc()` handling.

## Usage

```js
var fs = require('fs')
var postcss = require('postcss')
var modularScaleUnit = require('postcss-modular-scale-unit')

var output = postcss()
  .use(modularScaleUnit())
  .process(fs.readFileSync('input.css', 'utf8'))
  .css
```

See the [PostCSS usage docs] docs for more examples.

## Inspiration

This plugin is inspired by [postcss-modular-scale] and [postcss-vertical-rhythm]. The goal is to provide a way to use modular scale values as if they were native CSS units.
