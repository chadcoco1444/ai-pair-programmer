#include "json_helper.h"

struct TrieNode {
    unordered_map<char, TrieNode*> children;
    bool is_end = false;
};

class Trie {
public:
    TrieNode* root;
    Trie() { root = new TrieNode(); }

    void insert(const string& word) {
        TrieNode* node = root;
        for (char c : word) {
            if (!node->children.count(c)) node->children[c] = new TrieNode();
            node = node->children[c];
        }
        node->is_end = true;
    }

    bool search(const string& word) {
        TrieNode* node = root;
        for (char c : word) {
            auto it = node->children.find(c);
            if (it == node->children.end()) return false;
            node = it->second;
        }
        return node->is_end;
    }

    bool startsWith(const string& prefix) {
        TrieNode* node = root;
        for (char c : prefix) {
            auto it = node->children.find(c);
            if (it == node->children.end()) return false;
            node = it->second;
        }
        return true;
    }
};

int main() {
    auto args = parse_args();
    auto& outer = args[0].to_obj();
    auto& ops = outer.at("ops").to_arr();
    auto& opArgs = outer.at("args").to_arr();

    Trie trie;
    MultiOpResult results;
    results.add_null(); // constructor
    for (size_t i = 1; i < ops.size(); i++) {
        const string& op = ops[i].to_str();
        auto& a = opArgs[i].to_arr();
        if (op == "insert") {
            trie.insert(a[0].to_str());
            results.add_null();
        } else if (op == "search") {
            results.add_bool(trie.search(a[0].to_str()));
        } else if (op == "startsWith") {
            results.add_bool(trie.startsWith(a[0].to_str()));
        }
    }
    cout << results.to_json_str() << endl;
    return 0;
}
