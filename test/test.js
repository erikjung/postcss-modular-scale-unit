import fs from 'fs'
import ModularScale from '../dist/ModularScale'
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

test('ModularScale default options', t => {
  var ms = new ModularScale()
  t.plan(3)
  t.same(ms(-1), 0.618)
  t.same(ms(0), 1)
  t.same(ms(1), 1.618)
})

test('ModularScale supplied ratio', t => {
  var ms = new ModularScale({ ratio: 1.5 })
  t.plan(3)
  t.same(ms(-1), 0.667)
  t.same(ms(0), 1)
  t.same(ms(1), 1.5)
})

test('ModularScale supplied ratio and multiple bases', t => {
  var ms = new ModularScale({ ratio: 1.5, bases: [1, 1.25] })
  t.plan(5)
  t.same(ms(-2), 0.667)
  t.same(ms(-1), 0.833)
  t.same(ms(0), 1)
  t.same(ms(1), 1.25)
  t.same(ms(2), 1.5)
})

test('ModularScale supplied precision', t => {
  var ms = new ModularScale({ ratio: 1.5, precision: 4 })
  t.plan(1)
  t.same(ms(5), 7.5938)
})

test('ModularScale errors with bad ratio', t => {
  t.plan(2)
  t.throws(
    () => new ModularScale({ ratio: 'foo' }),
    TypeError,
    'Throws TypeError when ratio is not a number'
  )
  t.throws(
    () => new ModularScale({ ratio: 1 }),
    TypeError,
    'Throws TypeError when ratio is not greater than 1'
  )
})

test('ModularScale errors with bad bases', t => {
  t.plan(3)
  t.throws(
    () => new ModularScale({ bases: 'foo' }),
    TypeError,
    'Throws TypeError when bases is not an array'
  )
  t.throws(
    () => new ModularScale({ bases: ['a', 1] }),
    TypeError,
    'Throws TypeError when bases contains a non-number'
  )
  t.throws(
    () => new ModularScale({ bases: [0, 1] }),
    TypeError,
    'Throws TypeError when bases contains a number not greater than 0'
  )
})

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

test('Works with named ratios', t => {
  var input = readFile('./namedRatio-in.css')
  var expected = readFile('./namedRatio-out.css')
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

test('Works with precision override', t => {
  var input = readFile('./customPrec-in.css')
  var expected = readFile('./customPrec-out.css')
  return run(t, input, expected, { precision: 4 })
})

test('Does what the docs show for example', t => {
  var input = readFile('./docsExample-in.css')
  var expected = readFile('./docsExample-out.css')
  return run(t, input, expected)
})
