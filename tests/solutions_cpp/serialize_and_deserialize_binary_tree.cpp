#include "json_helper.h"

class Codec {
public:
    string serialize(TreeNode* root) {
        if (!root) return "";
        string out;
        queue<TreeNode*> q;
        q.push(root);
        bool first = true;
        while (!q.empty()) {
            TreeNode* n = q.front(); q.pop();
            if (!first) out += ",";
            first = false;
            if (!n) {
                out += "null";
            } else {
                out += to_string(n->val);
                q.push(n->left);
                q.push(n->right);
            }
        }
        return out;
    }

    TreeNode* deserialize(string data) {
        if (data.empty()) return nullptr;
        vector<string> tokens;
        string cur;
        for (char c : data) {
            if (c == ',') { tokens.push_back(cur); cur.clear(); }
            else cur += c;
        }
        if (!cur.empty()) tokens.push_back(cur);
        if (tokens.empty() || tokens[0] == "null") return nullptr;
        TreeNode* root = new TreeNode(stoi(tokens[0]));
        queue<TreeNode*> q;
        q.push(root);
        size_t i = 1;
        while (!q.empty() && i < tokens.size()) {
            TreeNode* node = q.front(); q.pop();
            if (i < tokens.size() && tokens[i] != "null") {
                node->left = new TreeNode(stoi(tokens[i]));
                q.push(node->left);
            }
            i++;
            if (i < tokens.size() && tokens[i] != "null") {
                node->right = new TreeNode(stoi(tokens[i]));
                q.push(node->right);
            }
            i++;
        }
        return root;
    }
};

int main() {
    auto args = parse_args();
    auto tree = build_tree(args[0]);
    Codec c;
    auto s = c.serialize(tree);
    auto r = c.deserialize(s);
    cout << tree_to_json(r) << endl;
    return 0;
}
