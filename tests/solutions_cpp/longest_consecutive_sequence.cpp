#include "json_helper.h"

class Solution {
public:
    int longestConsecutive(vector<int>& nums) {
        unordered_set<int> s(nums.begin(), nums.end());
        int best = 0;
        for (int n : s) {
            if (!s.count(n - 1)) {
                int curr = n;
                int len = 1;
                while (s.count(curr + 1)) {
                    curr++;
                    len++;
                }
                best = max(best, len);
            }
        }
        return best;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto nums = to_vector_int(args[0]);
    int result = sol.longestConsecutive(nums);
    cout << result << endl;
    return 0;
}
