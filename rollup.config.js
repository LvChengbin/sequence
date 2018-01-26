import babel from 'rollup-plugin-babel';
import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

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
        commonjs( {
            sourceMap : false
        } ),
        babel()
    ],
    output : [
        { file : 'dist/sequence.bc.js', format : 'umd', name : 'Sequence' }
    ]
} ];
