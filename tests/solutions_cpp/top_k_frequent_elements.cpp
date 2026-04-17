#include "json_helper.h"

class Solution {
public:
    vector<int> topKFrequent(vector<int>& nums, int k) {
        unordered_map<int, int> count;
        for (int n : nums) count[n]++;
        // Min-heap of size k by frequency
        priority_queue<pair<int,int>, vector<pair<int,int>>, greater<pair<int,int>>> pq;
        for (auto& [val, cnt] : count) {
            pq.push({cnt, val});
            if ((int)pq.size() > k) pq.pop();
        }
        vector<int> result;
        while (!pq.empty()) {
            result.push_back(pq.top().second);
            pq.pop();
        }
        sort(result.begin(), result.end());
        return result;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto nums = to_vector_int(args[0]);
    int k = to_int(args[1]);
    auto result = sol.topKFrequent(nums, k);
    cout << to_json(result) << endl;
    return 0;
}
