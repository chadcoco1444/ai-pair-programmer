#include "json_helper.h"

class Solution {
public:
    int uniquePaths(int m, int n) {
        vector<vector<int>> dp(m, vector<int>(n, 1));
        for (int i = 1; i < m; i++) {
            for (int j = 1; j < n; j++) {
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1];
            }
        }
        return dp[m - 1][n - 1];
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    int m = to_int(args[0]);
    int n = to_int(args[1]);
    int result = sol.uniquePaths(m, n);
    cout << result << endl;
    return 0;
}
