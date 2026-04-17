#include "json_helper.h"

class Solution {
public:
    int maxArea(vector<int>& height) {
        int left = 0, right = height.size() - 1;
        int best = 0;
        while (left < right) {
            int h = min(height[left], height[right]);
            int area = h * (right - left);
            if (area > best) best = area;
            if (height[left] < height[right]) left++;
            else right--;
        }
        return best;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto height = to_vector_int(args[0]);
    int result = sol.maxArea(height);
    cout << result << endl;
    return 0;
}
