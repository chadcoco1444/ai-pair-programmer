#include "json_helper.h"

class Solution {
public:
    int rob(vector<int>& nums) {
        int prev = 0, curr = 0;
        for (int n : nums) {
            int next = max(curr, prev + n);
            prev = curr;
            curr = next;
        }
        return curr;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto nums = to_vector_int(args[0]);
    int result = sol.rob(nums);
    cout << result << endl;
    return 0;
}
