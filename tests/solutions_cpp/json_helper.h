#ifndef JSON_HELPER_H
#define JSON_HELPER_H

#include <iostream>
#include <fstream>
#include <sstream>
#include <string>
#include <vector>
#include <variant>
#include <map>
#include <memory>
#include <algorithm>
#include <queue>
#include <climits>
#include <cmath>
#include <functional>
#include <unordered_map>
#include <unordered_set>
#include <set>
#include <stack>
#include <numeric>
#include <cassert>
#include <cctype>

using namespace std;

// ============================================================
// Minimal JSON value type
// ============================================================

struct JsonValue;
using JsonArray = std::vector<JsonValue>;
using JsonObject = std::map<std::string, JsonValue>;

struct JsonValue {
    enum Type { NUL, BOOL, NUMBER, STRING, ARRAY, OBJECT };
    Type type;
    bool bool_val;
    double num_val;
    std::string str_val;
    JsonArray arr_val;
    JsonObject obj_val;

    JsonValue() : type(NUL), bool_val(false), num_val(0) {}
    JsonValue(bool b) : type(BOOL), bool_val(b), num_val(0) {}
    JsonValue(int n) : type(NUMBER), bool_val(false), num_val(n) {}
    JsonValue(double n) : type(NUMBER), bool_val(false), num_val(n) {}
    JsonValue(const std::string& s) : type(STRING), bool_val(false), num_val(0), str_val(s) {}
    JsonValue(const char* s) : type(STRING), bool_val(false), num_val(0), str_val(s) {}
    JsonValue(const JsonArray& a) : type(ARRAY), bool_val(false), num_val(0), arr_val(a) {}
    JsonValue(const JsonObject& o) : type(OBJECT), bool_val(false), num_val(0), obj_val(o) {}

    bool is_null() const { return type == NUL; }
    bool is_bool() const { return type == BOOL; }
    bool is_number() const { return type == NUMBER; }
    bool is_string() const { return type == STRING; }
    bool is_array() const { return type == ARRAY; }
    bool is_object() const { return type == OBJECT; }

    int to_int() const { return (int)num_val; }
    double to_double() const { return num_val; }
    const std::string& to_str() const { return str_val; }
    const JsonArray& to_arr() const { return arr_val; }
    const JsonObject& to_obj() const { return obj_val; }
};

// ============================================================
// JSON parser
// ============================================================

class JsonParser {
    const std::string& s;
    size_t pos;

    void skip_ws() {
        while (pos < s.size() && (s[pos]==' '||s[pos]=='\t'||s[pos]=='\n'||s[pos]=='\r')) pos++;
    }

    JsonValue parse_value() {
        skip_ws();
        if (pos >= s.size()) return JsonValue();
        char c = s[pos];
        if (c == '"') return parse_string();
        if (c == '[') return parse_array();
        if (c == '{') return parse_object();
        if (c == 't') { pos += 4; return JsonValue(true); }
        if (c == 'f') { pos += 5; return JsonValue(false); }
        if (c == 'n') { pos += 4; return JsonValue(); }
        return parse_number();
    }

    JsonValue parse_string() {
        pos++; // skip opening quote
        std::string result;
        while (pos < s.size() && s[pos] != '"') {
            if (s[pos] == '\\') {
                pos++;
                if (pos < s.size()) {
                    switch (s[pos]) {
                        case '"': result += '"'; break;
                        case '\\': result += '\\'; break;
                        case '/': result += '/'; break;
                        case 'n': result += '\n'; break;
                        case 't': result += '\t'; break;
                        case 'r': result += '\r'; break;
                        case 'b': result += '\b'; break;
                        case 'f': result += '\f'; break;
                        case 'u': {
                            // Basic unicode escape - just take 4 hex digits
                            if (pos + 4 < s.size()) {
                                std::string hex = s.substr(pos+1, 4);
                                int code = std::stoi(hex, nullptr, 16);
                                if (code < 128) result += (char)code;
                                else result += '?';
                                pos += 4;
                            }
                            break;
                        }
                        default: result += s[pos]; break;
                    }
                }
            } else {
                result += s[pos];
            }
            pos++;
        }
        if (pos < s.size()) pos++; // skip closing quote
        return JsonValue(result);
    }

    JsonValue parse_number() {
        size_t start = pos;
        if (pos < s.size() && s[pos] == '-') pos++;
        while (pos < s.size() && std::isdigit(s[pos])) pos++;
        bool is_float = false;
        if (pos < s.size() && s[pos] == '.') { is_float = true; pos++; while (pos < s.size() && std::isdigit(s[pos])) pos++; }
        if (pos < s.size() && (s[pos] == 'e' || s[pos] == 'E')) { is_float = true; pos++; if (pos < s.size() && (s[pos]=='+' || s[pos]=='-')) pos++; while (pos < s.size() && std::isdigit(s[pos])) pos++; }
        std::string num_str = s.substr(start, pos - start);
        return JsonValue(std::stod(num_str));
    }

    JsonValue parse_array() {
        pos++; // skip [
        JsonArray arr;
        skip_ws();
        if (pos < s.size() && s[pos] == ']') { pos++; return JsonValue(arr); }
        while (pos < s.size()) {
            arr.push_back(parse_value());
            skip_ws();
            if (pos < s.size() && s[pos] == ',') { pos++; continue; }
            if (pos < s.size() && s[pos] == ']') { pos++; break; }
        }
        return JsonValue(arr);
    }

    JsonValue parse_object() {
        pos++; // skip {
        JsonObject obj;
        skip_ws();
        if (pos < s.size() && s[pos] == '}') { pos++; return JsonValue(obj); }
        while (pos < s.size()) {
            skip_ws();
            JsonValue key = parse_string();
            skip_ws();
            pos++; // skip :
            JsonValue val = parse_value();
            obj[key.str_val] = val;
            skip_ws();
            if (pos < s.size() && s[pos] == ',') { pos++; continue; }
            if (pos < s.size() && s[pos] == '}') { pos++; break; }
        }
        return JsonValue(obj);
    }

public:
    JsonParser(const std::string& input) : s(input), pos(0) {}
    JsonValue parse() { return parse_value(); }
};

inline JsonValue json_parse(const std::string& s) {
    JsonParser p(s);
    return p.parse();
}

// ============================================================
// Read args from file
// ============================================================

inline JsonArray parse_args(const std::string& path = "/tmp/args.json") {
    std::ifstream f(path);
    std::string content((std::istreambuf_iterator<char>(f)),
                         std::istreambuf_iterator<char>());
    JsonValue v = json_parse(content);
    return v.to_arr();
}

// ============================================================
// Conversion helpers
// ============================================================

inline int to_int(const JsonValue& v) {
    return v.to_int();
}

inline double to_double(const JsonValue& v) {
    return v.to_double();
}

inline std::string to_string_val(const JsonValue& v) {
    return v.to_str();
}

inline bool to_bool(const JsonValue& v) {
    if (v.is_bool()) return v.bool_val;
    return v.num_val != 0;
}

inline std::vector<int> to_vector_int(const JsonValue& v) {
    std::vector<int> r;
    for (auto& x : v.to_arr()) r.push_back(x.to_int());
    return r;
}

inline std::vector<double> to_vector_double(const JsonValue& v) {
    std::vector<double> r;
    for (auto& x : v.to_arr()) r.push_back(x.to_double());
    return r;
}

inline std::vector<std::string> to_vector_string(const JsonValue& v) {
    std::vector<std::string> r;
    for (auto& x : v.to_arr()) r.push_back(x.to_str());
    return r;
}

inline std::vector<std::vector<int>> to_vector_vector_int(const JsonValue& v) {
    std::vector<std::vector<int>> r;
    for (auto& x : v.to_arr()) r.push_back(to_vector_int(x));
    return r;
}

inline std::vector<std::vector<std::string>> to_vector_vector_string(const JsonValue& v) {
    std::vector<std::vector<std::string>> r;
    for (auto& x : v.to_arr()) r.push_back(to_vector_string(x));
    return r;
}

inline std::vector<std::vector<char>> to_vector_vector_char(const JsonValue& v) {
    std::vector<std::vector<char>> r;
    for (auto& row : v.to_arr()) {
        std::vector<char> cr;
        for (auto& c : row.to_arr()) {
            cr.push_back(c.to_str()[0]);
        }
        r.push_back(cr);
    }
    return r;
}

// ============================================================
// JSON output helpers
// ============================================================

inline std::string to_json(int v) { return std::to_string(v); }
inline std::string to_json(long long v) { return std::to_string(v); }
inline std::string to_json(unsigned int v) { return std::to_string(v); }

inline std::string to_json(double v) {
    // Format: if integer value, show as X.0; otherwise show decimal
    if (v == (int)v) {
        std::ostringstream oss;
        oss << (int)v << ".0";
        return oss.str();
    }
    std::ostringstream oss;
    oss << v;
    return oss.str();
}

inline std::string to_json(bool v) { return v ? "true" : "false"; }

inline std::string to_json(const std::string& v) {
    std::string r = "\"";
    for (char c : v) {
        if (c == '"') r += "\\\"";
        else if (c == '\\') r += "\\\\";
        else if (c == '\n') r += "\\n";
        else if (c == '\t') r += "\\t";
        else r += c;
    }
    r += "\"";
    return r;
}

inline std::string to_json(const std::vector<int>& v) {
    std::string r = "[";
    for (size_t i = 0; i < v.size(); i++) {
        if (i > 0) r += ",";
        r += std::to_string(v[i]);
    }
    r += "]";
    return r;
}

inline std::string to_json(const std::vector<std::string>& v) {
    std::string r = "[";
    for (size_t i = 0; i < v.size(); i++) {
        if (i > 0) r += ",";
        r += to_json(v[i]);
    }
    r += "]";
    return r;
}

inline std::string to_json(const std::vector<std::vector<int>>& v) {
    std::string r = "[";
    for (size_t i = 0; i < v.size(); i++) {
        if (i > 0) r += ",";
        r += to_json(v[i]);
    }
    r += "]";
    return r;
}

// For null
inline std::string to_json_null() { return "null"; }

// For multi-op results: vector of JsonValue-like results
// We handle this with a variant approach

// ============================================================
// Common data structures
// ============================================================

struct TreeNode {
    int val;
    TreeNode* left;
    TreeNode* right;
    TreeNode(int v = 0, TreeNode* l = nullptr, TreeNode* r = nullptr)
        : val(v), left(l), right(r) {}
};

struct ListNode {
    int val;
    ListNode* next;
    ListNode(int v = 0, ListNode* n = nullptr) : val(v), next(n) {}
};

// Build binary tree from level-order JSON array (with nulls)
inline TreeNode* build_tree(const JsonValue& v) {
    if (!v.is_array() || v.to_arr().empty()) return nullptr;
    auto& arr = v.to_arr();
    if (arr[0].is_null()) return nullptr;

    TreeNode* root = new TreeNode(arr[0].to_int());
    std::queue<TreeNode*> q;
    q.push(root);
    size_t i = 1;
    while (!q.empty() && i < arr.size()) {
        TreeNode* node = q.front(); q.pop();
        if (i < arr.size() && !arr[i].is_null()) {
            node->left = new TreeNode(arr[i].to_int());
            q.push(node->left);
        }
        i++;
        if (i < arr.size() && !arr[i].is_null()) {
            node->right = new TreeNode(arr[i].to_int());
            q.push(node->right);
        }
        i++;
    }
    return root;
}

inline TreeNode* build_tree(const std::vector<int>& vals) {
    // Overload for when there's no nulls (won't handle null)
    JsonArray arr;
    for (int v : vals) arr.push_back(JsonValue(v));
    return build_tree(JsonValue(arr));
}

// Find a node by value in tree (BFS)
inline TreeNode* find_node(TreeNode* root, int val) {
    if (!root) return nullptr;
    std::queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* n = q.front(); q.pop();
        if (n->val == val) return n;
        if (n->left) q.push(n->left);
        if (n->right) q.push(n->right);
    }
    return nullptr;
}

// Tree to level-order array (with trailing nulls stripped)
inline std::string tree_to_json(TreeNode* root) {
    if (!root) return "[]";
    std::vector<std::string> result;
    std::queue<TreeNode*> q;
    q.push(root);
    while (!q.empty()) {
        TreeNode* n = q.front(); q.pop();
        if (n) {
            result.push_back(std::to_string(n->val));
            q.push(n->left);
            q.push(n->right);
        } else {
            result.push_back("null");
        }
    }
    // Strip trailing nulls
    while (!result.empty() && result.back() == "null") result.pop_back();
    std::string r = "[";
    for (size_t i = 0; i < result.size(); i++) {
        if (i > 0) r += ",";
        r += result[i];
    }
    r += "]";
    return r;
}

// Build linked list from JSON array
inline ListNode* build_list(const JsonValue& v) {
    if (!v.is_array() || v.to_arr().empty()) return nullptr;
    ListNode dummy(0);
    ListNode* curr = &dummy;
    for (auto& x : v.to_arr()) {
        curr->next = new ListNode(x.to_int());
        curr = curr->next;
    }
    return dummy.next;
}

// Build linked list with cycle
inline ListNode* build_list_with_cycle(const JsonValue& v, int pos) {
    if (!v.is_array() || v.to_arr().empty()) return nullptr;
    std::vector<ListNode*> nodes;
    for (auto& x : v.to_arr()) {
        nodes.push_back(new ListNode(x.to_int()));
    }
    for (size_t i = 0; i + 1 < nodes.size(); i++) {
        nodes[i]->next = nodes[i+1];
    }
    if (pos >= 0 && pos < (int)nodes.size()) {
        nodes.back()->next = nodes[pos];
    }
    return nodes[0];
}

// Linked list to JSON array
inline std::string list_to_json(ListNode* head) {
    std::vector<int> vals;
    std::unordered_set<ListNode*> seen;
    while (head && seen.find(head) == seen.end()) {
        seen.insert(head);
        vals.push_back(head->val);
        head = head->next;
    }
    return to_json(vals);
}

// Build lists for merge-k-sorted-lists
inline std::vector<ListNode*> build_lists(const JsonValue& v) {
    std::vector<ListNode*> result;
    for (auto& x : v.to_arr()) {
        result.push_back(build_list(x));
    }
    return result;
}

// ============================================================
// Graph node (for clone-graph)
// ============================================================

struct GraphNode {
    int val;
    std::vector<GraphNode*> neighbors;
    GraphNode(int v = 0) : val(v) {}
};

inline GraphNode* build_graph(const JsonValue& v) {
    if (!v.is_array() || v.to_arr().empty()) return nullptr;
    auto& arr = v.to_arr();
    std::vector<GraphNode*> nodes;
    for (size_t i = 0; i < arr.size(); i++) {
        nodes.push_back(new GraphNode(i + 1));
    }
    for (size_t i = 0; i < arr.size(); i++) {
        for (auto& nb : arr[i].to_arr()) {
            nodes[i]->neighbors.push_back(nodes[nb.to_int() - 1]);
        }
    }
    return nodes[0];
}

inline std::string graph_to_json(GraphNode* node) {
    if (!node) return "[]";
    std::map<int, std::vector<int>> result;
    std::queue<GraphNode*> q;
    std::unordered_set<GraphNode*> visited;
    q.push(node);
    visited.insert(node);
    while (!q.empty()) {
        GraphNode* n = q.front(); q.pop();
        std::vector<int> nbs;
        for (auto* nb : n->neighbors) {
            nbs.push_back(nb->val);
            if (visited.find(nb) == visited.end()) {
                visited.insert(nb);
                q.push(nb);
            }
        }
        std::sort(nbs.begin(), nbs.end());
        result[n->val] = nbs;
    }
    std::string r = "[";
    bool first = true;
    for (auto& [k, v] : result) {
        if (!first) r += ",";
        first = false;
        r += to_json(v);
    }
    r += "]";
    return r;
}

// ============================================================
// Multi-op result helper
// ============================================================

// For multi-op (design) problems, we collect results as strings and format them
struct MultiOpResult {
    std::vector<std::string> results; // each is a JSON string like "null", "true", "1.5"

    void add_null() { results.push_back("null"); }
    void add_bool(bool v) { results.push_back(v ? "true" : "false"); }
    void add_int(int v) { results.push_back(std::to_string(v)); }
    void add_double(double v) { results.push_back(to_json(v)); }
    void add_string(const std::string& v) { results.push_back(to_json(v)); }

    std::string to_json_str() const {
        std::string r = "[";
        for (size_t i = 0; i < results.size(); i++) {
            if (i > 0) r += ",";
            r += results[i];
        }
        r += "]";
        return r;
    }
};

#endif // JSON_HELPER_H
