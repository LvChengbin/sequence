# Sequence

To execute and manage asynchronous functions in sequence.


<!-- vim-markdown-toc GFM -->

* [Start](#start)
* [Usage](#usage)
* [Something About Steps.](#something-about-steps)
* [API](#api)
    * [Sequence( steps, options = {} )](#sequence-steps-options---)
    * [Sequence.prototype.append( steps )](#sequenceprototypeappend-steps-)
    * [Sequence.prototype.clear()](#sequenceprototypeclear)
    * [Sequence.prototype.next()](#sequenceprototypenext)
    * [Sequence.prototype.go( index )](#sequenceprototypego-index-)
    * [Sequence.prototype.run()](#sequenceprototyperun)
    * [Sequence.prototype.stop()](#sequenceprototypestop)
    * [Sequence.prototype.suspend( duration = 1000 )](#sequenceprototypesuspend-duration--1000-)
    * [Sequence.all( steps[, interval = 0, callback ] )](#sequenceall-steps-interval--0-callback--)
    * [Sequence.chain( steps[, interval = 0, callback ] )](#sequencechain-steps-interval--0-callback--)
    * [Sequence.any( steps[, interval = 0, callback ] )](#sequenceany-steps-interval--0-callback--)
    * [Sequence.Error](#sequenceerror)

<!-- vim-markdown-toc -->

## Start

To install the package with `npm`.

```js
$ npm i @lvchengbin/sequence --save
```
Then you can use it in nodejs code.
```js
const Sequence = require( '@lvchengbin/sequence' );
```
If you want to use the package as an ES6 module, you can import it like this:
```js
import Sequence from '@lvchengbin/sequence';
```
We also provide files for using in browsers with `<script>` tag, you can get it here [sequence.js](https://raw.githubusercontent.com/LvChengbin/sequence/master/dist/sequence.js), and if you want to use it in browsers not supporting ES6 syntax, please use [sequence.bc.js](https://raw.githubusercontent.com/LvChengbin/sequence/master/dist/sequence.bc.js).

## Usage

To create a simple sequence with `new Sequence`:

```js
import Sequence from '@lvchengbin/sequence';

const steps = [
    () => Promise.resolve(),
    () => Promise.reject(),
    () => true
];

const sequence = new Sequence( steps, { interval : 1000 } );

sequence.on( 'success', ( data, index ) => {
    // execute when each step in sequence succeed
} ); 

sequence.on( 'failed', ( data, index ) => {
    this.go( index - 1 );
    // execute when each step in sequence failed
} );

sequence.on( 'end', () => {
    // execute after finishing all steps in the sequence
} );
```

In the code above, the functions in `steps` will execute one by one, no metter if one of them is succeed or failed, and you can get information and status by listening events `success`, `failed` and `end`.

Or you can create a sequence without auto running, and to execute each step by calling the `next` method:

```js
const sequence = new Sequence( steps, { autorun : false } );

const result = await sequence.next();

if( result.status === Sequence.SUCCEEDED ) {
    sequence.next();
}
```

And you can easily create a sequence, which will execute like `Promise.all`, with `Sequence.all`:

```js
Sequence.all( steps ).then( results => {
    // some code...
} ).catch( e => {
    console.error( e );
} );
```

A method `Sequence.chain` is provided for running a sequence by ignoring the result (succeeded or failed) of each step:

```js
Sequence.chain( steps ).then( results => {
    // some code...
} );
```

For example, if you want to send a request after user click a button, but you need to make all requests be sent one by one if the user clicked the button multiple times:

```js
const sequence = new Sequence();

sequence.on( 'failed', function() {
    alert( 'Something error happened' );
    this.stop();
} );

const button = document.querySelector( '#button' );

button.addEventListener( 'click', () => {
    sequence.append( () => {
        return request( 'the url' );
    } );
} );
```

## Something About Steps.

Each step in sequence should be a function, and generally, it should return a Promise object. If the return value of one step function is not a Promise object, the return value will be converted to a Promise object with `Promise.resolve( {the return value} )`. Each step function in the sequence will be executed after its previous step function finished (no matter the Promise object is resolved or rejected).

There are three arguments will be passed to the step function, like this:

```js
const step = ( result, index, results ) {
    if( result.status === Sequence.SUCCEEDED ) {
        console.log( result.value );
        // some code...
    } else {
        console.log( result.reason );
    }
}
```

 - **result** : the result of the previous step, the structure of the result is:

    ```js
    // result of a successful step
    {
        status : Sequence.SUCCEEDED,
        index : 1,
        value : 'some value here',
        time : 1516339895559
    }
    // result of a failed step
    {
        status : Sequence.FAILED,
        index : 2,
        reason : 'some reason here',
        time : 1516339895559
    }
    ```

    - status : the status of the result, it can be `Sequence.SUCCEEDED` or `Sequence.FAILED`.
    - index : the position of the step in the sequence.
    - value : the value of the resolved promise of the step.
    - reason : the failed reason of the rejecte promise of the step.
    - time : the time that the step finished.

- **index** : the order of the step in sequence

- **results** : the full result list of all finished steps.

## API

### Sequence( steps, options = {} )

**Parameters**

- steps `Function` | `Iterable`

    The steps that you want to add to the sequence, each step must be a `Function` and should return a Promise object, if the return value of a step is not a Promise object, it will be converted to a resolved Promise instance as its value is the return value.

- options `Object`

    Options for the sequence, this is the list of options which are supported:

    - autorun `Boolean` - Default : true

        Denoting if the sequence should be run automatically after creating.

    - interval `Number` - Default : 0

        The interval between each step, the unit is `ms`.

**Properties of Sequence instance**

 - running : denoting if the sequence is running.
 - suspended : denoting if the sequence is suspended.
 - busy : denoting if there is a step in the sequence is in process.
 - interval : the interval between executing two steps, you can change is as you want.
 - steps : all steps of the sequence.
 - index : the order of the step which will be executed next time.
 - results : an array for all results of each step.

**Example**

```js
new Sequence( [
    () => Promise.resolve(),
    () => {
        // this function will execute 1s after the previous one finished.
        return true;
    }
], {
    autorun : true,
    interval : 1000
} )
```

### Sequence.prototype.append( steps )

To append new steps into the sequence.

**Parameters**

 - steps `Function` | `Iterable`
    
    The steps that you want to append to the sequence, each step must be a `Function` and should return a Promise object, if the return value of a step is not a Promise object, it will be converted to a resolved Promise object as its value is the return value.
    
**Example**

```js
const sequence = new Sequence();

sequence.append( () => {
    return request( url );
} );
```

### Sequence.prototype.clear()

To remove all steps in the sequence no matter if the steps have executed.

### Sequence.prototype.next()

To run the next step in ths sequence if the sequence is not running. It cannot use while the sequence is running.

If there is a step in process while calling this method, the sequence will not go to the next step.

**Return value**

If the method execute successfully, a resolved Promise object of the step will be returned, otherwise a rejected one will be returned.

But in different situations, there would be some different result:

 - When this method is called, if there is a step in process, the method will return the Promise object of the running step.
 - When this method is called while the sequence is running, a rejected Promise instance will be returned, and the reason the the instance will be a `Sequence.Error` instance with `errno` is `2`.
 - When this method is called while the sequence already reached the end, a rejected Promise instance will be returned, and the reason the the instance will be a `Sequence.Error` instance with `errno` is `1`.

**Example**

```js
const sequence = new Sequence( steps, { autorun : false } );

sequence.next().then( result => {
} );
```

### Sequence.prototype.go( index )

To jump to a specified This method just set the cursor of the sequence to the previous one and it will not 

**Parameters**

 - index `Integer`

 The index of step to jump to.

**Example**

```js
const sequence = new Sequence( steps );

sequence.on( 'failed', ( data, index ) => {
    sequence.go( index - 1 ); // will re-execute this step.
} );
```
Notice that, by listening to the `failed` event, cannot pend the sequence, so you cannot do some async things before you decide if you need to jump to one step.But maybe you can use it with `stop` method. For example:

```js
const sequence = new Sequence( steps );

sequence.on( 'failed', ( data, index ) => {
    sequence.stop();

    setTimeout( () => {
        sequence.go( index - 1 );
        sequence.run();
    }, 1000 )
} );
```

### Sequence.prototype.run()

To run the sequence if it is not running.

### Sequence.prototype.stop()

To stop the sequence if it is running

### Sequence.prototype.suspend( duration = 1000 )

To suspend the sequence with specfiying a time then the sequence will be paused for a while and continue executing after the duration you set. During the time the sequence suspended, the sequence is still running.

**Parameters**

 - duration `Integer` - Default : 1000

    The duration you want to suspended the sequence, its unit is `ms`.

**Example**

```js

const sequence = new Sequence( steps );

sequence.on( 'success', ( data, index ) => {
    if( index % 10 ) {
        sequence.suspend( 5000 );
    }
} );
```

### Sequence.all( steps[, interval = 0, callback ] )

To run all steps in a sequence, the sequence will return a resolved Promise instance after all steps finished. If one of the steps failed, the function will return a rejected Promise, and if the steps is empty, the function will return a resolved Promise.

The param `interval` is used for denoting the interval between each two steps.

The param `callback` will be executed after creating the instance of `Sequence`, so you can control the instance of `Sequence` with this param.

The value of the resolved promise will be an `Array` filled with result of each step.

```js
Sequence.all( [
    () => Promise.resolve( 1 ),
    () => true
] ).then( results => {
    // result list of the sequence
    // some code...
} ).catch( results => {
    // result list of the sequence
    // some code...
} );

Sequence.all( [], sequence => {
    sequence.on( 'success', () => {} );
} );
```

### Sequence.chain( steps[, interval = 0, callback ] )

To run all steps in a sequence, and doesn't care about if all of the steps succeeded, a `Promise` will be returned, and its value will be a full list of the results of the sequence, and if the steps is empty, a resolved Promise will be returned directly.

```js
Sequence.chain( [
    () => Promise.resolve( 'success' ),
    () => Promise.reject( 'failed' )
] ).then( results => {
    // result list of the sequence
    // some code...
} );
```

### Sequence.any( steps[, interval = 0, callback ] )

To run the steps in sequence until one of them succeeded and a resolved Promise object will be returned. If all the steps executed failed, a rejected Promise object will be returned, and if the steps is empty, a rejected Promise will be returned.

```js
Sequence.any( [
    () => Promise.reject(),
    () => Promise.resolve( true ),
    () => {
        // this function will not execute because the previous one succeeded.
        return true;
    }
] ).then( results => {
    // result list of the sequence
    // some code...
} ).catch( results => {
    // result list of the sequence
    // some sode...
} );
```

### Sequence.Error

An error class for sequences.

```js
const sequence = new Sequence( [] );

sequence.next().catch( e => {
    if( e instanceof Sequence.Error ) {
        // some code...
    }
} );
```

