#include "json_helper.h"

class Solution {
public:
    vector<int> productExceptSelf(vector<int>& nums) {
        int n = nums.size();
        vector<int> result(n, 1);
        int left = 1;
        for (int i = 0; i < n; i++) {
            result[i] = left;
            left *= nums[i];
        }
        int right = 1;
        for (int i = n - 1; i >= 0; i--) {
            result[i] *= right;
            right *= nums[i];
        }
        return result;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto nums = to_vector_int(args[0]);
    auto result = sol.productExceptSelf(nums);
    cout << to_json(result) << endl;
    return 0;
}
