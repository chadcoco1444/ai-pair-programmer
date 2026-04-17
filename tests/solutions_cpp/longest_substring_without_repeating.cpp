#include "json_helper.h"

class Solution {
public:
    int lengthOfLongestSubstring(string s) {
        unordered_map<char, int> last;
        int best = 0;
        int left = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            char c = s[right];
            auto it = last.find(c);
            if (it != last.end() && it->second >= left) {
                left = it->second + 1;
            }
            last[c] = right;
            best = max(best, right - left + 1);
        }
        return best;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    string s = to_string_val(args[0]);
    int result = sol.lengthOfLongestSubstring(s);
    cout << result << endl;
    return 0;
}
