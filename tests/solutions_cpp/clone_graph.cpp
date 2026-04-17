#include "json_helper.h"

class Solution {
public:
    GraphNode* cloneGraph(GraphNode* node) {
        if (!node) return nullptr;
        unordered_map<GraphNode*, GraphNode*> m;
        return clone(node, m);
    }
private:
    GraphNode* clone(GraphNode* node, unordered_map<GraphNode*, GraphNode*>& m) {
        auto it = m.find(node);
        if (it != m.end()) return it->second;
        GraphNode* copy = new GraphNode(node->val);
        m[node] = copy;
        for (auto* nb : node->neighbors) {
            copy->neighbors.push_back(clone(nb, m));
        }
        return copy;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto g = build_graph(args[0]);
    cout << graph_to_json(sol.cloneGraph(g)) << endl;
    return 0;
}
