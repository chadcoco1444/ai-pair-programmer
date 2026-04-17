#include "json_helper.h"

class Solution {
public:
    string minWindow(string s, string t) {
        if (s.empty() || t.empty()) return "";
        unordered_map<char, int> need;
        for (char c : t) need[c]++;
        int missing = t.size();
        int bestLeft = 0, bestLen = INT_MAX;
        int left = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            char c = s[right];
            if (need[c] > 0) missing--;
            need[c]--;
            if (missing == 0) {
                while (need[s[left]] < 0) {
                    need[s[left]]++;
                    left++;
                }
                if (right - left + 1 < bestLen) {
                    bestLen = right - left + 1;
                    bestLeft = left;
                }
                need[s[left]]++;
                missing++;
                left++;
            }
        }
        return bestLen == INT_MAX ? "" : s.substr(bestLeft, bestLen);
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    string s = to_string_val(args[0]);
    string t = to_string_val(args[1]);
    string result = sol.minWindow(s, t);
    cout << result << endl;
    return 0;
}
