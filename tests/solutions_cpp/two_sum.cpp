#include "json_helper.h"

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        unordered_map<int, int> m;
        for (int i = 0; i < (int)nums.size(); i++) {
            int c = target - nums[i];
            auto it = m.find(c);
            if (it != m.end()) return {it->second, i};
            m[nums[i]] = i;
        }
        return {};
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto nums = to_vector_int(args[0]);
    int target = to_int(args[1]);
    auto result = sol.twoSum(nums, target);
    cout << to_json(result) << endl;
    return 0;
}
