class Solution {
    countBits(n) {
        const dp = new Array(n + 1).fill(0);
        for (let i = 1; i <= n; i++) {
            dp[i] = dp[i & (i - 1)] + 1;
        }
        return dp;
    }
}
