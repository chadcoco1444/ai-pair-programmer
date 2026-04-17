class Solution {
    coinChange(coins, amount) {
        const dp = new Array(amount + 1).fill(Infinity);
        dp[0] = 0;
        for (let i = 1; i <= amount; i++) {
            for (const coin of coins) {
                if (coin <= i) {
                    dp[i] = Math.min(dp[i], dp[i - coin] + 1);
                }
            }
        }
        return dp[amount] !== Infinity ? dp[amount] : -1;
    }
}
