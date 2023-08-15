/**
 * Copyright (c) 2013-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactCurrentOwner
 * @flow
 */

'use strict';

/**
 * 引用ReactComponent实例
 */
import type {ReactInstance} from 'ReactInstanceType';

/**
 * Keeps track of the current owner.
 *
 * The current owner is the component who should own any components that are
 * currently being constructed.
 * ReactCurrentOwner用于在React应用中跟踪React组件树中的当前组件
 */

var ReactCurrentOwner = {
  /**
   * @internal
   * @type {ReactComponent}
   */
  current: (null: null | ReactInstance),
};

module.exports = ReactCurrentOwner;
