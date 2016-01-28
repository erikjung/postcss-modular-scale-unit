'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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
var toInt = (0, _ramda.curry)(parseInt, _ramda.__)(10);
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
var parseFloats = (0, _ramda.pipe)((0, _ramda.split)(' '), (0, _ramda.reject)(_ramda.isEmpty), (0, _ramda.map)(toFloat));
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

  var propPattern = new RegExp('^--' + name + '-(\\w+)');
  var msOptions;
  var ms;

  /**
   * --msu-bases, --msu-ratios
   */

  function setScaleOptionLegacy(decl) {
    var _match = (0, _ramda.match)(propPattern, decl.prop);

    var _match2 = _slicedToArray(_match, 2);

    var propKey = _match2[1];

    var ratio;
    var bases;

    switch (propKey) {
      case 'ratios':
        ratio = toFloat(decl.value);
        break;
      case 'bases':
        bases = parseFloats(decl.value);
        break;
      default:
        break;
    }
    msOptions = { bases: bases, ratio: ratio };
  }

  /**
   * --modular-scale
   */

  function setScaleOption(decl) {
    var _postcss$list$space = _postcss2.default.list.space(decl.value);

    var _postcss$list$space2 = _toArray(_postcss$list$space);

    var ratio = _postcss$list$space2[0];

    var bases = _postcss$list$space2.slice(1);

    if ((0, _ramda.contains)('/', ratio)) {
      ratio = fractionToFloat(ratio);
    } else {
      ratio = toFloat(ratio);
    }

    if (!bases.length) {
      bases.push(1);
    }

    bases = (0, _ramda.map)(toFloat, bases);
    msOptions = { bases: bases, ratio: ratio };
  }

  return function (css, result) {
    /**
     * Extract ratios and bases from custom properties defined on `:root`.
     * If `--msu-ratios` or `--msu-bases` properties are found, their values
     * will be used to overwrite the default options for the modular scale.
     *
     * TODO: Deprecate support of these properties.
     */

    css.walkDecls(propPattern, function (decl) {
      decl.warn(result, 'Setting options via ' + decl.prop + ' will be deprecated soon. Use the --modular-scale property instead.');
      if (isRootSelector(decl.parent)) {
        setScaleOptionLegacy(decl);
      }
    });

    /**
     * Extract ratios and bases from a custom property defined on `:root`.
     * If `--modular-scale` is found, its value will be used to overwrite
     * the default options for the modular scale.
     */

    css.walkDecls(CONFIG_PROPERTY_PATTERN, function (decl) {
      if (isRootSelector(decl.parent)) {
        setScaleOption(decl);
      }
    });

    /**
     * Initialize the modular scale; replace any CSS values using the supplied
     * unit with calculated numbers resulting from the scale.
     */

    ms = new ModularScale(msOptions);

    css.replaceValues(new RegExp('-?\\d+' + name + '\\b', 'g'), { fast: name }, function (str) {
      return ms(parseInt(str, 10));
    });
  };
}

exports.default = _postcss2.default.plugin(PLUGIN_NAME, plugin);
