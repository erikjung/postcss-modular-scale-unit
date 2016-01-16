'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _modularScale = require('modular-scale');

var _modularScale2 = _interopRequireDefault(_modularScale);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Pattern to match values for the `--modular-scale` property
 *
 * - Matches <number> ratios: 1.618
 * - Matches <ratio> ratios: 4/3
 * - Matches ratios followed by one <integer> base: 1.618 1
 * - Matches ratios followed by many <integer> bases: 1.618 1 2
 */

var CONFIG_VALUE_PATTERN = /^((?:\d+[\.|\/])?\d+)(\s(?:\s?\d*\.?\d+)+)?$/;
var CONFIG_PROPERTY_PATTERN = /^--modular-scale$/;

var splitOnSpace = (0, _ramda.split)(' ');
var splitOnSlash = (0, _ramda.split)('/');
var ratioToDecimal = (0, _ramda.pipe)(splitOnSlash, (0, _ramda.map)(function (n) {
  return parseInt(n, 10);
}), (0, _ramda.apply)(_ramda.divide), (0, _ramda.curry)(function (n) {
  return n.toPrecision(4);
}), (0, _ramda.curry)(function (n) {
  return parseFloat(n);
}));

function plugin() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$name = _ref.name;
  var name = _ref$name === undefined ? 'msu' : _ref$name;

  var isRootSelector = _ramda2.default.propEq('selector', ':root');
  var msOptions = {};
  var ms;

  /**
   * --msu-bases, --msu-ratios
   */

  function setScaleOptionLegacy(decl) {
    var propPattern = new RegExp('^--' + name + '-(\\w+)');

    var _match = (0, _ramda.match)(propPattern, decl.prop);

    var _match2 = _slicedToArray(_match, 2);

    var propKey = _match2[1];

    if (propKey) {
      msOptions[propKey] = splitOnSpace(decl.value);
    }
  }

  /**
   * --modular-scale
   */

  function setScaleOption(decl) {
    var _match3 = (0, _ramda.match)(CONFIG_VALUE_PATTERN, decl.value);

    var _match4 = _slicedToArray(_match3, 3);

    var ratios = _match4[1];
    var _match4$ = _match4[2];
    var bases = _match4$ === undefined ? '1' : _match4$;

    if ((0, _ramda.contains)('/', ratios)) {
      ratios = (0, _ramda.toString)(ratioToDecimal(ratios));
    }
    bases = splitOnSpace(bases);
    ratios = splitOnSpace(ratios);
    msOptions = { bases: bases, ratios: ratios };
  }

  return function (css, result) {
    /**
     * Extract ratios and bases from custom properties defined on `:root`.
     * If `--msu-ratios` or `--msu-bases` properties are found, their values
     * will be used to overwrite the default options for the modular scale.
     *
     * TODO: Deprecate support of these properties.
     */

    css.walkDecls(new RegExp('^--' + name + '-(\\w+)'), function (decl) {
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

    ms = new _modularScale2.default(msOptions);

    css.replaceValues(new RegExp('-?\\d+' + name + '\\b', 'g'), { fast: name }, function (str) {
      return ms(parseInt(str, 10));
    });
  };
}

exports.default = _postcss2.default.plugin('postcss-modular-scale-unit', plugin);
