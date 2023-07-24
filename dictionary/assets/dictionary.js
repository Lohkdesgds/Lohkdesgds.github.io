// Larinuim dictionary in array/objectified way

const __dict = [
    {
        l: 'tue',
        d: [
            'ser',
            'estar'
        ]
    }
];

function larinuim_FIND_WORD(word) {
    let opts = [];
    for(let i = 0; i < __dict.length; ++i) {
        const obj = __dict[i];
        if (obj.l == word) opts[opts.length] = obj;
    }
    return opts;
}
function larinuim_FIND_REVERSE(revs) {
    let opts = [];
    for(let i = 0; i < __dict.length; ++i) {
        const obj = __dict[i];
        for(let j = 0; j < obj.d.length; ++j) {
            if (obj.d[j].indexOf(revs) >= 0) {
                opts[opts.length] = obj;
                break;
            }
        }
    }
    return opts;
}
function larinuim_LENGTH() {
    return __dict.length;
}
function larinuim_INDEX(index) {
    if (index >= __dict.length) return null;
    return __dict[index];
}