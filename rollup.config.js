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
} ];
