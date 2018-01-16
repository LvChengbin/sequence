const checks = {
    string : s => typeof s === 'string' || s instanceof String,
    function : f => {
        const type = ({}).toString.call( f ).toLowerCase();
        return ( type === '[object function]' ) || ( type === '[object asyncfunction]' );
    },
    promise : p => p && checks.function( p.then ),
    boolean : s => typeof s === 'boolean',
    regexp : obj => ({}).toString.call( obj ).toLowerCase() === '[object regexp]'
};

export default checks;
