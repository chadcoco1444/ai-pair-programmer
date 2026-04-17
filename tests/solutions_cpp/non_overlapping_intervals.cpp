#include "json_helper.h"

class Solution {
public:
    int eraseOverlapIntervals(vector<vector<int>>& intervals) {
        if (intervals.empty()) return 0;
        sort(intervals.begin(), intervals.end(),
             [](const vector<int>& a, const vector<int>& b) { return a[1] < b[1]; });
        int removals = 0;
        int prevEnd = intervals[0][1];
        for (size_t i = 1; i < intervals.size(); i++) {
            if (intervals[i][0] < prevEnd) {
                removals++;
            } else {
                prevEnd = intervals[i][1];
            }
        }
        return removals;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto intervals = to_vector_vector_int(args[0]);
    int result = sol.eraseOverlapIntervals(intervals);
    cout << result << endl;
    return 0;
}
