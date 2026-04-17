#include "json_helper.h"

class Solution {
public:
    bool canJump(vector<int>& nums) {
        int reach = 0;
        int n = (int)nums.size();
        for (int i = 0; i < n; i++) {
            if (i > reach) return false;
            reach = max(reach, i + nums[i]);
        }
        return true;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto nums = to_vector_int(args[0]);
    bool result = sol.canJump(nums);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
