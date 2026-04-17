#include "json_helper.h"

class Solution {
public:
    string longestPalindrome(string s) {
        if (s.empty()) return "";
        int start = 0, end = 0;
        int n = s.size();
        auto expand = [&](int l, int r) {
            while (l >= 0 && r < n && s[l] == s[r]) {
                l--;
                r++;
            }
            return make_pair(l + 1, r - 1);
        };
        for (int i = 0; i < n; i++) {
            auto [l1, r1] = expand(i, i);
            auto [l2, r2] = expand(i, i + 1);
            if (r1 - l1 > end - start) { start = l1; end = r1; }
            if (r2 - l2 > end - start) { start = l2; end = r2; }
        }
        return s.substr(start, end - start + 1);
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    string s = to_string_val(args[0]);
    string result = sol.longestPalindrome(s);
    cout << result << endl;
    return 0;
}
