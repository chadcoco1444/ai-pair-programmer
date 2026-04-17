#include "json_helper.h"

class Solution {
public:
    int countSubstrings(string s) {
        int n = s.size();
        int count = 0;
        auto expand = [&](int l, int r) {
            while (l >= 0 && r < n && s[l] == s[r]) {
                count++;
                l--;
                r++;
            }
        };
        for (int i = 0; i < n; i++) {
            expand(i, i);
            expand(i, i + 1);
        }
        return count;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    string s = to_string_val(args[0]);
    int result = sol.countSubstrings(s);
    cout << result << endl;
    return 0;
}
