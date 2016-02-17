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

## Setup

The **ratio** and **base** parameters of your modular scale can be supplied with the `--modular-scale` custom property:

```
--modular-scale: [ratio] [...bases]
```

**Ratio** can be supplied as a:
- number greater than one (for example, `1.5`)
- fraction greater than one (for example, `3/2`)
- keyword alias (for example, `perfectfifth`)

The following are all equivalent:
```css
:root {
  --modular-scale: 1.5;
  --modular-scale: 3/2;
  --modular-scale: perfectfifth;
}
```

**Bases** are optional, and can be supplied as one or more numbers greater than or equal to one, defaulting to `1` when omitted. The following results in a scale that looks like [this](http://www.modularscale.com/?1,1.125,1.25&em&1.5&web&text):

```css
:root {
  --modular-scale: perfectfifth 1 1.125 1.25;
}
```

## Using the custom unit

With the `--modular-scale` property set, simply append the custom unit to positive or negative integers that correlate with the steps of your scale. The output will be a plain number.

**Input:**

```css
:root {
  --modular-scale: 3/2;
}

.Example {
  line-height: 1msu;
  font-size: calc(1msu * 1em);
  width: calc(-1msu * 100%);
}
```

**Output:**

```css
.Example {
  line-height: 1.5;
  font-size: calc(1.5 * 1em);
  width: calc(0.667 * 100%);
}
```

If needed, see [postcss-cssnext] or [postcss-calc] for `calc()` handling.

## PostCSS integration

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
