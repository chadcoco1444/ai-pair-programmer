class Codec {
    encode(strs) {
        return strs.map(s => `${s.length}#${s}`).join('');
    }

    decode(s) {
        const result = [];
        let i = 0;
        while (i < s.length) {
            const j = s.indexOf('#', i);
            const length = parseInt(s.slice(i, j), 10);
            result.push(s.slice(j + 1, j + 1 + length));
            i = j + 1 + length;
        }
        return result;
    }
}
