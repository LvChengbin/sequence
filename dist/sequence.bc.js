(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Promise = factory());
}(this, (function () { 'use strict';

var checks = {
    promise: function promise(p) {
        return p && checks.function(p.then);
    },
    function: function _function(f) {
        var type = {}.toString.call(f).toLowerCase();
        return type === '[object function]' || type === '[object asyncfunction]';
    }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();









var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
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
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};

var Promise$1 = function () {
    function Promise(fn) {
        classCallCheck(this, Promise);

        if (!(this instanceof Promise)) {
            throw new TypeError(this + ' is not a promise ');
        }

        if (!checks.function(fn)) {
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

    createClass(Promise, [{
        key: 'then',
        value: function then(resolved, rejected) {
            var promise = new Promise(function () {});
            this['[[PromiseThenables]]'].push({
                resolve: checks.function(resolved) ? resolved : null,
                reject: checks.function(rejected) ? rejected : null,
                called: false,
                promise: promise
            });
            if (this['[[PromiseStatus]]'] !== 'pending') promiseExecute(this);
            return promise;
        }
    }, {
        key: 'catch',
        value: function _catch(reject) {
            return this.then(null, reject);
        }
    }]);
    return Promise;
}();

Promise$1.resolve = function (value) {
    if (!checks.function(this)) {
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
    if (!checks.function(this)) {
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
            if (!checks.promise(p)) {
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
                var promise = _step.value;

                then(promise, remaining = i++);
            }
        } catch (err) {
            _didIteratorError = true;
            _iteratorError = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion && _iterator.return) {
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
                var promise = _step2.value;

                if (!checks.promise(promise)) {
                    promise = Promise$1.resolve(promise);
                }
                promise.then(onresolved, onrejected);
            }
        } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
        } finally {
            try {
                if (!_iteratorNormalCompletion2 && _iterator2.return) {
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
            if (p && (typeof p === 'function' || (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object') && p.then) {
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
            if ((typeof p === 'function' || (typeof p === 'undefined' ? 'undefined' : _typeof(p)) === 'object') && p.then) {
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

    if (value !== null && (typeof value === 'function' || (typeof value === 'undefined' ? 'undefined' : _typeof(value)) === 'object')) {
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

var checks$2 = {
    string: function string(s) {
        return typeof s === 'string' || s instanceof String;
    },
    function: function _function(f) {
        var type = {}.toString.call(f).toLowerCase();
        return type === '[object function]' || type === '[object asyncfunction]';
    },
    promise: function promise(p) {
        return p && checks$2.function(p.then);
    },
    boolean: function boolean(s) {
        return typeof s === 'boolean';
    },
    regexp: function regexp(obj) {
        return {}.toString.call(obj).toLowerCase() === '[object regexp]';
    }
};

var EventEmitter = function () {
    function EventEmitter() {
        classCallCheck(this, EventEmitter);

        this.__listeners = {};
    }

    createClass(EventEmitter, [{
        key: '$alias',
        value: function $alias(name, to) {
            this[name] = this[to].bind(this);
        }
    }, {
        key: '$on',
        value: function $on(evt, handler) {
            var listeners = this.__listeners;
            listeners[evt] ? listeners[evt].push(handler) : listeners[evt] = [handler];
            return this;
        }
    }, {
        key: '$once',
        value: function $once(evt, handler) {
            var _this = this;

            var _handler = function _handler() {
                for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
                    args[_key] = arguments[_key];
                }

                handler.apply(_this, args);
                _this.$removeListener(evt, _handler);
            };
            return this.$on(evt, _handler);
        }
    }, {
        key: '$removeListener',
        value: function $removeListener(evt, handler) {
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
        key: '$emit',
        value: function $emit(evt) {
            var handlers = this.__listeners[evt];
            if (handlers) {
                for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                    args[_key2 - 1] = arguments[_key2];
                }

                for (var i = 0, l = handlers.length; i < l; i += 1) {
                    handlers[i] && handlers[i].apply(handlers, args);
                }
                return true;
            }
            return false;
        }
    }, {
        key: '$removeAllListeners',
        value: function $removeAllListeners(rule) {
            var checker = void 0;
            if (checks$2.string(rule)) {
                checker = function checker(name) {
                    return rule === name;
                };
            } else if (checks$2.function(rule)) {
                checker = rule;
            } else if (checks$2.regexp(rule)) {
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

var Sequence = function (_EventEmitter) {
    inherits(Sequence, _EventEmitter);

    function Sequence() {
        var autorun = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : true;
        var steps = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : [];
        classCallCheck(this, Sequence);

        var _this = possibleConstructorReturn(this, (Sequence.__proto__ || Object.getPrototypeOf(Sequence)).call(this));

        _this.$alias('on', '$on');
        _this.$alias('once', '$once');
        _this.$alias('emit', '$emit');
        _this.$alias('removeListener', '$removeListener');
        _this.$alias('removeAllListeners', '$removeAllListeners');

        if (!checks$2.boolean(autorun)) {
            steps = autorun;
            autorun = true;
        }

        _this.__resolve = null;

        Object.assign(_this, config());

        _this.running = false;
        _this.append(steps);
        autorun !== false && setTimeout(function () {
            _this.run();
        }, 0);
        return _this;
    }

    /**
     * to append new steps to the sequence
     */


    createClass(Sequence, [{
        key: 'append',
        value: function append(steps) {
            if (checks$2.function(steps)) {
                this.steps.push(steps);
            } else {
                var _iteratorNormalCompletion = true;
                var _didIteratorError = false;
                var _iteratorError = undefined;

                try {
                    for (var _iterator = steps[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
                        var step = _step.value;

                        this.steps.push(step);
                    }
                } catch (err) {
                    _didIteratorError = true;
                    _iteratorError = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion && _iterator.return) {
                            _iterator.return();
                        }
                    } finally {
                        if (_didIteratorError) {
                            throw _iteratorError;
                        }
                    }
                }
            }
            this.running && this.next();
        }
    }, {
        key: 'retry',
        value: function retry() {
            this.index--;
            this.next();
        }
    }, {
        key: 'clear',
        value: function clear() {
            Object.assign(this, config());
        }
    }, {
        key: 'next',
        value: function next() {
            var _this2 = this;

            /**
             * If there is a step that is running,
             * return the promise instance of the running step.
             */
            if (this.busy) this.promise;

            /**
             * If already reached the end of the sequence,
             * return a rejected promise instance with a false as its reason.
             */
            if (!this.steps[this.index]) return Promise$1.reject(false);

            this.busy = true;

            return this.promise = this.promise.then(function () {
                var step = _this2.steps[_this2.index];
                var promise = step(_this2.results[_this2.results.length - 1], _this2.index, _this2.results);
                /**
                 * if the step function doesn't return a promise instance,
                 * create a resolved promise instance with the returned value as its value
                 */
                if (!checks$2.promise(promise)) {
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
                        _this2.running && _this2.next();
                    }
                    return result;
                });
            });
        }
    }, {
        key: 'run',
        value: function run() {
            if (this.running) return;
            this.running = true;
            this.next();
        }
    }, {
        key: 'stop',
        value: function stop() {
            this.running = false;
        }
    }]);
    return Sequence;
}(EventEmitter);

Sequence.SUCCEEDED = 1;
Sequence.FAILED = 0;

Sequence.all = function (steps) {
    var sequence = new Sequence(steps);
    return new Promise$1(function (resolve, reject) {
        sequence.on('end', function (results) {
            resolve(results);
        });
        sequence.on('failed', function (result) {
            sequence.stop();
            reject(result.reason);
        });
    });
};

Sequence.chain = function (steps) {
    var sequence = new Sequence(steps);
    return new Promise$1(function (resolve) {
        sequence.on('end', function (results) {
            resolve(results);
        });
    });
};

return Sequence;

})));
