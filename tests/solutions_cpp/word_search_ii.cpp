#include "json_helper.h"

struct TrieNode {
    unordered_map<char, TrieNode*> children;
    string word; // non-empty if end of word
};

class Solution {
public:
    vector<string> findWords(vector<vector<char>>& board, vector<string>& words) {
        TrieNode* root = new TrieNode();
        for (const string& w : words) {
            TrieNode* node = root;
            for (char c : w) {
                if (!node->children.count(c)) node->children[c] = new TrieNode();
                node = node->children[c];
            }
            node->word = w;
        }
        int rows = board.size();
        int cols = board[0].size();
        vector<string> result;

        function<void(int, int, TrieNode*)> dfs = [&](int r, int c, TrieNode* node) {
            char ch = board[r][c];
            auto it = node->children.find(ch);
            if (it == node->children.end()) return;
            TrieNode* nxt = it->second;
            if (!nxt->word.empty()) {
                result.push_back(nxt->word);
                nxt->word.clear();
            }
            board[r][c] = '#';
            int dr[] = {-1, 1, 0, 0};
            int dc[] = {0, 0, -1, 1};
            for (int k = 0; k < 4; k++) {
                int nr = r + dr[k], nc = c + dc[k];
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] != '#') {
                    dfs(nr, nc, nxt);
                }
            }
            board[r][c] = ch;
            if (nxt->children.empty()) {
                node->children.erase(it);
            }
        };

        for (int r = 0; r < rows; r++) {
            for (int c = 0; c < cols; c++) {
                dfs(r, c, root);
            }
        }
        sort(result.begin(), result.end());
        return result;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto board = to_vector_vector_char(args[0]);
    auto words = to_vector_string(args[1]);
    auto result = sol.findWords(board, words);
    cout << to_json(result) << endl;
    return 0;
}
