class Solution {
    groupAnagrams(strs) {
        const groups = {};
        for (const word of strs) {
            const key = word.split('').sort().join('');
            if (!groups[key]) groups[key] = [];
            groups[key].push(word);
        }
        return Object.values(groups);
    }
}
