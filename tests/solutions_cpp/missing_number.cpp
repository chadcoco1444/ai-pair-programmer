#include "json_helper.h"

class Solution {
public:
    int missingNumber(vector<int>& nums) {
        int n = nums.size();
        long long expected = (long long)n * (n + 1) / 2;
        long long actual = 0;
        for (int x : nums) actual += x;
        return (int)(expected - actual);
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto nums = to_vector_int(args[0]);
    int result = sol.missingNumber(nums);
    cout << result << endl;
    return 0;
}
