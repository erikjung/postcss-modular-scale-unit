'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _ModularScale = require('./ModularScale');

var _ModularScale2 = _interopRequireDefault(_ModularScale);

var _ramda = require('ramda');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

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

function plugin() {
  var _ref = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

  var _ref$name = _ref.name;
  var name = _ref$name === undefined ? 'msu' : _ref$name;

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
            return (0, _utils.toLowerWords)(val) === (0, _utils.toLowerWords)(ratio);
          }, (0, _ramda.keys)(Ratios));

          ratio = Ratios[matchingKey] || ratio;
          msOptions = (0, _ramda.evolve)({
            /**
             * If `ratio` appears as a fraction string:
             * convert the fraction string to a float,
             * else, parse the raw value as a float.
             */
            ratio: (0, _ramda.ifElse)(_utils.hasSlash, _utils.fractionToFloat, _utils.toFloat),
            /**
             * If `bases` has a length of elements:
             * convert all of them to floats,
             * else, default to an array of `1`
             */
            bases: (0, _ramda.ifElse)(_ramda.length, _utils.toFloats, function () {
              return [1];
            })
          }, {
            ratio: ratio,
            bases: bases
          });
        })();
      }
    });

    ms = new _ModularScale2.default(msOptions);

    /**
     * Replace any CSS values using the special unit with numbers resulting from
     * the modular scale instance.
     */
    css.replaceValues(valuePattern, { fast: name }, function (str) {
      return ms((0, _utils.toInt)(str));
    });
  };
}

exports.default = _postcss2.default.plugin(PLUGIN_NAME, plugin);