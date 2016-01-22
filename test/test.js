import fs from 'fs'
import plugin from '../'
import postcss from 'postcss'
import test from 'ava'

function run (t, input, output, opts = {}, strict = true) {
  return postcss([plugin(opts)])
    .process(input)
    .then(result => {
      t.same(result.css, output)
      if (strict) t.same(result.warnings().length, 0)
    })
}

function readFile (path) {
  return fs.readFileSync(path, 'utf8')
}

/*
test.skip('Modular scale general behavior', t => {
  var ratios = [
    1.067,
    1.125,
    1.2,
    1.25,
    1.333,
    1.414,
    1.5,
    1.6,
    1.618,
    1.667,
    1.778,
    1.875,
    2,
    2.5,
    2.667,
    3,
    4
  ]
  var ms = new ModularScale()

  t.plan(2 + ratios.length)

  t.same(ms(0), 1, 'Default base and ratio; interval 0')
  t.same(ms(1), 1.5, 'Default base and ratio; interval 1')

  ratios.forEach(ratio => {
    var ms = new ModularScale({ ratio })
    t.same(ms(1), ratio, `Default base and ratio ${ratio}; interval 1`)
  })
})

test.skip('Modular scale specific behavior', t => {
  // http://www.modularscale.com/?1,1.5,1.25,1.125&em&2&web&table
  var ms = new ModularScale({ ratio: 2, bases: [1, 1.5, 1.25, 1.125] })
  var expectedValues = {
    [6]: 2.5,
    [5]: 2.25,
    [4]: 2,
    [3]: 1.5,
    [2]: 1.25,
    [1]: 1.125,
    [0]: 1,
    [-1]: 0.75,
    [-2]: 0.625,
    [-3]: 0.563,
    [-4]: 0.5,
    [-5]: 0.375,
    [-6]: 0.313
  }
  var intervals = Object.keys(expectedValues)

  t.plan(intervals.length)

  intervals.forEach(interval => {
    t.same(
      ms(interval),
      expectedValues[interval],
      'Multiple bases and a common ratio of 2'
    )
  })
})
*/

test('Works with a default ratio', t => {
  var input = readFile('./default-in.css')
  var expected = readFile('./default-out.css')
  return run(t, input, expected)
})

test('Works with a supplied ratio', t => {
  var input = readFile('./supplied-in.css')
  var expected = readFile('./supplied-out.css')
  return run(t, input, expected)
})

test('Works with multiple bases and values', t => {
  var input = readFile('./multiple-in.css')
  var expected = readFile('./multiple-out.css')
  return run(t, input, expected)
})

test('Works with calc()', t => {
  var input = readFile('./calc-in.css')
  var expected = readFile('./calc-out.css')
  return run(t, input, expected)
})

test('Ignores invalid unit name', t => {
  var input = readFile('./invalid-in.css')
  var expected = readFile('./invalid-out.css')
  return run(t, input, expected)
})

test('Works with a custom unit name', t => {
  var input = readFile('./customName-in.css')
  var expected = readFile('./customName-out.css')
  return run(t, input, expected, { name: 'mods' })
})

test('Does what the docs show for example', t => {
  var input = readFile('./docsExample-in.css')
  var expected = readFile('./docsExample-out.css')
  return run(t, input, expected)
})

test('Supports legacy config properties', t => {
  var input = readFile('./legacy-in.css')
  var expected = readFile('./legacy-out.css')
  return run(t, input, expected, {}, false)
})
