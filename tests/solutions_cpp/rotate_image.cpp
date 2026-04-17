#include "json_helper.h"

class Solution {
public:
    void rotate(vector<vector<int>>& matrix) {
        int n = matrix.size();
        // Transpose
        for (int i = 0; i < n; i++) {
            for (int j = i + 1; j < n; j++) {
                swap(matrix[i][j], matrix[j][i]);
            }
        }
        // Reverse each row
        for (auto& row : matrix) {
            reverse(row.begin(), row.end());
        }
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto matrix = to_vector_vector_int(args[0]);
    sol.rotate(matrix);
    cout << to_json(matrix) << endl;
    return 0;
}
