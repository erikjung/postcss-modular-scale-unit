[PostCSS]: https://github.com/postcss/postcss
[PostCSS usage docs]: https://github.com/postcss/postcss#usage
[ci-img]: https://travis-ci.org/erikjung/postcss-modular-scale-unit.svg
[ci]: https://travis-ci.org/erikjung/postcss-modular-scale-unit
[postcss-modular-scale]: https://github.com/kristoferjoseph/postcss-modular-scale
[postcss-vertical-rhythm]: https://github.com/markgoodyear/postcss-vertical-rhythm
[postcss-cssnext]: https://github.com/MoOx/postcss-cssnext
[postcss-calc]: https://github.com/postcss/postcss-calc

# PostCSS Modular Scale Unit [![Build Status][ci-img]][ci]

> A [PostCSS] plugin to create a modular scale unit.

## Install

```sh
npm install postcss-modular-scale-unit --save-dev
```

## Examples

**Input:**

```css
/* Options passed to modular-scale */
:root {
  --msu-bases: 1;
  --msu-ratios: 1.5;
}

.Example {
  font-size: calc(2msu * 1em);
  line-height: 1msu;
}
```

**Output:**

```css
:root {
  /* ... */
}

.Example {
  font-size: calc(2.25 * 1em);
  line-height: 1.5;
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

## Todo

- Allow customization of the `msu` unit name.
