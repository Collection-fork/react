/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @providesModule ReactElement
 */

"use strict";

// 引入 ReactCurrentOwner
var ReactCurrentOwner = require("ReactCurrentOwner");
// 引入 warning
var warning = require("warning");
// 引入 canDefineProperty 是否有object.defineProperty 方法
var canDefineProperty = require("canDefineProperty");
// 创建一个对象的副本
var hasOwnProperty = Object.prototype.hasOwnProperty;
// 引入 ReactElementSymbol
var REACT_ELEMENT_TYPE = require("ReactElementSymbol");

// 保留属性
var RESERVED_PROPS = {
  key: true,
  ref: true,
  __self: true,
  __source: true
};

var specialPropKeyWarningShown, specialPropRefWarningShown;

function hasValidRef(config) {
  if (__DEV__) {
    if (hasOwnProperty.call(config, "ref")) {
      var getter = Object.getOwnPropertyDescriptor(config, "ref").get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.ref !== undefined;
}

function hasValidKey(config) {
  if (__DEV__) {
    if (hasOwnProperty.call(config, "key")) {
      var getter = Object.getOwnPropertyDescriptor(config, "key").get;
      if (getter && getter.isReactWarning) {
        return false;
      }
    }
  }
  return config.key !== undefined;
}

function defineKeyPropWarningGetter(props, displayName) {
  var warnAboutAccessingKey = function() {
    if (!specialPropKeyWarningShown) {
      specialPropKeyWarningShown = true;
      warning(
        false,
        "%s: `key` is not a prop. Trying to access it will result " +
          "in `undefined` being returned. If you need to access the same " +
          "value within the child component, you should pass it as a different " +
          "prop. (https://fb.me/react-special-props)",
        displayName
      );
    }
  };
  warnAboutAccessingKey.isReactWarning = true;
  Object.defineProperty(props, "key", {
    get: warnAboutAccessingKey,
    configurable: true
  });
}

function defineRefPropWarningGetter(props, displayName) {
  var warnAboutAccessingRef = function() {
    if (!specialPropRefWarningShown) {
      specialPropRefWarningShown = true;
      warning(
        false,
        "%s: `ref` is not a prop. Trying to access it will result " +
          "in `undefined` being returned. If you need to access the same " +
          "value within the child component, you should pass it as a different " +
          "prop. (https://fb.me/react-special-props)",
        displayName
      );
    }
  };
  warnAboutAccessingRef.isReactWarning = true;
  Object.defineProperty(props, "ref", {
    get: warnAboutAccessingRef,
    configurable: true
  });
}

/**
 * Factory method to create a new React element. This no longer adheres to
 * the class pattern, so do not use new to call it. Also, no instanceof check
 * will work. Instead test $$typeof field against Symbol.for('react.element') to check
 * if something is a React Element.
 *
 * @param {*} type
 * @param {*} key
 * @param {string|object} ref
 * @param {*} self A *temporary* helper to detect places where `this` is
  different from the `owner` when React.createElement is called, so that we
  can warn. We want to get rid of owner and replace string `ref`s with arrow
  functions, and as long as `this` and owner are the same, there will be no
  change in behavior.
 * @param {*} source An annotation object (added by a transpiler or otherwise)
 * indicating filename, line number, and/or other information.
 * @param {*} owner
 * @param {*} props
 * @internal
 */
// ai 解释 ref 和 owner 的作用
// 这段注释描述了 React 的一个过渡策略，特别是与 ref 和 owner 有关的部分。为了更好地解释这一点，我们需要回顾一下 React 的历史和当时的背景。
// 在 React 的早期版本中，ref 的处理是基于字符串的。这意味着，当你想要引用一个组件，你会这样做：
// javascript
// Copy code
// <SomeComponent ref="someUniqueString" />
// 然后，你可以使用 this.refs.someUniqueString 来访问该组件。这种方法的主要问题是，它不够灵活，也不是很直观。
// 为了让这个系统更加健壮和可预测，React 团队想要用回调函数来代替字符串 refs。这样，你可以这么写：
// javascript
// Copy code
// <SomeComponent ref={(componentInstance) => { this.someUniqueRef = componentInstance; }} />
// 这种方法提供了更多的灵活性，并使得 refs 的行为更加明确。
// 现在，回到你提到的注释。React 团队在进行这种变更时希望提供一个过渡期，确保开发者了解正在发生的变化。owner 是 React 内部用来跟踪组件的创建者的概念。在 createElement 时，如果 this 和 owner 不一样，可能意味着有一些奇怪的事情发生了，这可能与字符串 refs 的使用方式有关。
// 这段注释就是为了这个检测机制。React 团队希望能够在变更 refs 机制之前，为开发者提供足够的警告和信息，使他们了解即将发生的变化，并为之做好准备。
// 最后，值得注意的是，从 React 16 开始，字符串 refs 已经被认为是遗留的，并且不推荐使用，而函数 refs 和 React.createRef() 方法成为了推荐的做法。

// ai 解释 An annotation object (added by a transpiler or otherwise) indicating filename, line number, and/or other information.
// 这个参数的作用是标识这个元素的源信息。它的值是一个对象，这个对象包含了这个元素的源信息，比如文件名、行号等等。

var ReactElement = function(type, key, ref, self, source, owner, props) {
  // ai 解释 ReactElement 的作用
  // 这个函数的作用是创建一个 ReactElement，它是 React 的最小单元，用来描述一个 DOM 节点或者一个组件。
  // ReactElement 是一个对象，它有一个 $$typeof 属性，用来标识这个对象是一个 ReactElement。这个属性的值是一个 Symbol，它的值是 Symbol.for('react.element')。
  // ReactElement 还有一个 type 属性，用来标识这个元素的类型。它的值可以是一个字符串，也可以是一个函数。如果是字符串，那么它表示一个 DOM 节点，比如 div、span 等等。如果是函数，那么它表示一个组件。
  // ReactElement 还有一个 key 属性，用来标识这个元素的唯一性。它的值可以是字符串，也可以是数字。它的作用是帮助 React 识别哪些元素发生了变化，比如被添加或者被删除了。
  // ReactElement 还有一个 ref 属性，用来标识这个元素的引用。它的值可以是字符串，也可以是函数。它的作用是帮助 React 识别这个元素，比如在组件中使用 this.refs.someRef 来引用这个元素。
  // ReactElement 还有一个 props 属性，用来标识这个元素的属性。它的值是一个对象，这个对象包含了这个元素的所有属性，比如 className、style 等等。
  // ReactElement 还有一个 _owner 属性，用来标识这个元素的所有者。它的值是一个对象，这个对象包含了这个元素的所有者的信息，比如组件的实例等等。

  var element = {
    // This tag allow us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,

    // Built-in properties that belong on the element
    type: type,
    key: key,
    ref: ref,
    props: props,

    // Record the component responsible for creating this element.
    _owner: owner
  };

  if (__DEV__) {
    // The validation flag is currently mutative. We put it on
    // an external backing store so that we can freeze the whole object.
    // This can be replaced with a WeakMap once they are implemented in
    // commonly used development environments.
    // 开发环境定义一个 _store 属性
    element._store = {};

    // To make comparing ReactElements easier for testing purposes, we make
    // the validation flag non-enumerable (where possible, which should
    // include every environment we run tests in), so the test framework
    // ignores it.
    if (canDefineProperty) {
      Object.defineProperty(element._store, "validated", {
        configurable: false,
        enumerable: false,
        writable: true,
        value: false
      });
      // self and source are DEV only properties.
      Object.defineProperty(element, "_self", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: self
      });
      // Two elements created in two different places should be considered
      // equal for testing purposes and therefore we hide it from enumeration.
      Object.defineProperty(element, "_source", {
        configurable: false,
        enumerable: false,
        writable: false,
        value: source
      });
    } else {
      element._store.validated = false;
      element._self = self;
      element._source = source;
    }
    // ai 解释 Object.freeze
    // 性能优化：当属性或状态是不可变的，React 可以通过简单地检查引用是否发生变化来避免不必要的重新渲染。这是 React 的 PureComponent 和 shouldComponentUpdate 生命周期方法的工作方式。这种浅层比较比深层比较更高效。
    // 避免意外的副作用：如果组件的属性或状态可以被随意修改，那么可能会导致不可预测的副作用和应用状态的混乱。确保对象是冻结的可以避免这种情况。
    // 使行为更加可预测：在函数式编程中，不变性是一个核心概念。保持数据的不变性可以使应用的状态和数据流更加可预测。
    // 提供更好的开发者体验：当试图修改一个冻结的对象时，JavaScript 会抛出一个错误（在严格模式下）。这为开发者提供了及时的反馈，帮助他们识别和避免不良的编程实践。
    if (Object.freeze) {
      Object.freeze(element.props);
      Object.freeze(element);
    }
  }

  return element;
};

/**
 * Create and return a new ReactElement of the given type.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.createelement
 */
ReactElement.createElement = function(type, config, children) {
  var propName;

  // Reserved names are extracted
  var props = {};

  var key = null;
  var ref = null;
  var self = null;
  var source = null;

  if (config != null) {
    if (hasValidRef(config)) {
      ref = config.ref;
    }
    if (hasValidKey(config)) {
      key = "" + config.key;
    }

    self = config.__self === undefined ? null : config.__self;
    source = config.__source === undefined ? null : config.__source;
    // Remaining properties are added to a new props object
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        props[propName] = config[propName];
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  // 如果子组件内嵌套一个标签那么 children 就是 children ,如果子组件内嵌套多个标签那么 children 就是一个数组
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    if (__DEV__) {
      if (Object.freeze) {
        Object.freeze(childArray);
      }
    }
    props.children = childArray;
  }

  // Resolve default props
  if (type && type.defaultProps) {
    var defaultProps = type.defaultProps;
    for (propName in defaultProps) {
      if (props[propName] === undefined) {
        props[propName] = defaultProps[propName];
      }
    }
  }
  if (__DEV__) {
    if (key || ref) {
      if (
        typeof props.$$typeof === "undefined" ||
        props.$$typeof !== REACT_ELEMENT_TYPE
      ) {
        var displayName =
          typeof type === "function"
            ? type.displayName || type.name || "Unknown"
            : type;
        if (key) {
          defineKeyPropWarningGetter(props, displayName);
        }
        if (ref) {
          defineRefPropWarningGetter(props, displayName);
        }
      }
    }
  }
  return ReactElement(
    type,
    key,
    ref,
    self,
    source,
    ReactCurrentOwner.current,
    props
  );
};

/**
 * Return a function that produces ReactElements of a given type.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.createfactory
 */
ReactElement.createFactory = function(type) {
  var factory = ReactElement.createElement.bind(null, type);
  // Expose the type on the factory and the prototype so that it can be
  // easily accessed on elements. E.g. `<Foo />.type === Foo`.
  // This should not be named `constructor` since this may not be the function
  // that created the element, and it may not even be a constructor.
  // Legacy hook TODO: Warn if this is accessed
  factory.type = type;
  return factory;
};

ReactElement.cloneAndReplaceKey = function(oldElement, newKey) {
  var newElement = ReactElement(
    oldElement.type,
    newKey,
    oldElement.ref,
    oldElement._self,
    oldElement._source,
    oldElement._owner,
    oldElement.props
  );

  return newElement;
};

/**
 * Clone and return a new ReactElement using element as the starting point.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.cloneelement
 */
ReactElement.cloneElement = function(element, config, children) {
  var propName;

  // Original props are copied
  var props = Object.assign({}, element.props);

  // Reserved names are extracted
  var key = element.key;
  var ref = element.ref;
  // Self is preserved since the owner is preserved.
  var self = element._self;
  // Source is preserved since cloneElement is unlikely to be targeted by a
  // transpiler, and the original source is probably a better indicator of the
  // true owner.
  var source = element._source;

  // Owner will be preserved, unless ref is overridden
  var owner = element._owner;

  if (config != null) {
    if (hasValidRef(config)) {
      // Silently steal the ref from the parent.
      ref = config.ref;
      owner = ReactCurrentOwner.current;
    }
    if (hasValidKey(config)) {
      key = "" + config.key;
    }

    // Remaining properties override existing props
    var defaultProps;
    if (element.type && element.type.defaultProps) {
      defaultProps = element.type.defaultProps;
    }
    for (propName in config) {
      if (
        hasOwnProperty.call(config, propName) &&
        !RESERVED_PROPS.hasOwnProperty(propName)
      ) {
        if (config[propName] === undefined && defaultProps !== undefined) {
          // Resolve default props
          props[propName] = defaultProps[propName];
        } else {
          props[propName] = config[propName];
        }
      }
    }
  }

  // Children can be more than one argument, and those are transferred onto
  // the newly allocated props object.
  var childrenLength = arguments.length - 2;
  if (childrenLength === 1) {
    props.children = children;
  } else if (childrenLength > 1) {
    var childArray = Array(childrenLength);
    for (var i = 0; i < childrenLength; i++) {
      childArray[i] = arguments[i + 2];
    }
    props.children = childArray;
  }

  return ReactElement(element.type, key, ref, self, source, owner, props);
};

/**
 * Verifies the object is a ReactElement.
 * See https://facebook.github.io/react/docs/top-level-api.html#react.isvalidelement
 * @param {?object} object
 * @return {boolean} True if `object` is a valid component.
 * @final
 */
ReactElement.isValidElement = function(object) {
  return (
    typeof object === "object" &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
};

module.exports = ReactElement;
