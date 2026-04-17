#include "json_helper.h"

class Solution {
public:
    bool isAnagram(string s, string t) {
        if (s.size() != t.size()) return false;
        int cnt[26] = {0};
        for (char c : s) cnt[c - 'a']++;
        for (char c : t) {
            if (--cnt[c - 'a'] < 0) return false;
        }
        return true;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    string s = to_string_val(args[0]);
    string t = to_string_val(args[1]);
    bool result = sol.isAnagram(s, t);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
