#include "json_helper.h"

class Solution {
public:
    vector<int> spiralOrder(vector<vector<int>>& matrix) {
        vector<int> result;
        if (matrix.empty() || matrix[0].empty()) return result;
        int top = 0, bottom = (int)matrix.size() - 1;
        int left = 0, right = (int)matrix[0].size() - 1;

        while (top <= bottom && left <= right) {
            for (int c = left; c <= right; c++) result.push_back(matrix[top][c]);
            top++;
            for (int r = top; r <= bottom; r++) result.push_back(matrix[r][right]);
            right--;
            if (top <= bottom) {
                for (int c = right; c >= left; c--) result.push_back(matrix[bottom][c]);
                bottom--;
            }
            if (left <= right) {
                for (int r = bottom; r >= top; r--) result.push_back(matrix[r][left]);
                left++;
            }
        }
        return result;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto matrix = to_vector_vector_int(args[0]);
    auto result = sol.spiralOrder(matrix);
    cout << to_json(result) << endl;
    return 0;
}
