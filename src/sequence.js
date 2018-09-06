import EventEmitter from '@lvchengbin/event-emitter';
import isFunction from '@lvchengbin/is/src/function';
import isPromise from '@lvchengbin/is/src/promise';
import isUndefined from'@lvchengbin/is/src/undefined';
import assign from '@lvchengbin/kit/src/object-assign';

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
            if( typeof process === 'object' && isFunction( process.nextTick ) ) {
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

        if( isFunction( steps ) ) {
            this.steps.push( steps );
        } else {
            for( let step of steps ) {
                this.steps.push( step );
            }
        }
        this.running && dead && this.next( true );
    }

    go( n ) {
        if( isUndefined( n ) ) return;
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

        isFunction( cb ) && cb.call( sequence, sequence );

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
        isFunction( cb ) && cb.call( sequence, sequence );
        return new Promise( resolve => {
            sequence.on( 'end', results => {
                resolve( results );
            } );
        } );
    }

    static any( ...args ) {
        const { steps, interval, cb } = parseArguments( ...args );
        const sequence = new Sequence( steps, { interval } );
        isFunction( cb ) && cb.call( sequence, sequence );
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
    if( isFunction( interval ) ) {
        cb = interval;
        interval = 0;
    }
    return { steps, interval, cb }
}

export default Sequence;
