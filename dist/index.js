'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _postcss = require('postcss');

var _postcss2 = _interopRequireDefault(_postcss);

var _modularScale = require('modular-scale');

var _modularScale2 = _interopRequireDefault(_modularScale);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function plugin() {
  return function (css) {
    var msOptions = {};
    var ms;

    /**
     * Extract ratios and bases from custom properties defined on `:root`.
     * If `--msu-ratios` or `--msu-bases` properties are found, their values
     * will be used to overwrite the default options for the modular scale.
     */
    css.walkDecls(function (decl) {
      var parentSelector = decl.parent.selector;

      var _ref = decl.prop.match(/^--msu-(\w+)/) || [];

      var _ref2 = _slicedToArray(_ref, 2);

      var propKey = _ref2[1];

      if (parentSelector === ':root' && propKey) {
        msOptions[propKey] = decl.value.split(' ');
      }
    });

    /**
     * Initialize the modular scale and replace any values using the `msu` unit
     * with numbers resulting from it.
     */
    ms = new _modularScale2.default(msOptions);
    css.replaceValues(/-?\d+msu\b/g, { fast: 'msu' }, function (str) {
      return ms(parseInt(str, 10));
    });
  };
}

exports.default = _postcss2.default.plugin('postcss-modular-scale-unit', plugin);
