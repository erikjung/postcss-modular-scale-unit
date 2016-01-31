'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.fractionToFloat = exports.unnestSort = exports.isAboveOne = exports.isAboveZero = exports.isNumber = exports.hasSlash = exports.sortUp = exports.toLowerWords = exports.toFixedFloat = exports.toFixed = exports.toFloats = exports.toFloat = exports.toInts = exports.toInt = exports.pow = undefined;

var _ramda = require('ramda');

var pow = exports.pow = (0, _ramda.curry)(Math.pow);
var toInt = exports.toInt = (0, _ramda.curry)(parseInt)(_ramda.__, 10);
var toInts = exports.toInts = (0, _ramda.map)(toInt);
var toFloat = exports.toFloat = (0, _ramda.curry)(parseFloat);
var toFloats = exports.toFloats = (0, _ramda.map)(toFloat);
var toFixed = exports.toFixed = (0, _ramda.invoker)(1, 'toFixed')(3);
var toFixedFloat = exports.toFixedFloat = (0, _ramda.pipe)(toFixed, toFloat);
var toLowerWords = exports.toLowerWords = (0, _ramda.pipe)(_ramda.toLower, (0, _ramda.replace)(/[\W_]+/g, ''));
var sortUp = exports.sortUp = (0, _ramda.sort)(function (a, b) {
  return a - b;
});
var hasSlash = exports.hasSlash = (0, _ramda.contains)('/');
var isNumber = exports.isNumber = (0, _ramda.is)(Number);
var isAboveZero = exports.isAboveZero = (0, _ramda.both)(isNumber, (0, _ramda.gt)(_ramda.__, 0));
var isAboveOne = exports.isAboveOne = (0, _ramda.both)(isNumber, (0, _ramda.gt)(_ramda.__, 1));
var unnestSort = exports.unnestSort = (0, _ramda.pipe)(_ramda.unnest, sortUp);
var fractionToFloat = exports.fractionToFloat = (0, _ramda.pipe)((0, _ramda.split)('/'), toInts, (0, _ramda.apply)(_ramda.divide), toFloat);