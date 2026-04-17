#include "json_helper.h"

class Solution {
public:
    vector<vector<string>> groupAnagrams(vector<string>& strs) {
        unordered_map<string, vector<string>> groups;
        for (auto& w : strs) {
            string key = w;
            sort(key.begin(), key.end());
            groups[key].push_back(w);
        }
        vector<vector<string>> result;
        for (auto& kv : groups) {
            result.push_back(kv.second);
        }
        return result;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto strs = to_vector_string(args[0]);
    auto result = sol.groupAnagrams(strs);
    // Sort each group, then sort groups, for deterministic output
    for (auto& g : result) sort(g.begin(), g.end());
    sort(result.begin(), result.end());
    // Serialize vector<vector<string>>
    string out = "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) out += ",";
        out += to_json(result[i]);
    }
    out += "]";
    cout << out << endl;
    return 0;
}
