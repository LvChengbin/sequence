(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Sequence = factory());
}(this, (function () { 'use strict';

function _typeof(obj) {
  if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
    _typeof = function (obj) {
      return typeof obj;
    };
  } else {
    _typeof = function (obj) {
      return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    };
  }

  return _typeof(obj);
}

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
}

function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

function _possibleConstructorReturn(self, call) {
  if (call && (typeof call === "object" || typeof call === "function")) {
    return call;
  }

  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return self;
}

var isAsyncFunction = (function (fn) {
  return {}.toString.call(fn) === '[object AsyncFunction]';
});

var isFunction = (function (fn) {
  return {}.toString.call(fn) === '[object Function]' || isAsyncFunction(fn);
});

var isPromise = (function (p) {
  return p && isFunction(p.then);
});

var Promise$1 =
/*#__PURE__*/
function () {
  function Promise(fn) {
    _classCallCheck(this, Promise);

    if (!(this instanceof Promise)) {
      throw new TypeError(this + ' is not a promise ');
    }

    if (!isFunction(fn)) {
      throw new TypeError('Promise resolver ' + fn + ' is not a function');
    }

    this['[[PromiseStatus]]'] = 'pending';
    this['[[PromiseValue]]'] = null;
    this['[[PromiseThenables]]'] = [];

    try {
      fn(promiseResolve.bind(null, this), promiseReject.bind(null, this));
    } catch (e) {
      if (this['[[PromiseStatus]]'] === 'pending') {
        promiseReject.bind(null, this)(e);
      }
    }
  }

  _createClass(Promise, [{
    key: "then",
    value: function then(resolved, rejected) {
      var promise = new Promise(function () {});
      this['[[PromiseThenables]]'].push({
        resolve: isFunction(resolved) ? resolved : null,
        reject: isFunction(rejected) ? rejected : null,
        called: false,
        promise: promise
      });
      if (this['[[PromiseStatus]]'] !== 'pending') promiseExecute(this);
      return promise;
    }
  }, {
    key: "catch",
    value: function _catch(reject) {
      return this.then(null, reject);
    }
  }]);
  return Promise;
}();

Promise$1.resolve = function (value) {
  if (!isFunction(this)) {
    throw new TypeError('Promise.resolve is not a constructor');
  }
  /**
   * @todo
   * check if the value need to return the resolve( value )
   */


  return new Promise$1(function (resolve) {
    resolve(value);
  });
};

Promise$1.reject = function (reason) {
  if (!isFunction(this)) {
    throw new TypeError('Promise.reject is not a constructor');
  }

  return new Promise$1(function (resolve, reject) {
    reject(reason);
  });
};

Promise$1.all = function (promises) {
  var rejected = false;
  var res = [];
  return new Promise$1(function (resolve, reject) {
    var remaining = 0;

    var then = function then(p, i) {
      if (!isPromise(p)) {
        p = Promise$1.resolve(p);
      }

      p.then(function (value) {
        res[i] = value;

        if (--remaining === 0) {
          resolve(res);
        }
      }, function (reason) {
        if (!rejected) {
          reject(reason);
          rejected = true;
        }
      });
    };

    var i = 0;
    var _iteratorNormalCompletion = true;
    var _didIteratorError = false;
    var _iteratorError = undefined;

    try {
      for (var _iterator = promises[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
        var _promise = _step.value;
        then(_promise, remaining = i++);
      }
    } catch (err) {
      _didIteratorError = true;
      _iteratorError = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion && _iterator.return != null) {
          _iterator.return();
        }
      } finally {
        if (_didIteratorError) {
          throw _iteratorError;
        }
      }
    }
  });
};

Promise$1.race = function (promises) {
  var resolved = false;
  var rejected = false;
  return new Promise$1(function (resolve, reject) {
    function onresolved(value) {
      if (!resolved && !rejected) {
        resolve(value);
        resolved = true;
      }
    }

    function onrejected(reason) {
      if (!resolved && !rejected) {
        reject(reason);
        rejected = true;
      }
    }

    var _iteratorNormalCompletion2 = true;
    var _didIteratorError2 = false;
    var _iteratorError2 = undefined;

    try {
      for (var _iterator2 = promises[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
        var _promise2 = _step2.value;

        if (!isPromise(_promise2)) {
          _promise2 = Promise$1.resolve(_promise2);
        }

        _promise2.then(onresolved, onrejected);
      }
    } catch (err) {
      _didIteratorError2 = true;
      _iteratorError2 = err;
    } finally {
      try {
        if (!_iteratorNormalCompletion2 && _iterator2.return != null) {
          _iterator2.return();
        }
      } finally {
        if (_didIteratorError2) {
          throw _iteratorError2;
        }
      }
    }
  });
};

function promiseExecute(promise) {
  var thenable, p;
  if (promise['[[PromiseStatus]]'] === 'pending') return;
  if (!promise['[[PromiseThenables]]'].length) return;

  var then = function then(p, t) {
    p.then(function (value) {
      promiseResolve(t.promise, value);
    }, function (reason) {
      promiseReject(t.promise, reason);
    });
  };

  while (promise['[[PromiseThenables]]'].length) {
    thenable = promise['[[PromiseThenables]]'].shift();
    if (thenable.called) continue;
    thenable.called = true;

    if (promise['[[PromiseStatus]]'] === 'resolved') {
      if (!thenable.resolve) {
        promiseResolve(thenable.promise, promise['[[PromiseValue]]']);
        continue;
      }

      try {
        p = thenable.resolve.call(null, promise['[[PromiseValue]]']);
      } catch (e) {
        then(Promise$1.reject(e), thenable);
        continue;
      }

      if (p && (typeof p === 'function' || _typeof(p) === 'object') && p.then) {
        then(p, thenable);
        continue;
      }
    } else {
      if (!thenable.reject) {
        promiseReject(thenable.promise, promise['[[PromiseValue]]']);
        continue;
      }

      try {
        p = thenable.reject.call(null, promise['[[PromiseValue]]']);
      } catch (e) {
        then(Promise$1.reject(e), thenable);
        continue;
      }

      if ((typeof p === 'function' || _typeof(p) === 'object') && p.then) {
        then(p, thenable);
        continue;
      }
    }

    promiseResolve(thenable.promise, p);
  }

  return promise;
}

function promiseResolve(promise, value) {
  if (!(promise instanceof Promise$1)) {
    return new Promise$1(function (resolve) {
      resolve(value);
    });
  }

  if (promise['[[PromiseStatus]]'] !== 'pending') return;

  if (value === promise) {
    /**
     * thie error should be thrown, defined ES6 standard
     * it would be thrown in Chrome but not in Firefox or Safari
     */
    throw new TypeError('Chaining cycle detected for promise #<Promise>');
  }

  if (value !== null && (typeof value === 'function' || _typeof(value) === 'object')) {
    var then;

    try {
      then = value.then;
    } catch (e) {
      return promiseReject(promise, e);
    }

    if (typeof then === 'function') {
      then.call(value, promiseResolve.bind(null, promise), promiseReject.bind(null, promise));
      return;
    }
  }

  promise['[[PromiseStatus]]'] = 'resolved';
  promise['[[PromiseValue]]'] = value;
  promiseExecute(promise);
}

function promiseReject(promise, value) {
  if (!(promise instanceof Promise$1)) {
    return new Promise$1(function (resolve, reject) {
      reject(value);
    });
  }

  promise['[[PromiseStatus]]'] = 'rejected';
  promise['[[PromiseValue]]'] = value;
  promiseExecute(promise);
}

var isString = (function (str) {
  return typeof str === 'string' || str instanceof String;
});

var isRegExp = (function (reg) {
  return {}.toString.call(reg) === '[object RegExp]';
});

var EventEmitter =
/*#__PURE__*/
function () {
  function EventEmitter() {
    _classCallCheck(this, EventEmitter);
    this.__listeners = {};
  }

  _createClass(EventEmitter, [{
    key: "alias",
    value: function alias(name, to) {
      this[name] = this[to].bind(this);
    }
  }, {
    key: "on",
    value: function on(evt, handler) {
      var listeners = this.__listeners;
      listeners[evt] ? listeners[evt].push(handler) : listeners[evt] = [handler];
      return this;
    }
  }, {
    key: "once",
    value: function once(evt, handler) {
      var _this = this;

      var _handler = function _handler() {
        for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
          args[_key] = arguments[_key];
        }

        handler.apply(_this, args);

        _this.removeListener(evt, _handler);
      };

      return this.on(evt, _handler);
    }
  }, {
    key: "removeListener",
    value: function removeListener(evt, handler) {
      var listeners = this.__listeners,
          handlers = listeners[evt];

      if (!handlers || !handlers.length) {
        return this;
      }

      for (var i = 0; i < handlers.length; i += 1) {
        handlers[i] === handler && (handlers[i] = null);
      }

      setTimeout(function () {
        for (var _i = 0; _i < handlers.length; _i += 1) {
          handlers[_i] || handlers.splice(_i--, 1);
        }
      }, 0);
      return this;
    }
  }, {
    key: "emit",
    value: function emit(evt) {
      var handlers = this.__listeners[evt];

      if (handlers) {
        for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          args[_key2 - 1] = arguments[_key2];
        }

        for (var i = 0, l = handlers.length; i < l; i += 1) {
          var _handlers$i;

          handlers[i] && (_handlers$i = handlers[i]).call.apply(_handlers$i, [this].concat(args));
        }

        return true;
      }

      return false;
    }
  }, {
    key: "removeAllListeners",
    value: function removeAllListeners(rule) {
      var checker;

      if (isString(rule)) {
        checker = function checker(name) {
          return rule === name;
        };
      } else if (isFunction(rule)) {
        checker = rule;
      } else if (isRegExp(rule)) {
        checker = function checker(name) {
          rule.lastIndex = 0;
          return rule.test(name);
        };
      }

      var listeners = this.__listeners;

      for (var attr in listeners) {
        if (checker(attr)) {
          listeners[attr] = null;
          delete listeners[attr];
        }
      }
    }
  }]);
  return EventEmitter;
}();

function isUndefined () {
  return arguments.length > 0 && typeof arguments[0] === 'undefined';
}

function config() {
  return {
    promises: [],
    results: [],
    index: 0,
    steps: [],
    busy: false,
    promise: Promise$1.resolve()
  };
}
/**
 * new Sequence( false, [] )
 * new Sequence( [] )
 */


var Sequence =
/*#__PURE__*/
function (_EventEmitter) {
  _inherits(Sequence, _EventEmitter);

  function Sequence(steps) {
    var _this;

    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    _classCallCheck(this, Sequence);
    _this = _possibleConstructorReturn(this, (Sequence.__proto__ || Object.getPrototypeOf(Sequence)).call(this));
    _this.__resolve = null;
    _this.running = false;
    _this.suspended = false;
    _this.suspendTimeout = null;
    _this.interval = options.interval || 0;
    Object.assign(_assertThisInitialized(_this), config());
    steps && _this.append(steps);
    options.autorun !== false && setTimeout(function () {
      _this.run();
    }, 0);
    return _this;
  }
  /**
   * to append new steps to the sequence
   */


  _createClass(Sequence, [{
    key: "append",
    value: function append(steps) {
      var dead = this.index >= this.steps.length;

      if (isFunction(steps)) {
        this.steps.push(steps);
      } else {
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var _step2 = _step.value;
            this.steps.push(_step2);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return != null) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      this.running && dead && this.next(true);
    }
  }, {
    key: "go",
    value: function go(n) {
      if (isUndefined(n)) return;
      this.index = n;

      if (this.index > this.steps.length) {
        this.index = this.steps.length;
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      Object.assign(this, config());
    }
  }, {
    key: "next",
    value: function next() {
      var _this2 = this;

      var inner = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

      if (!inner && this.running) {
        console.warn('Please do not call next() while the sequence is running.');
        return Promise$1.reject(new Sequence.Error({
          errno: 2,
          errmsg: 'Cannot call next during the sequence is running.'
        }));
      }
      /**
       * If there is a step that is running,
       * return the promise instance of the running step.
       */


      if (this.busy || this.suspended) return this.promise;
      /**
       * If already reached the end of the sequence,
       * return a rejected promise instance with a false as its reason.
       */

      if (!this.steps[this.index]) {
        return Promise$1.reject(new Sequence.Error({
          errno: 1,
          errmsg: 'no more step can be executed.'
        }));
      }

      this.busy = true;
      return this.promise = this.promise.then(function () {
        var step = _this2.steps[_this2.index];
        var promise = step(_this2.results[_this2.results.length - 1], _this2.index, _this2.results);
        /**
         * if the step function doesn't return a promise instance,
         * create a resolved promise instance with the returned value as its value
         */

        if (!isPromise(promise)) {
          promise = Promise$1.resolve(promise);
        }

        return promise.then(function (value) {
          var result = {
            status: Sequence.SUCCEEDED,
            index: _this2.index,
            value: value,
            time: +new Date()
          };

          _this2.results.push(result);

          _this2.emit('success', result, _this2.index, _this2);

          return result;
        }).catch(function (reason) {
          var result = {
            status: Sequence.FAILED,
            index: _this2.index,
            reason: reason,
            time: +new Date()
          };

          _this2.results.push(result);

          _this2.emit('failed', result, _this2.index, _this2);

          return result;
        }).then(function (result) {
          _this2.index++;
          _this2.busy = false;

          if (!_this2.steps[_this2.index]) {
            _this2.emit('end', _this2.results, _this2);
          } else {
            setTimeout(function () {
              _this2.running && _this2.next(true);
            }, _this2.interval);
          }

          return result;
        });
      });
    }
  }, {
    key: "run",
    value: function run() {
      if (this.running) return;
      this.running = true;
      this.next(true);
    }
  }, {
    key: "stop",
    value: function stop() {
      this.running = false;
    }
  }, {
    key: "suspend",
    value: function suspend() {
      var _this3 = this;

      var duration = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1000;
      this.suspended = true;
      this.suspendTimeout && clearTimeout(this.suspendTimeout);
      this.suspendTimeout = setTimeout(function () {
        _this3.suspended = false;
        _this3.running && _this3.next(true);
      }, duration);
    }
  }]);
  return Sequence;
}(EventEmitter);

Sequence.SUCCEEDED = 1;
Sequence.FAILED = 0;

Sequence.all = function (steps) {
  var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var sequence = new Sequence(steps, {
    interval: interval
  });
  return new Promise$1(function (resolve, reject) {
    sequence.on('end', function (results) {
      resolve(results);
    });
    sequence.on('failed', function () {
      sequence.stop();
      reject(sequence.results);
    });
  });
};

Sequence.chain = function (steps) {
  var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var sequence = new Sequence(steps, {
    interval: interval
  });
  return new Promise$1(function (resolve) {
    sequence.on('end', function (results) {
      resolve(results);
    });
  });
};

Sequence.any = function (steps) {
  var interval = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
  var sequence = new Sequence(steps, {
    interval: interval
  });
  return new Promise$1(function (resolve, reject) {
    sequence.on('success', function () {
      resolve(sequence.results);
      sequence.stop();
    });
    sequence.on('end', function () {
      reject(sequence.results);
    });
  });
};

Sequence.Error =
/*#__PURE__*/
function () {
  function _class(options) {
    _classCallCheck(this, _class);
    Object.assign(this, options);
  }

  return _class;
}();

return Sequence;

})));
