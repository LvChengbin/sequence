import Promise from '@lvchengbin/promise';
import EventEmitter from './eventemitter';
import checks from './checks';

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
    constructor( autorun = true, steps = [] ) {
        super();
        this.$alias( 'on', '$on' );
        this.$alias( 'once', '$once' );
        this.$alias( 'emit', '$emit' );
        this.$alias( 'removeListener', '$removeListener' );
        this.$alias( 'removeAllListeners', '$removeAllListeners' );

        if( !checks.boolean( autorun ) ) {
            steps = autorun;
            autorun = true;
        }

        this.__resolve = null;

        Object.assign( this, config() );

        this.running = false;
        this.append( steps );
        autorun !== false && setTimeout( () => {
            this.run();
        }, 0 );
    }

    /**
     * to append new steps to the sequence
     */
    append( steps ) {
        if( checks.function( steps ) ) {
            this.steps.push( steps );
        } else {
            for( let step of steps ) {
                this.steps.push( step );
            }
        }
        this.running && this.next();
    }

    retry() {
        this.index--;
        this.next();
    }

    clear() {
        Object.assign( this, config() );
    }

    next() {
        /**
         * If there is a step that is running,
         * return the promise instance of the running step.
         */
        if( this.busy ) this.promise;

        /**
         * If already reached the end of the sequence,
         * return a rejected promise instance with a false as its reason.
         */
        if( !this.steps[ this.index ] ) return Promise.reject( false );

        this.busy = true;
        
        return this.promise = this.promise.then( () => {
            const step = this.steps[ this.index ];
            let promise = step(
                this.results[ this.results.length - 1 ],
                this.index,
                this.results
            );
            /**
             * if the step function doesn't return a promise instance,
             * create a resolved promise instance with the returned value as its value
             */
            if( !checks.promise( promise ) ) {
                promise = Promise.resolve( promise );
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
                    this.running && this.next();
                }
                return result;
            } );
        } );
    }

    run() {
        if( this.running ) return;
        this.running = true;
        this.next();
    }

    stop() {
        this.running = false;
    }
}

Sequence.SUCCEEDED = 1;
Sequence.FAILED = 0;

Sequence.all = ( steps ) => {
    const sequence = new Sequence( steps );
    return new Promise( ( resolve, reject ) => {
        sequence.on( 'end', results => {
            resolve( results );
        } );
        sequence.on( 'failed', result => {
            sequence.stop();
            reject( result.reason );
        } );
    } );
};

Sequence.chain = ( steps ) => {
    const sequence = new Sequence( steps );
    return new Promise( resolve => {
        sequence.on( 'end', results => {
            resolve( results );
        } );
    } );
};

export default Sequence;
