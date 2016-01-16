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

test('Supports legacy config properties', t => {
  var input = readFile('./legacy-in.css')
  var expected = readFile('./legacy-out.css')
  return run(t, input, expected, {}, false)
})
