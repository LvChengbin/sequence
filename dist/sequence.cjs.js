'use strict';

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

var isAsyncFunction = fn => ( {} ).toString.call( fn ) === '[object AsyncFunction]';

var isFunction = fn => ({}).toString.call( fn ) === '[object Function]' || isAsyncFunction( fn );

function isUndefined() {
    return arguments.length > 0 && typeof arguments[ 0 ] === 'undefined';
}

const defineProperty = Object.defineProperty;
const methods = [ 'clear', 'delete', 'entries', 'forEach', 'get', 'has', 'keys', 'set', 'values' ];

const supportNativeMap = () => {
    if( typeof Map === 'undefined' ) return false;
    for( const method of methods ) {
        if( !isFunction( Map.prototype[ method ] ) ) return false;
    }
    return true;
};

function find( haystack, key ) {
    for( let item of haystack ) {
        if( item[ 0 ] === key ) return item;
    }
    return false;
}

class M {
    constructor( iterable = [], nativeMap = true ) {
        if( !( this instanceof M ) ) {
            throw new TypeError( 'Constructor Map requires \'new\'' );
        }

        if( nativeMap && supportNativeMap() ) {
            return new Map( iterable );
        }

        const map = iterable || [];

        defineProperty( map, 'size', {
            enumerable : false,
            get() {
                return this.length;
            }
        } );

        defineProperty( map, 'get', {
            enumerable : false,
            value : function( key ) {
                const data = find( this, key );
                return data ? data[ 1 ] : undefined;
            }
        } );

        defineProperty( map, 'set', {
            enumerable : false,
            value : function( key, value ) {
                const data = find( this, key );
                if( data ) {
                    data[ 1 ] = value;
                } else {
                    this.push( [ key, value ] );
                }
                return this;
            }
        } );

        defineProperty( map, 'delete', {
            enumerable : false,
            value : function( key ) {
                for( let i = 0, l = this.length; i < l; i += 1 ) {
                    if( this[ i ][ 0 ] === key ) {
                        this.splice( i, 1 );
                        return true;
                    }
                }
                return false;
            }
        } );

        defineProperty( map, 'clear', {
            enumerable : false,
            value : function() {
                this.length = 0;
            }
        } );

        defineProperty( map, 'forEach', {
            enumerable : false,
            value : function( callback, thisArg ) {
                isUndefined( thisArg ) && ( thisArg = this );
                for( let item of this ) {
                    callback.call( thisArg, item[ 1 ], item[ 0 ], this );
                }
            }
        } );

        defineProperty( map, 'has', {
            enumerable : false,
            value : function( key ) {
                return !!find( this, key );
            }
        } );

        defineProperty( map, 'keys', {
            enumerable : false,
            value : function() {
                const keys = [];
                for( let item of this ) {
                    keys.push( item[ 0 ] );
                }
                return keys;
            }
        } );

        defineProperty( map, 'entries', {
            enumerable : false,
            value : function() {
                return this;
            }
        } );

        defineProperty( map, 'values', {
            enumerable : false,
            value : function() {
                const values = [];
                for( let item of this ) {
                    values.push( item[ 1 ] );
                }
                return values;
            }
        } );
        return map;
    }
}

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

var isAsyncFunction$1 = fn => ( {} ).toString.call( fn ) === '[object AsyncFunction]';

var isFunction$1 = fn => ({}).toString.call( fn ) === '[object Function]' || isAsyncFunction$1( fn );

function isUndefined$1() {
    return arguments.length > 0 && typeof arguments[ 0 ] === 'undefined';
}

const defineProperty$1 = Object.defineProperty;
const g = typeof global === 'undefined' ? window : global;
const methods$1 = [ 'add', 'clear', 'delete', 'entries', 'forEach', 'has', 'values' ];

const supportNativeSet = () => {
    if( !g.Set ) return false;
    for( let method of methods$1 ) {
        if( !isFunction$1( Set.prototype[ method ] ) ) return false;
    }
    return true;
};

class S {
    constructor( iterable = [], nativeSet = true ) {
        if( nativeSet && supportNativeSet() ) {
            return new g.Set( iterable );
        }

        if( !( this instanceof S ) ) {
            throw new TypeError( 'Constructor Set requires \'new\'' );
        }

        const set = [];

        defineProperty$1( set, 'size', {
            enumerable : false,
            get() {
                return set.length;
            }
        } );

        defineProperty$1( set, 'add', {
            enumerable : false,
            value : function( value ) {
                const i = this.indexOf( value );
                if( i > -1 ) {
                    this[ i ] = value;
                } else {
                    this.push( value );
                }
                return this;
            }
        } );

        defineProperty$1( set, 'delete', {
            enumerable : false,
            value : function( value ) {
                const i = this.indexOf( value );
                if( i > -1 ) {
                    this.splice( i, 1 );
                    return true;
                }
                return false;
            }
        } );

        defineProperty$1( set, 'clear', {
            enumerable : false,
            value : function() {
                this.length = 0;
            }
        } );

        defineProperty$1( set, 'forEach', {
            enumerable : false,
            value : function( callback, thisArg ) {
                isUndefined$1( thisArg ) && ( thisArg = this );
                for( let item of this ) {
                    callback.call( thisArg, item, item, this );
                }
            }
        } );

        defineProperty$1( set, 'has', {
            enumerable : false,
            value : function( value ) {
                return this.indexOf( value ) > -1;
            }
        } );

        defineProperty$1( set, 'keys', {
            enumerable : false,
            value : function() {
                return this.values();
            }
        } );

        defineProperty$1( set, 'entries', {
            enumerable : false,
            value : function() {
                const res = [];
                for( let item of this ) {
                    res.push( [ item, item ] ); 
                }
                return res;
            }
        } );

        defineProperty$1( set, 'values', {
            enumerable : false,
            value : function() {
                return this;
            }
        } );

        if( iterable ) {
            for( const item of iterable ) set.add( item );
        }
        return set;
    }
}

var isString = str => typeof str === 'string' || str instanceof String;

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

var isAsyncFunction$2 = fn => ( {} ).toString.call( fn ) === '[object AsyncFunction]';

var isFunction$2 = fn => ({}).toString.call( fn ) === '[object Function]' || isAsyncFunction$2( fn );

var isRegExp = reg => ({}).toString.call( reg ) === '[object RegExp]';

class EventEmitter {
    constructor() {
        this.__listeners = new M();
    }

    on( evt, handler ) {
        const listeners = this.__listeners;
        let handlers = listeners.get( evt );

        if( !handlers ) {
            handlers = new S();
            listeners.set( evt, handlers );
        }
        handlers.add( handler );
        return this;
    }

    once( evt, handler ) {
        const _handler = ( ...args ) => {
            handler.apply( this, args );
            this.removeListener( evt, _handler );
        };
        return this.on( evt, _handler );
    }

    removeListener( evt, handler ) {
        const listeners = this.__listeners;
        const handlers = listeners.get( evt );
        handlers && handlers.delete( handler );
        return this;
    }

    emit( evt, ...args ) {
        const handlers = this.__listeners.get( evt );
        if( !handlers ) return false;
        handlers.forEach( handler => handler.call( this, ...args ) );
    }

    removeAllListeners( rule ) {
        let checker;
        if( isString( rule ) ) {
            checker = name => rule === name;
        } else if( isFunction$2( rule ) ) {
            checker = rule;
        } else if( isRegExp( rule ) ) {
            checker = name => {
                rule.lastIndex = 0;
                return rule.test( name );
            };
        }

        const listeners = this.__listeners;

        listeners.forEach( ( value, key ) => {
            checker( key ) && listeners.delete( key );
        } );
        return this;
    }
}

var isPromise = p => p && isFunction$2( p.then );

function isUndefined$2() {
    return arguments.length > 0 && typeof arguments[ 0 ] === 'undefined';
}

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

var isAsyncFunction$3 = fn => ( {} ).toString.call( fn ) === '[object AsyncFunction]';

var isFunction$3 = fn => ({}).toString.call( fn ) === '[object Function]' || isAsyncFunction$3( fn );

const assign = ( dest, ...sources ) => {
    if( isFunction$3( Object.assign ) ) {
        return Object.assign( dest, ...sources );
    }
    const obj = sources[ 0 ];
    for( let property in obj ) {
        if( obj.hasOwnProperty( property ) ) {
            dest[ property ] = obj[ property ];
        }
    }
    if( sources.length > 1 ) {
        return assign( dest, ...sources.splice( 1, sources.length - 1 ) );
    }
    return dest;
};

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

class Sequence extends EventEmitter {
    constructor( steps, options = {} ) {
        super();

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
            if( typeof process === 'object' && isFunction$2( process.nextTick ) ) {
                process.nextTick( () => {
                    this.emit( 'end', this.results, this );
                } );
            } else if( typeof setImmediate === 'function' ) {
                setImmediate( () => {
                    this.emit( 'end', this.results, this );
                } );
            } else {
                setTimeout( () => {
                    this.emit( 'end', this.results, this );
                }, 0 );
            }
        }

        options.autorun !== false && setTimeout( () => {
            this.run();
        }, 0 );
    }

    /**
     * to append new steps to the sequence
     */
    append( steps ) {
        const dead = this.index >= this.steps.length;

        if( isFunction$2( steps ) ) {
            this.steps.push( steps );
        } else {
            for( let step of steps ) {
                this.steps.push( step );
            }
        }
        this.running && dead && this.next( true );
    }

    go( n ) {
        if( isUndefined$2( n ) ) return;
        this.index = n;
        if( this.index > this.steps.length ) {
            this.index = this.steps.length;
        }
    }

    clear() {
        assign( this, config() );
    }

    next( inner = false ) {
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
        if( this.busy || this.suspended ) return this.promise;

        /**
         * If already reached the end of the sequence,
         * return a rejected promise instance with a false as its reason.
         */
        if( !this.steps[ this.index ] ) {
            return Promise.reject( new Sequence.Error( {
                errno : 1,
                errmsg : 'no more steps.'
            } ) );
        }

        this.busy = true;
        
        return this.promise = this.promise.then( () => {
            const step = this.steps[ this.index ];
            let promise;

            try {
                promise = step(
                    this.results[ this.results.length - 1 ],
                    this.index,
                    this.results
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

            return promise.then( value => {
                const result = {
                    status : Sequence.SUCCEEDED,
                    index : this.index,
                    value,
                    time : +new Date
                };
                this.results.push( result );
                this.emit( 'success', result, this.index, this );
                return result;
            } ).catch( reason => {
                const result = {
                    status : Sequence.FAILED,
                    index : this.index,
                    reason,
                    time : +new Date
                };
                this.results.push( result );
                this.emit( 'failed', result, this.index, this );
                return result;
            } ).then( result => {
                this.index++;
                this.busy = false;
                if( !this.steps[ this.index ] ) {
                    this.emit( 'end', this.results, this );
                } else {
                    setTimeout( () => {
                        this.running && this.next( true ); 
                    }, this.interval );
                }
                return result;
            } );
        } );
    }

    run() {
        if( this.running ) return;
        this.running = true;
        this.next( true );
    }

    stop() {
        this.running = false;
    }

    suspend( duration = 1000 ) {
        this.suspended = true;
        this.suspendTimeout && clearTimeout( this.suspendTimeout );
        this.suspendTimeout = setTimeout( () => {
            this.suspended = false;
            this.running && this.next( true );
        }, duration );
    }

    static all( ...args ) {
        const { steps, interval, cb } = parseArguments( ...args );
        const sequence = new Sequence( steps, { interval } );

        isFunction$2( cb ) && cb.call( sequence, sequence );

        return new Promise( ( resolve, reject ) => {
            sequence.on( 'end', results => {
                resolve( results );
            } );
            sequence.on( 'failed', () => {
                sequence.stop();
                reject( sequence.results );
            } );
        } );
    }

    static chain( ...args ) {
        const { steps, interval, cb } = parseArguments( ...args );
        const sequence = new Sequence( steps, { interval } );
        isFunction$2( cb ) && cb.call( sequence, sequence );
        return new Promise( resolve => {
            sequence.on( 'end', results => {
                resolve( results );
            } );
        } );
    }

    static any( ...args ) {
        const { steps, interval, cb } = parseArguments( ...args );
        const sequence = new Sequence( steps, { interval } );
        isFunction$2( cb ) && cb.call( sequence, sequence );
        return new Promise( ( resolve, reject ) => {
            sequence.on( 'success', () => {
                resolve( sequence.results );
                sequence.stop();
            } );

            sequence.on( 'end', () => {
                reject( sequence.results );
            } );
        } );
    }
}

Sequence.SUCCEEDED = 1;
Sequence.FAILED = 0;

Sequence.Error = class {
    constructor( options ) {
        assign( this, options );
    }
};

function parseArguments( steps, interval, cb ) {
    if( isFunction$2( interval ) ) {
        cb = interval;
        interval = 0;
    }
    return { steps, interval, cb }
}

module.exports = Sequence;
