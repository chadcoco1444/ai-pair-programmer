#include "json_helper.h"

class Solution {
public:
    bool wordBreak(string s, vector<string>& wordDict) {
        unordered_set<string> dict(wordDict.begin(), wordDict.end());
        int n = (int)s.size();
        vector<bool> dp(n + 1, false);
        dp[0] = true;
        for (int i = 1; i <= n; i++) {
            for (int j = 0; j < i; j++) {
                if (dp[j] && dict.count(s.substr(j, i - j))) {
                    dp[i] = true;
                    break;
                }
            }
        }
        return dp[n];
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    string s = to_string_val(args[0]);
    auto wordDict = to_vector_string(args[1]);
    bool result = sol.wordBreak(s, wordDict);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
