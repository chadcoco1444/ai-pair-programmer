#include "json_helper.h"

typedef struct TrieNode {
    struct TrieNode* children[26];
    int is_end;
} TrieNode;

static TrieNode* new_trie_node(void) {
    TrieNode* n = (TrieNode*)calloc(1, sizeof(TrieNode));
    return n;
}

static TrieNode* g_root;

static void trie_insert(const char* w) {
    TrieNode* n = g_root;
    for (int i = 0; w[i]; i++) {
        int c = w[i] - 'a';
        if (!n->children[c]) n->children[c] = new_trie_node();
        n = n->children[c];
    }
    n->is_end = 1;
}

static bool trie_search(const char* w) {
    TrieNode* n = g_root;
    for (int i = 0; w[i]; i++) {
        int c = w[i] - 'a';
        if (!n->children[c]) return false;
        n = n->children[c];
    }
    return n->is_end != 0;
}

static bool trie_starts_with(const char* p) {
    TrieNode* n = g_root;
    for (int i = 0; p[i]; i++) {
        int c = p[i] - 'a';
        if (!n->children[c]) return false;
        n = n->children[c];
    }
    return true;
}

int main() {
    JsonValue* args = parse_args();
    JsonValue* outer = &args[0];
    JsonValue* ops = json_obj_get(outer, "ops");
    JsonValue* opArgs = json_obj_get(outer, "args");
    g_root = new_trie_node();

    MultiOpResult mor; mor_init(&mor);
    mor_add_null(&mor); /* constructor */

    for (int i = 1; i < ops->arr_len; i++) {
        const char* op = to_str(&ops->arr_val[i]);
        JsonValue* a = &opArgs->arr_val[i];
        if (strcmp(op, "insert") == 0) {
            trie_insert(to_str(&a->arr_val[0]));
            mor_add_null(&mor);
        } else if (strcmp(op, "search") == 0) {
            mor_add_bool(&mor, trie_search(to_str(&a->arr_val[0])));
        } else if (strcmp(op, "startsWith") == 0) {
            mor_add_bool(&mor, trie_starts_with(to_str(&a->arr_val[0])));
        }
    }
    mor_print(&mor);
    return 0;
}
