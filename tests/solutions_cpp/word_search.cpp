#include "json_helper.h"

class Solution {
public:
    bool exist(vector<vector<char>>& board, string word) {
        int rows = board.size();
        int cols = board[0].size();
        function<bool(int, int, int)> dfs = [&](int r, int c, int idx) -> bool {
            if (idx == (int)word.size()) return true;
            if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
            if (board[r][c] != word[idx]) return false;
            char tmp = board[r][c];
            board[r][c] = '#';
            bool found = dfs(r + 1, c, idx + 1) || dfs(r - 1, c, idx + 1)
                      || dfs(r, c + 1, idx + 1) || dfs(r, c - 1, idx + 1);
            board[r][c] = tmp;
            return found;
        };
        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                if (dfs(r, c, 0)) return true;
            }
        }
        return false;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto board = to_vector_vector_char(args[0]);
    string word = to_string_val(args[1]);
    bool result = sol.exist(board, word);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
