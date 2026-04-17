class Solution {
    getSum(a, b) {
        while (b !== 0) {
            const carry = a & b;
            a = a ^ b;
            b = carry << 1;
        }
        return a;
    }
}
