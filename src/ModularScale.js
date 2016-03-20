const isNum = n => n.constructor === Number
const isAbove = (n1, n2) => n2 > n1
const isAboveOne = n => isNum(n) && isAbove(1, n)
const isAboveZero = n => isNum(n) && isAbove(0, n)

export default class ModularScale {
  constructor ({
    ratio = 1.618,
    bases = [1],
    precision = 3
  } = {}) {
    function scaleNum (n1, n2) {
      return parseFloat(
        (Math.pow(ratio, n1) * n2).toFixed(precision)
      )
    }

    if (!isAboveOne(ratio)) {
      throw new TypeError('"ratio" must be a number greater than 1.')
    }

    if (!bases.every(isAboveZero)) {
      throw new TypeError('"bases" must be a list of numbers greater than 0.')
    }

    return function (int) {
      const IS_NEG = Math.sign(int) === -1
      const numSet = new Set()
      const baseCount = bases.length
      const countRange = Math.abs(int) + 1
      const results = []
      var count = countRange - 1

      bases.sort((a, b) => a - b)

      while (count >= countRange * -1) {
        for (let baseIndex = 0; baseIndex < baseCount; baseIndex++) {
          numSet.add(scaleNum(count, bases[baseIndex]))
        }
        count--
      }

      numSet.forEach(num => results.push(num))
      results.sort((a, b) => IS_NEG ? b - a : a - b)
      results.splice(0, results.indexOf(bases[0]))

      return results[Math.abs(int)]
    }
  }
}
