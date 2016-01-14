import fs from 'fs'
import plugin from '../dist'
import postcss from 'postcss'
import test from 'ava'

function run(t, input, output, opts = {}) {
  return postcss([plugin(opts)])
    .process(input)
    .then(result => {
      t.same(result.css, output)
      t.same(result.warnings().length, 0)
    })
}

function readFile(path) {
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
