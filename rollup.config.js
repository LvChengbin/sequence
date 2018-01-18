import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';

export default [ {
    input : 'src/sequence.js',
    plugins : [
        resolve( {
            module : true,
            jsnext : true
        } )
    ],
    output : [
        { file : 'dist/sequence.cjs.js', format : 'cjs' },
        { file : 'dist/sequence.js', format : 'umd', name : 'Sequence' }
    ]
}, {
    input : 'src/sequence.js',
    plugins : [
        resolve( {
            jsnext : true
        } ),
        babel()
    ],
    output : [
        { file : 'dist/sequence.bc.js', format : 'umd', name : 'Sequence' }
    ]
} ];
