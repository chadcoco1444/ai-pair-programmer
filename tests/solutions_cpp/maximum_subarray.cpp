#include "json_helper.h"

class Solution {
public:
    int maxSubArray(vector<int>& nums) {
        int best = nums[0];
        int curr = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            curr = max(nums[i], curr + nums[i]);
            best = max(best, curr);
        }
        return best;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto nums = to_vector_int(args[0]);
    int result = sol.maxSubArray(nums);
    cout << result << endl;
    return 0;
}
