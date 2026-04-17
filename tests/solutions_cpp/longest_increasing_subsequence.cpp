#include "json_helper.h"

class Solution {
public:
    int lengthOfLIS(vector<int>& nums) {
        vector<int> tails;
        for (int n : nums) {
            auto it = lower_bound(tails.begin(), tails.end(), n);
            if (it == tails.end()) tails.push_back(n);
            else *it = n;
        }
        return (int)tails.size();
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto nums = to_vector_int(args[0]);
    int result = sol.lengthOfLIS(nums);
    cout << result << endl;
    return 0;
}
