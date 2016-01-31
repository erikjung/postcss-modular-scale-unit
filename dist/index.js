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

var Ratios = {
  MINOR_SECOND: 1.067,
  MAJOR_SECOND: 1.125,
  MINOR_THIRD: 1.2,
  MAJOR_THIRD: 1.25,
  PERFECT_FOURTH: 1.333,
  AUGMENTED_FOURTH: 1.414,
  PERFECT_FIFTH: 1.5,
  MINOR_SIXTH: 1.6,
  GOLDEN_SECTION: 1.618,
  MAJOR_SIXTH: 1.667,
  MINOR_SEVENTH: 1.778,
  MAJOR_SEVENTH: 1.875,
  OCTAVE: 2,
  MAJOR_TENTH: 2.5,
  MAJOR_ELEVENTH: 2.667,
  MAJOR_TWELFTH: 3,
  DOUBLE_OCTAVE: 4
};

var pow = (0, _ramda.curry)(Math.pow);
var toInt = (0, _ramda.curry)(parseInt)(_ramda.__, 10);
var toInts = (0, _ramda.map)(toInt);
var toFloat = (0, _ramda.curry)(parseFloat);
var toFloats = (0, _ramda.map)(toFloat);
var toFixed = (0, _ramda.invoker)(1, 'toFixed')(3);
var toFixedFloat = (0, _ramda.pipe)(toFixed, toFloat);
var toLowerWords = (0, _ramda.pipe)(_ramda.toLower, (0, _ramda.replace)(/[\W_]+/g, ''));
var sortUp = (0, _ramda.sort)(function (a, b) {
  return a - b;
});
var hasSlash = (0, _ramda.contains)('/');
var isNumber = (0, _ramda.is)(Number);
var isAboveZero = (0, _ramda.both)(isNumber, (0, _ramda.gt)(_ramda.__, 0));
var isAboveOne = (0, _ramda.both)(isNumber, (0, _ramda.gt)(_ramda.__, 1));
var unnestSort = (0, _ramda.pipe)(_ramda.unnest, sortUp);
var fractionToFloat = (0, _ramda.pipe)((0, _ramda.split)('/'), toInts, (0, _ramda.apply)(_ramda.divide), toFloat);

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

  return (0, _ramda.memoize)(function (interval) {
    var intervalRange = sortUp([interval ? interval + Math.sign(interval) : 0, interval ? interval % 1 : 1]);
    var baseStrands = (0, _ramda.map)(function (base) {
      var step = (0, _ramda.pipe)(calc, (0, _ramda.multiply)(base));
      return (0, _ramda.map)(function (i) {
        return step(i);
      }, _ramda.range.apply(undefined, _toConsumableArray(intervalRange)));
    }, sortUp(bases));

    return (0, _ramda.pipe)(unnestSort, (0, _ramda.nth)(interval), toFixedFloat)(baseStrands);
  });
};

function plugin() {
  var _ref2 = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref2$name = _ref2.name;
  var name = _ref2$name === undefined ? 'msu' : _ref2$name;

  var valuePattern = new RegExp('-?\\d+' + name + '\\b', 'g');

  return function (css, result) {
    var msOptions;
    var ms;

    /**
     * Extract ratio and base values from a custom property defined on `:root`.
     * If `--modular-scale` is found, its value will be used to overwrite
     * the default options for the modular scale.
     */
    css.walkDecls(CONFIG_PROPERTY_PATTERN, function (decl) {
      if ((0, _ramda.propEq)('selector', ':root', decl.parent)) {
        (function () {
          var _postcss$list$space = _postcss2.default.list.space(decl.value);

          var _postcss$list$space2 = _toArray(_postcss$list$space);

          var ratio = _postcss$list$space2[0];

          var bases = _postcss$list$space2.slice(1);

          var matchingKey = (0, _ramda.find)(function (val) {
            return toLowerWords(val) === toLowerWords(ratio);
          }, (0, _ramda.keys)(Ratios));

          ratio = Ratios[matchingKey] || ratio;
          msOptions = (0, _ramda.evolve)({
            /**
             * If `ratio` appears as a fraction string:
             * convert the fraction string to a float,
             * else, parse the raw value as a float.
             */
            ratio: (0, _ramda.ifElse)(hasSlash, fractionToFloat, toFloat),
            /**
             * If `bases` has a length of elements:
             * convert all of them to floats,
             * else, default to an array of `1`
             */
            bases: (0, _ramda.ifElse)(_ramda.length, toFloats, function () {
              return [1];
            })
          }, {
            ratio: ratio,
            bases: bases
          });
        })();
      }
    });

    ms = new ModularScale(msOptions);

    /**
     * Replace any CSS values using the special unit with numbers resulting from
     * the modular scale instance.
     */
    css.replaceValues(valuePattern, { fast: name }, function (str) {
      return ms(toInt(str));
    });
  };
}

exports.default = _postcss2.default.plugin(PLUGIN_NAME, plugin);
