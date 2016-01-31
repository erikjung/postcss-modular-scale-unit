'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _ramda = require('ramda');

var _utils = require('./utils');

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var ModularScale = function ModularScale() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$ratio = _ref.ratio;
  var ratio = _ref$ratio === undefined ? 1.618 : _ref$ratio;
  var _ref$bases = _ref.bases;
  var bases = _ref$bases === undefined ? [1] : _ref$bases;

  _classCallCheck(this, ModularScale);

  var calc = (0, _utils.pow)(ratio);

  if (!(0, _utils.isAboveOne)(ratio)) {
    throw new TypeError('"ratio" must be a number greater than 1.');
  }

  if (!(0, _ramda.all)(_utils.isAboveZero, bases)) {
    throw new TypeError('"bases" must be a list of numbers greater than 0.');
  }

  return (0, _ramda.memoize)(function (interval) {
    var intervalRange = (0, _utils.sortUp)([interval ? interval + Math.sign(interval) : 0, interval ? interval % 1 : 1]);
    var baseStrands = (0, _ramda.map)(function (base) {
      var step = (0, _ramda.pipe)(calc, (0, _ramda.multiply)(base));
      return (0, _ramda.map)(function (i) {
        return step(i);
      }, _ramda.range.apply(undefined, _toConsumableArray(intervalRange)));
    }, (0, _utils.sortUp)(bases));

    return (0, _ramda.pipe)(_utils.unnestSort, (0, _ramda.nth)(interval), _utils.toFixedFloat)(baseStrands);
  });
};

exports.default = ModularScale;