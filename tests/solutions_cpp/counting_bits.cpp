#include "json_helper.h"

class Solution {
public:
    vector<int> countBits(int n) {
        vector<int> dp(n + 1, 0);
        for (int i = 1; i <= n; i++) {
            dp[i] = dp[i >> 1] + (i & 1);
        }
        return dp;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    int n = to_int(args[0]);
    auto result = sol.countBits(n);
    cout << to_json(result) << endl;
    return 0;
}
