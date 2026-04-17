#include "json_helper.h"

class Solution {
public:
    vector<vector<int>> combinationSum(vector<int>& candidates, int target) {
        vector<vector<int>> result;
        vector<int> current;
        sort(candidates.begin(), candidates.end());
        function<void(int, int)> backtrack = [&](int start, int remaining) {
            if (remaining == 0) {
                result.push_back(current);
                return;
            }
            for (int i = start; i < (int)candidates.size(); i++) {
                if (candidates[i] > remaining) break;
                current.push_back(candidates[i]);
                backtrack(i, remaining - candidates[i]);
                current.pop_back();
            }
        };
        backtrack(0, target);
        return result;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto candidates = to_vector_int(args[0]);
    int target = to_int(args[1]);
    auto result = sol.combinationSum(candidates, target);
    cout << to_json(result) << endl;
    return 0;
}
