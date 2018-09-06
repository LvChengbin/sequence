import sleep from '@lvchengbin/sleep';
import Sequence from '../src/sequence';

describe( 'Sequence', () => {
    describe( 'Sequence.all', () => {
        it( 'Should return a resolved promise directly if the steps is empty', done => {
            Sequence.all( [] ).then( () => {
                done();
            } );
        } );

        it( 'Should have gotten correct params in each step', done => {
            const seq = [];
            Sequence.all( [ 
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'a' );
                            resolve( 'A' );
                        }, 15 );
                    } );
                },
                ( last, index, list ) => {
                    expect( last.value ).toEqual( 'A' );
                    expect( index ).toEqual( 1 );
                    expect( list[ 0 ].value ).toEqual( 'A' );
                    done();

                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'b' );
                            resolve( 'B' );
                        }, 5 );
                    } );
                },
                () => ( seq.push( 'c' ), 'C' )
            ] );
        } );

        it( 'Should have executed each step in order', done => {
            const seq = [];
            Sequence.all( [ 
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'a' );
                            resolve( 'A' );
                        }, 15 );
                    } );
                },
                ( last, index, list ) => {
                    expect( last.value ).toEqual( 'A' );
                    expect( index ).toEqual( 1 );
                    expect( list[ 0 ].value ).toEqual( 'A' );
                    done();

                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'b' );
                            resolve( 'B' );
                        }, 5 );
                    } );
                },
                () => ( seq.push( 'c' ), 'C' )
            ] ).then( () => {
                expect( seq ).toEqual( [ 'a', 'b', 'c' ] );
                done();
            } );
        } );

        it( 'Should have gotten an Array filled with values of each Promise instance', done => {
            const seq = [];
            Sequence.all( [ 
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'a' );
                            resolve( 'A' );
                        }, 15 );
                    } );
                },
                ( last, index, list ) => {
                    expect( last.value ).toEqual( 'A' );
                    expect( index ).toEqual( 1 );
                    expect( list[ 0 ].value ).toEqual( 'A' );
                    done();

                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'b' );
                            resolve( 'B' );
                        }, 5 );
                    } );
                },
                () => ( seq.push( 'c' ), 'C' )
            ] ).then( value => {
                expect( [
                    value[ 0 ].value,
                    value[ 1 ].value,
                    value[ 2 ].value
                ] ).toEqual( [ 'A', 'B', 'C' ] );
                done();
            } );
        } );

        it( 'Should caught the error if the sequence was rejected', done => {
            Sequence.all( [ 
                () => 'a',
                () => 'b',
                () => Promise.reject( 'error' )
            ] ).catch( results => {
                const reason = results[ results.length - 1 ].reason;
                expect( reason ).toEqual( 'error' );
                done();
            } );
        } );

        it( 'Should regard the return value of a step as a rejected Promise if the step function thrown an error', done => {
            Sequence.all( [
                () => {
                    throw 'error';
                }
            ] ).catch( results => {
                const reason = results[ 0 ].reason;
                expect( reason ).toEqual( 'error' );
                done();
            } );
        } );
    } );

    describe( 'Sequence.chain', () => {
        it( 'Should return a resolved Promise directly if the steps is empty', done => {
            Sequence.chain( [] ).then( () => {
                done();
            } );
        } );

        it( 'Should have gotten correct reasons in each step', done => {
            const seq = [];
            Sequence.chain( [
                () => {
                    return new Promise( ( resolve, reject ) => {
                        setTimeout( () => {
                            seq.push( 'a' );
                            reject( 'A' )
                        }, 15 );
                    } );
                },
                ( last, index, list ) => {
                    expect( last.status ).toEqual( Sequence.FAILED );
                    expect( index ).toEqual( 1 );
                    expect( last.reason ).toEqual( 'A' );
                    expect( last.time ).toBeLessThanOrEqual( +new Date );
                    expect( list[ 0 ].status ).toEqual( Sequence.FAILED );
                    return new Promise( ( resolve ) => {
                        setTimeout( () => {
                            seq.push( 'b' );
                            resolve( 'B' );
                        }, 5 );
                    } );
                },
                ( last, index, list ) => {
                    expect( last.status ).toEqual( Sequence.SUCCEEDED );
                    expect( index ).toEqual( 2 );
                    expect( last.value ).toEqual( 'B' );
                    expect( last.time ).toBeLessThanOrEqual( +new Date );
                    expect( list[ 1 ].status ).toEqual( Sequence.SUCCEEDED );
                    done();
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'c' );
                            resolve( 'C' );
                        }, 5 );
                    } );
                }
            ] );
        } );

        it( 'Should have executed in order', done => {
            const seq = [];
            Sequence.chain( [
                () => {
                    return new Promise( ( resolve, reject ) => {
                        setTimeout( () => {
                            seq.push( 'a' );
                            reject( 'A' )
                        }, 15 );
                    } );
                },
                ( last, index, list ) => {
                    expect( last.status ).toEqual( Sequence.FAILED );
                    expect( index ).toEqual( 1 );
                    expect( last.reason ).toEqual( 'A' );
                    expect( last.time ).toBeLessThanOrEqual( +new Date );
                    expect( list[ 0 ].status ).toEqual( Sequence.FAILED );
                    return new Promise( ( resolve ) => {
                        setTimeout( () => {
                            seq.push( 'b' );
                            resolve( 'B' );
                        }, 5 );
                    } );
                },
                ( last, index, list ) => {
                    expect( last.status ).toEqual( Sequence.SUCCEEDED );
                    expect( index ).toEqual( 2 );
                    expect( last.value ).toEqual( 'B' );
                    expect( last.time ).toBeLessThanOrEqual( +new Date );
                    expect( list[ 1 ].status ).toEqual( Sequence.SUCCEEDED );
                    done();
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'c' );
                            resolve( 'C' );
                        }, 5 );
                    } );
                }
            ] ).then( () => {
                expect( seq ).toEqual( [ 'a', 'b', 'c' ] );
                done();
            } );
        } );

        it( 'Should have resolved after encountering a step resolved', done => {
             const seq = [];
            Sequence.chain( [
                () => {
                    return new Promise( ( resolve, reject ) => {
                        setTimeout( () => {
                            seq.push( 'a' );
                            reject( 'A' )
                        }, 15 );
                    } );
                },
                ( last, index, list ) => {
                    expect( last.status ).toEqual( Sequence.FAILED );
                    expect( index ).toEqual( 1 );
                    expect( last.reason ).toEqual( 'A' );
                    expect( last.time ).toBeLessThanOrEqual( +new Date );
                    expect( list[ 0 ].status ).toEqual( Sequence.FAILED );
                    return new Promise( ( resolve ) => {
                        setTimeout( () => {
                            seq.push( 'b' );
                            resolve( 'B' );
                        }, 5 );
                    } );
                },
                ( last, index, list ) => {
                    expect( last.status ).toEqual( Sequence.SUCCEEDED );
                    expect( index ).toEqual( 2 );
                    expect( last.value ).toEqual( 'B' );
                    expect( last.time ).toBeLessThanOrEqual( +new Date );
                    expect( list[ 1 ].status ).toEqual( Sequence.SUCCEEDED );
                    done();
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'c' );
                            resolve( 'C' );
                        }, 5 );
                    } );
                }
            ] ).then( value => {
                expect( value.length ).toEqual( 3 );
                expect( value[ 2 ].status).toEqual( Sequence.SUCCEEDED );
                expect( value[ 2 ].value ).toEqual( 'C' );
                done();
            } );
        } );

    } );

    describe( 'Sequence.any', () => {
        it( 'Should return a rejected Promise directly if the steps is empty', done => {
            Sequence.any( [] ).catch( () => {
                done();
            } );
        } );

        it( 'Should stop executing after any step succeeded', done => {
            let i = 0;
            Sequence.any( [
                () => Promise.reject(),
                () => true,
                () => i++
            ] ).then( () => {
                expect( i ).toEqual( 0 );
                done();
            } )
        } );

        it( 'Should failed if all the steps failed.', done => {
            Sequence.any( [
                () => Promise.reject(),
                () => Promise.reject(),
                () => Promise.reject()
            ] ).catch( () => {
                done();
            } )
        } );
    } );

    describe( 'Sequence()', () => {
        it( 'Secquence', done => {
            const seq = [];
            new Sequence( [
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'a' );
                            resolve( 'A' );
                        }, 20 );
                    } );
                },
                ( last, index, results ) => {
                    expect( last.status ).toEqual( Sequence.SUCCEEDED );
                    expect( last.value ).toEqual( 'A' );
                    expect( last.time ).toBeLessThanOrEqual( +new Date );
                    expect( results.length ).toEqual( 1 );
                    done();
                    return new Promise( ( resolve, reject ) => {
                        setTimeout( () => {
                            seq.push( 'b' );
                            reject( 'B' );
                        }, 5 );
                    } );
                },
                () => {
                    seq.push( 'c' );
                    return 'C';
                },
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'd' );
                            resolve( 'D' );
                        }, 20 );
                    } );
                }
            ] );
        } );

        it( 'Should have been executed in the order', done => {
            const seq = [];
            new Sequence( [
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'a' );
                            resolve( 'A' );
                        }, 20 );
                    } );
                },
                () => {
                    return new Promise( ( resolve, reject ) => {
                        setTimeout( () => {
                            seq.push( 'b' );
                            reject( 'B' );
                        }, 5 );
                    } );
                },
                () => {
                    seq.push( 'c' );
                    return 'C';
                },
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'd' );
                            resolve( 'D' );
                        }, 20 );
                    } );
                }
            ] ).append( () => {
                expect( seq ).toEqual( [ 'a', 'b', 'c', 'd' ] );
                done();
                seq.push( 'e' );
                return 'E';
            } );
        } );

        it( 'append', done => {
            const seq = [];
            const sequence = new Sequence( [
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'a' );
                            resolve( 'A' );
                        }, 20 );
                    } );
                },
                () => {
                    return new Promise( ( resolve, reject ) => {
                        setTimeout( () => {
                            seq.push( 'b' );
                            reject( 'B' );
                        }, 5 );
                    } );
                },
                () => {
                    seq.push( 'c' );
                    return 'C';
                },
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            seq.push( 'd' );
                            resolve( 'D' );
                        }, 20 );
                    } );
                }
            ] );
            sequence.append( () => {
                return new Promise( resolve => {
                    setTimeout( () => {
                        resolve( 'x' );
                    }, 50 );
                } );
            } );
            setTimeout( () => {
                expect( sequence.busy ).toBeTruthy();
                done();
            }, 0 );
        } );

        it( 'run', done => {
            let i = 0;
            let sequence = new Sequence( [
                () => {
                    expect( i ).toEqual( 1 );
                    done();
                }
            ], { autorun : false } );

            i++;
            sequence.run();
        } );

        it( 'next', done => {
            let i = 0;
            let sequence = new Sequence( [
                () => i++,
                () => i++,
                () => i++
            ], { autorun : false } );

            Sequence.all( [
                () => sequence.next(),
                () => sequence.next(),
                () => sequence.next()
            ] ).then( () => {
                expect( i ).toEqual( 3 );
                done();
            } );
        } );

        it( 'clear', done => {
            let executed = false;
            let sequence = new Sequence( [
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            resolve( 'x' );
                        }, 20 );
                    } );
                },
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            executed = true;
                            resolve( 'y' );
                        }, 20 );
                    } );
                }
            ] );
            sequence.clear();
            expect( sequence.steps.length ).toEqual( 0 );
            setTimeout( () => {
                expect( executed ).toBeFalsy();
                done();
            }, 60 );
        } );

        it( 'go', done => {
            let i = 0;

            let sequence = new Sequence( [
                () => {
                    return new Promise( ( resolve, reject ) => {
                        sleep( 10 ).then( () => {
                            i++;
                            reject( 'x' );
                        } );
                    } );
                }
            ] );

            sequence.on( 'failed', ( data, index ) => {
                i < 2 && sequence.go( index - 1 );
            } );

            sleep( 80 ).then( () => {
                expect( i ).toEqual( 2 );
                done();
            } );

        } );

        it( 'suspended', done => {
            const start = new Date;
            const sequence = new Sequence( [
                () => true,
                () => true
            ] );

            sequence.on( 'success', () => {
                sequence.suspend( 50 );
            } );

            sequence.on( 'end', () => {
                expect( new Date - start ).toBeGreaterThanOrEqual( 50 );
                done();
            } );
        } );

        it( 'stop() should work even if calling it during suspended', done => {
            let i = 0;
            const sequence = new Sequence( [
                () => true,
                () => i++
            ] );

            sequence.on( 'success', () => {
                sequence.suspend( 50 );
                sequence.stop();
            } );

            setTimeout( () => {
                expect( i ).toEqual( 0 );
                done();
            }, 60 );
        } );

        it( 'success event', done => {
            let sequence = new Sequence( [
                () => {
                    return new Promise( resolve => {
                        setTimeout( () => {
                            resolve( 'x' );
                        }, 20 );
                    } );
                }
            ] );

            sequence.on( 'success', ( data, index ) => {
                expect( data.index ).toEqual( 0 );
                expect( index ).toEqual( 0 );
                expect( data.value ).toEqual( 'x' );
                expect( data.status ).toEqual( Sequence.SUCCEEDED ); 
                done();
            } );

        } );

        it( 'failed event', done => {
            let sequence = new Sequence( [
                () => {
                    return new Promise( ( resolve, reject ) => {
                        setTimeout( () => {
                            reject( 'x' );
                        }, 20 );
                    } );
                }
            ] );

            sequence.on( 'failed', ( data, index ) => {
                expect( data.index ).toEqual( 0 );
                expect( index ).toEqual( 0 );
                expect( data.reason ).toEqual( 'x' );
                expect( data.status ).toEqual( Sequence.FAILED ); 
                done();
            } );
        } );

        it( 'end event', done => {
            let sequence = new Sequence( [
                () => {
                    return new Promise( ( resolve, reject ) => {
                        setTimeout( () => {
                            reject( 'x' );
                        }, 20 );
                    } );
                }
            ] );

            sequence.on( 'end', () => {
                expect( sequence.steps.length ).toEqual( sequence.index );
                done();
            } );
        } );

        it( 'should emitted end event every time finishing all steps in the sequence', done => {

            let i = 0;

            let sequence = new Sequence( [
                () => true
            ] );

            sequence.on( 'end', () => {
                i++;
                if( i < 2 ) {
                    sequence.append( () => true );
                }
            } );

            setTimeout( () => {
                expect( i ).toEqual( 2 );
                done();
            }, 50 )
        } );

        it( 'end should be emitted directly if the initial steps is empty', done => {
            let sequence = new Sequence( [] );

            sequence.on( 'end', results => {
                expect( results ).toEqual( [] );
                done();
            } );
        } );

    } );

    describe( 'running with interval', () => {
        it( 'the first step should be executed immediately', done => {
            const start = new Date();
            new Sequence( [
                () => {
                    expect( new Date - start ).toBeLessThan( 500 );
                    done();
                }
            ], { interval : 1000 } )
        } );

        it( 'steps should be execute with an interval', done => {
            const start = new Date();
            const sequence = new Sequence( [
                () => true,
                () => true,
                () => true,
                () => true
            ], { interval : 50 } )

            sequence.on( 'end', () => {
                expect( new Date - start ).toBeGreaterThanOrEqual( 150 );
                done();
            } );
        }, 1000 );

        it( 'should also run correctly if the initial steps argument is empty', done => {

            const start = new Date();
            const sequence = new Sequence( [], { interval : 50 } )

            sequence.append( () => true );
            sequence.append( () => true );
            sequence.append( () => true );

            sequence.append( () => {
                expect( new Date - start ).toBeGreaterThanOrEqual( 150 );
                done();
            } );
        } );
    } );
} );
