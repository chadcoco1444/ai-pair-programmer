class Solution {
    isPalindrome(s) {
        const filtered = s.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
        return filtered === filtered.split('').reverse().join('');
    }
}
