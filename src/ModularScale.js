import {
  curry,
  forEach,
  invoker,
  multiply,
  pipe,
  sort,
  uniq
} from 'ramda'

var toFloat = curry(parseFloat)
var toFixed = invoker(1, 'toFixed')(3)
var toRatio = pipe(toFixed, toFloat)
var sortAsc = sort((a, b) => a - b)
var sortDesc = sort((a, b) => b - a)

export default class ModularScale {

  constructor ({ ratio = 1.5, bases = [1] } = {}) {
    return interval => {
      var items = []
      var itemIndex = Math.abs(interval)
      var calc = curry(Math.pow)(ratio)
      var sortItems = interval < 0 ? sortDesc : sortAsc

      forEach(base => {
        var x = pipe(calc, multiply(base))

        var addLowerPositives = (i = 0) => {
          var result = x(i)
          if (result >= bases[0]) {
            items.push(result)
            addLowerPositives(--i)
          }
        }

        var addUpperPositives = (i = 0) => {
          var result = x(i)
          if (result <= x(interval + 1)) {
            items.push(result)
            addUpperPositives(++i)
          }
        }

        var addLowerNegatives = (i = 0) => {
          var result = x(i)
          if (result <= bases[0]) {
            items.push(result)
            addLowerNegatives(++i)
          }
        }

        var addUpperNegatives = (i = 0) => {
          var result = x(i)
          if (result >= x(interval - 1)) {
            if (result <= bases[0]) items.push(result)
            addUpperNegatives(--i)
          }
        }

        if (interval >= 0) {
          addLowerPositives()
          addUpperPositives()
        } else {
          addLowerNegatives()
          addUpperNegatives()
        }
      }, sortAsc(bases))

      return toRatio(
        uniq(sortItems(items))[itemIndex]
      )
    }
  }
}
