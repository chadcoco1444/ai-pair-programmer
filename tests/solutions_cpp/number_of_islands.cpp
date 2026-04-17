#include "json_helper.h"

class Solution {
public:
    int numIslands(vector<vector<char>>& grid) {
        if (grid.empty() || grid[0].empty()) return 0;
        int rows = grid.size(), cols = grid[0].size();
        int count = 0;
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (grid[r][c] == '1') {
                    count++;
                    dfs(grid, r, c, rows, cols);
                }
            }
        }
        return count;
    }
private:
    void dfs(vector<vector<char>>& grid, int r, int c, int rows, int cols) {
        if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] != '1') return;
        grid[r][c] = '0';
        dfs(grid, r+1, c, rows, cols);
        dfs(grid, r-1, c, rows, cols);
        dfs(grid, r, c+1, rows, cols);
        dfs(grid, r, c-1, rows, cols);
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto grid = to_vector_vector_char(args[0]);
    cout << sol.numIslands(grid) << endl;
    return 0;
}
