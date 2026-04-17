#include "json_helper.h"

class Solution {
public:
    vector<vector<int>> pacificAtlantic(vector<vector<int>>& heights) {
        vector<vector<int>> result;
        if (heights.empty() || heights[0].empty()) return result;
        int rows = heights.size(), cols = heights[0].size();
        vector<vector<bool>> pac(rows, vector<bool>(cols, false));
        vector<vector<bool>> atl(rows, vector<bool>(cols, false));
        for (int r = 0; r < rows; r++) {
            dfs(heights, r, 0, pac, rows, cols);
            dfs(heights, r, cols - 1, atl, rows, cols);
        }
        for (int c = 0; c < cols; c++) {
            dfs(heights, 0, c, pac, rows, cols);
            dfs(heights, rows - 1, c, atl, rows, cols);
        }
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (pac[r][c] && atl[r][c]) result.push_back({r, c});
            }
        }
        sort(result.begin(), result.end());
        return result;
    }
private:
    void dfs(vector<vector<int>>& h, int r, int c, vector<vector<bool>>& visited, int rows, int cols) {
        if (visited[r][c]) return;
        visited[r][c] = true;
        int dr[] = {0, 0, 1, -1};
        int dc[] = {1, -1, 0, 0};
        for (int i = 0; i < 4; i++) {
            int nr = r + dr[i], nc = c + dc[i];
            if (nr >= 0 && nr < rows && nc >= 0 && nc < cols &&
                !visited[nr][nc] && h[nr][nc] >= h[r][c]) {
                dfs(h, nr, nc, visited, rows, cols);
            }
        }
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto heights = to_vector_vector_int(args[0]);
    auto result = sol.pacificAtlantic(heights);
    cout << to_json(result) << endl;
    return 0;
}
