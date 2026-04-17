#include "json_helper.h"

class Solution {
public:
    int countComponents(int n, vector<vector<int>>& edges) {
        vector<int> parent(n);
        iota(parent.begin(), parent.end(), 0);
        vector<int> rank_(n, 0);
        function<int(int)> find = [&](int x) {
            while (parent[x] != x) {
                parent[x] = parent[parent[x]];
                x = parent[x];
            }
            return x;
        };
        int components = n;
        for (auto& e : edges) {
            int a = find(e[0]), b = find(e[1]);
            if (a == b) continue;
            if (rank_[a] < rank_[b]) swap(a, b);
            parent[b] = a;
            if (rank_[a] == rank_[b]) rank_[a]++;
            components--;
        }
        return components;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    int n = to_int(args[0]);
    auto edges = to_vector_vector_int(args[1]);
    cout << sol.countComponents(n, edges) << endl;
    return 0;
}
