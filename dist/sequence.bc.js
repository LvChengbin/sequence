(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Sequence = factory());
}(this, (function () { 'use strict';

/**
 * async function
 *
 * @syntax: 
 *  async function() {}
 *  async () => {}
 *  async x() => {}
 *
 * @compatibility
 * IE: no
 * Edge: >= 15
 * Android: >= 5.0
 *
 */

function isAsyncFunction (fn) { return ( {} ).toString.call( fn ) === '[object AsyncFunction]'; }

function isFunction (fn) { return ({}).toString.call( fn ) === '[object Function]' || isAsyncFunction( fn ); }

function isPromise (p) { return p && isFunction( p.then ); }

var Promise = (function () {
    function Promise( fn ) {
        if( !( this instanceof Promise ) ) {
            throw new TypeError( this + ' is not a promise ' );
        }

        if( !isFunction( fn ) ) {
            throw new TypeError( 'Promise resolver ' + fn + ' is not a function' );
        }

        this[ '[[PromiseStatus]]' ] = 'pending';
        this[ '[[PromiseValue]]' ]= null;
        this[ '[[PromiseThenables]]' ] = [];
        try {
            fn( promiseResolve.bind( null, this ), promiseReject.bind( null, this ) );
        } catch( e ) {
            if( this[ '[[PromiseStatus]]' ] === 'pending' ) {
                promiseReject.bind( null, this )( e );
            }
        }
    }

    Promise.prototype.then = function then ( resolved, rejected ) {
        var promise = new Promise( function () {} );
        this[ '[[PromiseThenables]]' ].push( {
            resolve : isFunction( resolved ) ? resolved : null,
            reject : isFunction( rejected ) ? rejected : null,
            called : false,
            promise: promise
        } );
        if( this[ '[[PromiseStatus]]' ] !== 'pending' ) { promiseExecute( this ); }
        return promise;
    };

    Promise.prototype.catch = function catch$1 ( reject ) {
        return this.then( null, reject );
    };

    return Promise;
}());

Promise.resolve = function( value ) {
    if( !isFunction( this ) ) {
        throw new TypeError( 'Promise.resolve is not a constructor' );
    }
    /**
     * @todo
     * check if the value need to return the resolve( value )
     */
    return new Promise( function (resolve) {
        resolve( value );
    } );
};

Promise.reject = function( reason ) {
    if( !isFunction( this ) ) {
        throw new TypeError( 'Promise.reject is not a constructor' );
    }
    return new Promise( function ( resolve, reject ) {
        reject( reason );
    } );
};

Promise.all = function( promises ) {
    var rejected = false;
    var res = [];
    return new Promise( function ( resolve, reject ) {
        var remaining = 0;
        var then = function ( p, i ) {
            if( !isPromise( p ) ) {
                p = Promise.resolve( p );
            }
            p.then( function (value) {
                res[ i ] = value;
                setTimeout( function () {
                    if( --remaining === 0 ) { resolve( res ); }
                }, 0 );
            }, function (reason) {
                if( !rejected ) {
                    reject( reason );
                    rejected = true;
                }
            } );
        };

        var i = 0;
        for( var i$1 = 0, list = promises; i$1 < list.length; i$1 += 1 ) {
            var promise = list[i$1];

            remaining++;
            then( promise, i++ );
        }
        if( !i ) {
            resolve( res );
        }
    } );
};

Promise.race = function( promises ) {
    var resolved = false;
    var rejected = false;

    return new Promise( function ( resolve, reject ) {
        function onresolved( value ) {
            if( !resolved && !rejected ) {
                resolve( value );
                resolved = true;
            }
        }

        function onrejected( reason ) {
            if( !resolved && !rejected ) {
                reject( reason );
                rejected = true;
            }
        }

        for( var i = 0, list = promises; i < list.length; i += 1 ) {
            var promise = list[i];

            if( !isPromise( promise ) ) {
                promise = Promise.resolve( promise );
            }
            promise.then( onresolved, onrejected );
        }
    } );
};

function promiseExecute( promise ) {
    var thenable,
        p;

    if( promise[ '[[PromiseStatus]]' ] === 'pending' ) { return; }
    if( !promise[ '[[PromiseThenables]]' ].length ) { return; }

    var then = function ( p, t ) {
        p.then( function (value) {
            promiseResolve( t.promise, value );
        }, function (reason) {
            promiseReject( t.promise, reason );
        } );
    };

    while( promise[ '[[PromiseThenables]]' ].length ) {
        thenable = promise[ '[[PromiseThenables]]' ].shift();

        if( thenable.called ) { continue; }

        thenable.called = true;

        if( promise[ '[[PromiseStatus]]' ] === 'resolved' ) {
            if( !thenable.resolve ) {
                promiseResolve( thenable.promise, promise[ '[[PromiseValue]]' ] );
                continue;
            }
            try {
                p = thenable.resolve.call( null, promise[ '[[PromiseValue]]' ] );
            } catch( e ) {
                then( Promise.reject( e ), thenable );
                continue;
            }
            if( p && ( typeof p === 'function' || typeof p === 'object' ) && p.then ) {
                then( p, thenable );
                continue;
            }
        } else {
            if( !thenable.reject ) {
                promiseReject( thenable.promise, promise[ '[[PromiseValue]]' ] ); 
                continue;
            }
            try {
                p = thenable.reject.call( null, promise[ '[[PromiseValue]]' ] );
            } catch( e ) {
                then( Promise.reject( e ), thenable );
                continue;
            }
            if( ( typeof p === 'function' || typeof p === 'object' ) && p.then ) {
                then( p, thenable );
                continue;
            }
        }
        promiseResolve( thenable.promise, p );
    }
    return promise;
}

function promiseResolve( promise, value ) {
    if( !( promise instanceof Promise ) ) {
        return new Promise( function (resolve) {
            resolve( value );
        } );
    }
    if( promise[ '[[PromiseStatus]]' ] !== 'pending' ) { return; }
    if( value === promise ) {
        /**
         * thie error should be thrown, defined ES6 standard
         * it would be thrown in Chrome but not in Firefox or Safari
         */
        throw new TypeError( 'Chaining cycle detected for promise #<Promise>' );
    }

    if( value !== null && ( typeof value === 'function' || typeof value === 'object' ) ) {
        var then;

        try {
            then = value.then;
        } catch( e ) {
            return promiseReject( promise, e );
        }

        if( typeof then === 'function' ) {
            then.call( value, 
                promiseResolve.bind( null, promise ),
                promiseReject.bind( null, promise )
            );
            return;
        }
    }
    promise[ '[[PromiseStatus]]' ] = 'resolved';
    promise[ '[[PromiseValue]]' ] = value;
    promiseExecute( promise );
}

function promiseReject( promise, value ) {
    if( !( promise instanceof Promise ) ) {
        return new Promise( function ( resolve, reject ) {
            reject( value );
        } );
    }
    promise[ '[[PromiseStatus]]' ] = 'rejected';
    promise[ '[[PromiseValue]]' ] = value;
    promiseExecute( promise );
}

function isUndefined() {
    return arguments.length > 0 && typeof arguments[ 0 ] === 'undefined';
}

function find( haystack, key ) {
    for( var i = 0, list = haystack; i < list.length; i += 1 ) {
        var item = list[i];

        if( item[ 0 ] === key ) { return item; }
    }
    return false;
}

var Map = function Map( iterable ) {
    if ( iterable === void 0 ) iterable = [];

    if( !( this instanceof Map ) ) {
        throw new TypeError( 'Constructor Map requires \'new\'' );
    }
    this.map = iterable || [];
};

var prototypeAccessors = { size: { configurable: true } };
prototypeAccessors.size.get = function () {
    return this.map.length;
};

Map.prototype.get = function get ( key ) {
    var data = find( this.map, key );
    return data ? data[ 1 ] : undefined;
};

Map.prototype.set = function set ( key, value ) {
    var data = find( this.map, key );
    if( data ) {
        data[ 1 ] = value;
    } else {
        this.map.push( [ key, value ] );
    }
    return this;
};

Map.prototype.delete = function delete$1 ( key ) {
        var this$1 = this;

    for( var i = 0, l = this.map.length; i < l; i += 1 ) {
        var item = this$1.map[ i ];
        if( item[ 0 ] === key ) {
            this$1.map.splice( i, 1 );
            return true;
        }
            
    }
    return false;
};

Map.prototype.clear = function clear () {
    this.map= [];
};

Map.prototype.forEach = function forEach ( callback, thisArg ) {
        var this$1 = this;

    isUndefined( thisArg ) && ( this.Arg = this );
    for( var i = 0, list = this$1.map; i < list.length; i += 1 ) {
        var item = list[i];

            callback.call( thisArg, item[ 1 ], item[ 0 ], this$1 );
    }
};

Map.prototype.has = function has ( key ) {
    return !!find( this.map, key );
};

Map.prototype.keys = function keys () {
        var this$1 = this;

    var keys = [];
    for( var i = 0, list = this$1.map; i < list.length; i += 1 ) {
        var item = list[i];

            keys.push( item[ 0 ] );
    }
    return keys;
};

Map.prototype.entries = function entries () {
    return this.map;
};

Map.prototype.values = function values () {
        var this$1 = this;

    var values = [];
    for( var i = 0, list = this$1.map; i < list.length; i += 1 ) {
        var item = list[i];

            values.push( item[ 1 ] );
    }
    return values;
};

Object.defineProperties( Map.prototype, prototypeAccessors );

var Set = function Set( iterable ) {
    var this$1 = this;
    if ( iterable === void 0 ) iterable = [];

    if( !( this instanceof Set ) ) {
        throw new TypeError( 'Constructor Set requires \'new\'' );
    }
    this.set = [];

    if( iterable && iterable.length ) {
        for( var i = 0, list = iterable; i < list.length; i += 1 ) {
            var item = list[i];

            this$1.add( item );
        }
    }
};

var prototypeAccessors$1 = { size: { configurable: true } };

prototypeAccessors$1.size.get = function () {
    return this.set.length;
};

Set.prototype.add = function add ( value ) {
    var i = this.set.indexOf( value );
    if( i > -1 ) {
        this.set[ i ] = value;
    } else {
        this.set.push( value );
    }
    return this;
};

Set.prototype.delete = function delete$1 ( value ) {
    var i = this.set.indexOf( value );
    if( i > -1 ) {
        this.set.splice( i, 1 );
        return true;
    }
    return false;
};

Set.prototype.clear = function clear () {
    this.set = [];
};

Set.prototype.forEach = function forEach ( callback, thisArg ) {
        var this$1 = this;

    isUndefined( thisArg ) && ( this.Arg = this );
    for( var i = 0, list = this$1.set; i < list.length; i += 1 ) {
        var item = list[i];

            callback.call( thisArg, item, item, this$1 );
    }
};

Set.prototype.has = function has ( value ) {
    return this.set.indexOf( value ) > -1;
};

Set.prototype.keys = function keys () {
    return this.values();
};

Set.prototype.entries = function entries () {
        var this$1 = this;

    var res = [];
    for( var i = 0, list = this$1.set; i < list.length; i += 1 ) {
        var item = list[i];

            res.push( [ item, item ] ); 
    }
    return res;
};

Set.prototype.values = function values () {
    return this.set;
};

Object.defineProperties( Set.prototype, prototypeAccessors$1 );

function isString (str) { return typeof str === 'string' || str instanceof String; }

function isRegExp (reg) { return ({}).toString.call( reg ) === '[object RegExp]'; }

var defaultExport = function defaultExport() {
    this.__listeners = new Map();
};

defaultExport.prototype.on = function on ( evt, handler ) {
    var listeners = this.__listeners;
    var handlers = listeners.get( evt );

    if( !handlers ) {
        handlers = new Set();
        listeners.set( evt, handlers );
    }
    handlers.add( handler );
    return this;
};

defaultExport.prototype.once = function once ( evt, handler ) {
        var this$1 = this;

    var _handler = function () {
            var args = [], len = arguments.length;
            while ( len-- ) args[ len ] = arguments[ len ];

        handler.apply( this$1, args );
        this$1.removeListener( evt, _handler );
    };
    return this.on( evt, _handler );
};

defaultExport.prototype.removeListener = function removeListener ( evt, handler ) {
    var listeners = this.__listeners;
    var handlers = listeners.get( evt );
    handlers && handlers.delete( handler );
    return this;
};

defaultExport.prototype.emit = function emit ( evt ) {
        var this$1 = this;
        var args = [], len = arguments.length - 1;
        while ( len-- > 0 ) args[ len ] = arguments[ len + 1 ];

    var handlers = this.__listeners.get( evt );
    if( !handlers ) { return false; }
    handlers.forEach( function (handler) { return handler.call.apply( handler, [ this$1 ].concat( args ) ); } );
};

defaultExport.prototype.removeAllListeners = function removeAllListeners ( rule ) {
    var checker;
    if( isString( rule ) ) {
        checker = function (name) { return rule === name; };
    } else if( isFunction( rule ) ) {
        checker = rule;
    } else if( isRegExp( rule ) ) {
        checker = function (name) {
            rule.lastIndex = 0;
            return rule.test( name );
        };
    }

    var listeners = this.__listeners;

    listeners.forEach( function ( value, key ) {
        checker( key ) && listeners.delete( key );
    } );
    return this;
};

function assign( dest ) {
    var sources = [], len = arguments.length - 1;
    while ( len-- > 0 ) sources[ len ] = arguments[ len + 1 ];

    if( isFunction( Object.assign ) ) {
        return Object.assign.apply( Object, [ dest ].concat( sources ) );
    }
    var obj = sources[ 0 ];
    for( var property in obj ) {
        if( obj.hasOwnProperty( property ) ) {
            dest[ property ] = obj[ property ];
        }
    }
    if( sources.length > 1 ) {
        return assign.apply( void 0, [ dest ].concat( sources.splice( 1, sources.length - 1 ) ) );
    }
    return dest;
}

function config() {
    return {
        promises : [],
        results : [],
        index : 0,
        steps : [],
        busy : false,
        promise : Promise.resolve()
    };
}
/**
 * new Sequence( false, [] )
 * new Sequence( [] )
 */

var Sequence = (function (EventEmitter$$1) {
    function Sequence( steps, options ) {
        var this$1 = this;
        if ( options === void 0 ) options = {};

        EventEmitter$$1.call(this);

        this.__resolve = null;
        this.running = false;
        this.suspended = false;
        this.suspendTimeout = null;
        this.muteEndIfEmpty = !!options.emitEndIfEmpty;
        this.interval = options.interval || 0;

        assign( this, config() );

        if( steps && steps.length ) {
            this.append( steps );
        } else if( !this.muteEndIfEmpty ) {
            if( typeof process === 'object' && isFunction( process.nextTick ) ) {
                process.nextTick( function () {
                    this$1.emit( 'end', this$1.results, this$1 );
                } );
            } else if( typeof setImmediate === 'function' ) {
                setImmediate( function () {
                    this$1.emit( 'end', this$1.results, this$1 );
                } );
            } else {
                setTimeout( function () {
                    this$1.emit( 'end', this$1.results, this$1 );
                }, 0 );
            }
        }

        options.autorun !== false && setTimeout( function () {
            this$1.run();
        }, 0 );
    }

    if ( EventEmitter$$1 ) Sequence.__proto__ = EventEmitter$$1;
    Sequence.prototype = Object.create( EventEmitter$$1 && EventEmitter$$1.prototype );
    Sequence.prototype.constructor = Sequence;

    /**
     * to append new steps to the sequence
     */
    Sequence.prototype.append = function append ( steps ) {
        var this$1 = this;

        var dead = this.index >= this.steps.length;

        if( isFunction( steps ) ) {
            this.steps.push( steps );
        } else {
            for( var i = 0, list = steps; i < list.length; i += 1 ) {
                var step = list[i];

                this$1.steps.push( step );
            }
        }
        this.running && dead && this.next( true );
    };

    Sequence.prototype.go = function go ( n ) {
        if( isUndefined( n ) ) { return; }
        this.index = n;
        if( this.index > this.steps.length ) {
            this.index = this.steps.length;
        }
    };

    Sequence.prototype.clear = function clear () {
        assign( this, config() );
    };

    Sequence.prototype.next = function next ( inner ) {
        var this$1 = this;
        if ( inner === void 0 ) inner = false;

        if( !inner && this.running ) {
            console.warn( 'Please do not call next() while the sequence is running.' );
            return Promise.reject( new Sequence.Error( {
                errno : 2,
                errmsg : 'Cannot call next during the sequence is running.'
            } ) );
        }

        /**
         * If there is a step that is running,
         * return the promise instance of the running step.
         */
        if( this.busy || this.suspended ) { return this.promise; }

        /**
         * If already reached the end of the sequence,
         * return a rejected promise instance with a false as its reason.
         */
        if( !this.steps[ this.index ] ) {
            return Promise.reject( new Sequence.Error( {
                errno : 1,
                errmsg : 'no more step can be executed.'
            } ) );
        }

        this.busy = true;
        
        return this.promise = this.promise.then( function () {
            var step = this$1.steps[ this$1.index ];
            var promise;

            try {
                promise = step(
                    this$1.results[ this$1.results.length - 1 ],
                    this$1.index,
                    this$1.results
                );
                /**
                 * if the step function doesn't return a promise instance,
                 * create a resolved promise instance with the returned value as its value
                 */
                if( !isPromise( promise ) ) {
                    promise = Promise.resolve( promise );
                }
            } catch( e ) {
                promise = Promise.reject( e );
            }

            return promise.then( function (value) {
                var result = {
                    status : Sequence.SUCCEEDED,
                    index : this$1.index,
                    value: value,
                    time : +new Date
                };
                this$1.results.push( result );
                this$1.emit( 'success', result, this$1.index, this$1 );
                return result;
            } ).catch( function (reason) {
                var result = {
                    status : Sequence.FAILED,
                    index : this$1.index,
                    reason: reason,
                    time : +new Date
                };
                this$1.results.push( result );
                this$1.emit( 'failed', result, this$1.index, this$1 );
                return result;
            } ).then( function (result) {
                this$1.index++;
                this$1.busy = false;
                if( !this$1.steps[ this$1.index ] ) {
                    this$1.emit( 'end', this$1.results, this$1 );
                } else {
                    setTimeout( function () {
                        this$1.running && this$1.next( true ); 
                    }, this$1.interval );
                }
                return result;
            } );
        } );
    };

    Sequence.prototype.run = function run () {
        if( this.running ) { return; }
        this.running = true;
        this.next( true );
    };

    Sequence.prototype.stop = function stop () {
        this.running = false;
    };

    Sequence.prototype.suspend = function suspend ( duration ) {
        var this$1 = this;
        if ( duration === void 0 ) duration = 1000;

        this.suspended = true;
        this.suspendTimeout && clearTimeout( this.suspendTimeout );
        this.suspendTimeout = setTimeout( function () {
            this$1.suspended = false;
            this$1.running && this$1.next( true );
        }, duration );
    };

    Sequence.all = function all () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = parseArguments.apply( void 0, args );
        var steps = ref.steps;
        var interval = ref.interval;
        var cb = ref.cb;
        var sequence = new Sequence( steps, { interval: interval } );

        isFunction( cb ) && cb.call( sequence, sequence );

        return new Promise( function ( resolve, reject ) {
            sequence.on( 'end', function (results) {
                resolve( results );
            } );
            sequence.on( 'failed', function () {
                sequence.stop();
                reject( sequence.results );
            } );
        } );
    };

    Sequence.chain = function chain () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = parseArguments.apply( void 0, args );
        var steps = ref.steps;
        var interval = ref.interval;
        var cb = ref.cb;
        var sequence = new Sequence( steps, { interval: interval } );
        isFunction( cb ) && cb.call( sequence, sequence );
        return new Promise( function (resolve) {
            sequence.on( 'end', function (results) {
                resolve( results );
            } );
        } );
    };

    Sequence.any = function any () {
        var args = [], len = arguments.length;
        while ( len-- ) args[ len ] = arguments[ len ];

        var ref = parseArguments.apply( void 0, args );
        var steps = ref.steps;
        var interval = ref.interval;
        var cb = ref.cb;
        var sequence = new Sequence( steps, { interval: interval } );
        isFunction( cb ) && cb.call( sequence, sequence );
        return new Promise( function ( resolve, reject ) {
            sequence.on( 'success', function () {
                resolve( sequence.results );
                sequence.stop();
            } );

            sequence.on( 'end', function () {
                reject( sequence.results );
            } );
        } );
    };

    return Sequence;
}(defaultExport));

Sequence.SUCCEEDED = 1;
Sequence.FAILED = 0;

Sequence.Error = (function () {
    function Error( options ) {
        assign( this, options );
    }

    return Error;
}());

function parseArguments( steps, interval, cb ) {
    if( isFunction( interval ) ) {
        cb = interval;
        interval = 0;
    }
    return { steps: steps, interval: interval, cb: cb }
}

return Sequence;

})));
