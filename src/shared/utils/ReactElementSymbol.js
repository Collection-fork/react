/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactElementSymbol
 * @flow
 */

'use strict';
// 用于标记ReactElement类型的Symbol。如果没有原生的Symbol或者polyfill，那么就用一个普通的数字来代替，以提高性能。
// 0xeac7 = 60167
// The Symbol used to tag the ReactElement type. If there is no native Symbol
// nor polyfill, then a plain number is used for performance.
var REACT_ELEMENT_TYPE =
  (typeof Symbol === 'function' && Symbol.for && Symbol.for('react.element')) ||
  0xeac7;

module.exports = REACT_ELEMENT_TYPE;
