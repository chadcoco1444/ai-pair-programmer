#include "json_helper.h"

class Solution {
public:
    int coinChange(vector<int>& coins, int amount) {
        vector<int> dp(amount + 1, amount + 1);
        dp[0] = 0;
        for (int i = 1; i <= amount; i++) {
            for (int c : coins) {
                if (c <= i && dp[i - c] + 1 < dp[i]) {
                    dp[i] = dp[i - c] + 1;
                }
            }
        }
        return dp[amount] > amount ? -1 : dp[amount];
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto coins = to_vector_int(args[0]);
    int amount = to_int(args[1]);
    int result = sol.coinChange(coins, amount);
    cout << result << endl;
    return 0;
}
