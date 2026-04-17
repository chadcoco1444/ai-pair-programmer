#include "json_helper.h"

class Solution {
public:
    bool canFinish(int numCourses, vector<vector<int>>& prerequisites) {
        vector<vector<int>> adj(numCourses);
        vector<int> indeg(numCourses, 0);
        for (auto& p : prerequisites) {
            adj[p[1]].push_back(p[0]);
            indeg[p[0]]++;
        }
        queue<int> q;
        for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q.push(i);
        int taken = 0;
        while (!q.empty()) {
            int c = q.front(); q.pop();
            taken++;
            for (int nx : adj[c]) {
                if (--indeg[nx] == 0) q.push(nx);
            }
        }
        return taken == numCourses;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    int numCourses = to_int(args[0]);
    auto prereqs = to_vector_vector_int(args[1]);
    bool result = sol.canFinish(numCourses, prereqs);
    cout << (result ? "true" : "false") << endl;
    return 0;
}
