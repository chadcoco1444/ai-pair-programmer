#include "json_helper.h"

class Solution {
public:
    int maxProduct(vector<int>& nums) {
        int best = nums[0];
        int curMax = nums[0];
        int curMin = nums[0];
        for (size_t i = 1; i < nums.size(); i++) {
            int n = nums[i];
            int tmpMax = max({n, curMax * n, curMin * n});
            int tmpMin = min({n, curMax * n, curMin * n});
            curMax = tmpMax;
            curMin = tmpMin;
            best = max(best, curMax);
        }
        return best;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto nums = to_vector_int(args[0]);
    int result = sol.maxProduct(nums);
    cout << result << endl;
    return 0;
}
