#include "json_helper.h"

class Solution {
public:
    int numDecodings(string s) {
        int n = (int)s.size();
        if (n == 0 || s[0] == '0') return 0;
        vector<int> dp(n + 1, 0);
        dp[0] = 1;
        dp[1] = 1;
        for (int i = 2; i <= n; i++) {
            int one = s[i - 1] - '0';
            int two = (s[i - 2] - '0') * 10 + one;
            if (one >= 1 && one <= 9) dp[i] += dp[i - 1];
            if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
        }
        return dp[n];
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    string s = to_string_val(args[0]);
    int result = sol.numDecodings(s);
    cout << result << endl;
    return 0;
}
