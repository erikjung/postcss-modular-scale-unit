'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _ramda = require('ramda');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PLUGIN_NAME = 'postcss-modular-scale-unit';
var CONFIG_PROPERTY_PATTERN = /^--modular-scale$/;

/**
 * Curried Utility Functions
 */
var pow = (0, _ramda.curry)(Math.pow);
var toInt = (0, _ramda.curry)(parseInt)(_ramda.__, 10);
var toFloat = (0, _ramda.curry)(parseFloat);
var toFixed = (0, _ramda.invoker)(1, 'toFixed')(3);
var toFixedFloat = (0, _ramda.pipe)(toFixed, toFloat);
var sortUp = (0, _ramda.sort)(function (a, b) {
  return a - b;
});
var isNumber = (0, _ramda.is)(Number);
var isAboveZero = (0, _ramda.both)(isNumber, (0, _ramda.gt)(_ramda.__, 0));
var isAboveOne = (0, _ramda.both)(isNumber, (0, _ramda.gt)(_ramda.__, 1));
var isRootSelector = (0, _ramda.propEq)('selector', ':root');
var unnestSort = (0, _ramda.pipe)(_ramda.unnest, sortUp);
var fractionToFloat = (0, _ramda.pipe)((0, _ramda.split)('/'), (0, _ramda.map)(toInt), (0, _ramda.apply)(_ramda.divide), toFloat);

var ModularScale = function ModularScale() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$ratio = _ref.ratio;
  var ratio = _ref$ratio === undefined ? 1.618 : _ref$ratio;
  var _ref$bases = _ref.bases;
  var bases = _ref$bases === undefined ? [1] : _ref$bases;

  _classCallCheck(this, ModularScale);

  var calc = pow(ratio);

  if (!isAboveOne(ratio)) {
    throw new TypeError('"ratio" must be a number greater than 1.');
  }

  if (!(0, _ramda.all)(isAboveZero, bases)) {
    throw new TypeError('"bases" must be a list of numbers greater than 0.');
  }

  return function (interval) {
    var intervalRange = sortUp([interval ? interval + Math.sign(interval) : 0, interval ? interval % 1 : 1]);
    var baseStrands = (0, _ramda.map)(function (base) {
      var step = (0, _ramda.pipe)(calc, (0, _ramda.multiply)(base));
      return (0, _ramda.map)(function (i) {
        return step(i);
      }, _ramda.range.apply(undefined, _toConsumableArray(intervalRange)));
    }, bases);

    return (0, _ramda.pipe)(unnestSort, (0, _ramda.nth)(interval), toFixedFloat)(baseStrands);
  };
};

function plugin() {
  var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref2$name = _ref2.name;
  var name = _ref2$name === undefined ? 'msu' : _ref2$name;

  var valuePattern = new RegExp('-?\\d+' + name + '\\b', 'g');
  var msOptions;
  var ms;

  function setOptions(decl) {
    var _postcss$list$space = _postcss2.default.list.space(decl.value);

    var _postcss$list$space2 = _toArray(_postcss$list$space);

    var ratio = _postcss$list$space2[0];

    var bases = _postcss$list$space2.slice(1);

    ratio = (0, _ramda.ifElse)((0, _ramda.contains)('/'), fractionToFloat, toFloat)(ratio);

    bases = (0, _ramda.ifElse)(_ramda.length, (0, _ramda.pipe)((0, _ramda.map)(toFloat), sortUp), function () {
      return [1];
    })(bases);

    msOptions = { bases: bases, ratio: ratio };
  }

  return function (css, result) {
    /**
     * Extract ratios and bases from a custom property defined on `:root`.
     * If `--modular-scale` is found, its value will be used to overwrite
     * the default options for the modular scale.
     */

    css.walkDecls(CONFIG_PROPERTY_PATTERN, function (decl) {
      if (isRootSelector(decl.parent)) {
        setOptions(decl);
      }
    });

    /**
     * Initialize the modular scale; replace any CSS values using the supplied
     * unit with calculated numbers resulting from the scale.
     */

    ms = new ModularScale(msOptions);

    css.replaceValues(valuePattern, { fast: name }, function (str) {
      return ms(toInt(str));
    });
  };
}

exports.default = _postcss2.default.plugin(PLUGIN_NAME, plugin);
