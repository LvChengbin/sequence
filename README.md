# Sequence

To execute and manage Promise instances in sequence.

## Installation

```js
$ npm i @lvchengbin/sequence --save
```

## Usage

### NodeJS

```js
const Sequence = require( '@lvchengbin/sequence' );
```

### ES6

```js
import Sequence from '@lvchengbin/sequence';
```

```js
const sequence = new Sequence( [
    () => Promise.resolve(),
    () => Promise.reject(),
    () => true
], { interval : 1000 } );

sequence.on( 'success', ( data, index ) => {
    // execute when each step in sequence succeed
} ); 

sequence.on( 'failed', ( data, index ) => {
    this.retry();
    // execute when each step in sequence failed
} );

sequence.on( 'end', () => {
    // execute after finishing all steps in the sequence
} );
```


