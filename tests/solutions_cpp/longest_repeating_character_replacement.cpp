#include "json_helper.h"

class Solution {
public:
    int characterReplacement(string s, int k) {
        int cnt[26] = {0};
        int left = 0, maxFreq = 0, best = 0;
        for (int right = 0; right < (int)s.size(); right++) {
            cnt[s[right] - 'A']++;
            maxFreq = max(maxFreq, cnt[s[right] - 'A']);
            while ((right - left + 1) - maxFreq > k) {
                cnt[s[left] - 'A']--;
                left++;
            }
            best = max(best, right - left + 1);
        }
        return best;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    string s = to_string_val(args[0]);
    int k = to_int(args[1]);
    int result = sol.characterReplacement(s, k);
    cout << result << endl;
    return 0;
}
