#include "json_helper.h"

class Solution {
public:
    void setZeroes(vector<vector<int>>& matrix) {
        int rows = matrix.size();
        int cols = matrix[0].size();
        bool firstRowZero = false, firstColZero = false;
        for (int c = 0; c < cols; c++) if (matrix[0][c] == 0) { firstRowZero = true; break; }
        for (int r = 0; r < rows; r++) if (matrix[r][0] == 0) { firstColZero = true; break; }

        for (int r = 1; r < rows; r++) {
            for (int c = 1; c < cols; c++) {
                if (matrix[r][c] == 0) {
                    matrix[r][0] = 0;
                    matrix[0][c] = 0;
                }
            }
        }
        for (int r = 1; r < rows; r++) {
            for (int c = 1; c < cols; c++) {
                if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
            }
        }
        if (firstRowZero) for (int c = 0; c < cols; c++) matrix[0][c] = 0;
        if (firstColZero) for (int r = 0; r < rows; r++) matrix[r][0] = 0;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto matrix = to_vector_vector_int(args[0]);
    sol.setZeroes(matrix);
    cout << to_json(matrix) << endl;
    return 0;
}
