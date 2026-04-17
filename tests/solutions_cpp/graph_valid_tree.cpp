#include "json_helper.h"

class Solution {
public:
    bool validTree(int n, vector<vector<int>>& edges) {
        if ((int)edges.size() != n - 1) return false;
        vector<int> parent(n);
        iota(parent.begin(), parent.end(), 0);
        function<int(int)> find = [&](int x) {
            while (parent[x] != x) {
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        };
        for (auto& e : edges) {
            int a = find(e[0]), b = find(e[1]);
            if (a == b) return false;
            parent[a] = b;
        }
        return true;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    int n = to_int(args[0]);
    auto edges = to_vector_vector_int(args[1]);
    bool result = sol.validTree(n, edges);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
