#include "json_helper.h"

/* Serialize to comma-separated level-order with "null" markers */
static char* serialize(TreeNode* root) {
    if (!root) { char* r = (char*)malloc(1); r[0]='\0'; return r; }
    int cap = 128;
    int size = 0;
    char* buf = (char*)malloc(cap);
    int qcap = 64;
    TreeNode** q = (TreeNode**)malloc(sizeof(TreeNode*) * qcap);
    int qh = 0, qt = 0;
    q[qt++] = root;
    int first = 1;
    while (qh < qt) {
        TreeNode* n = q[qh++];
        char tok[32];
        if (n) snprintf(tok, sizeof(tok), "%d", n->val);
        else strcpy(tok, "null");
        int tlen = (int)strlen(tok);
        int need = (first ? 0 : 1) + tlen;
        while (size + need + 1 >= cap) { cap *= 2; buf = (char*)realloc(buf, cap); }
        if (!first) buf[size++] = ',';
        memcpy(buf + size, tok, tlen);
        size += tlen;
        first = 0;
        if (n) {
            if (qt + 2 >= qcap) { qcap *= 2; q = (TreeNode**)realloc(q, sizeof(TreeNode*) * qcap); }
            q[qt++] = n->left;
            q[qt++] = n->right;
        }
    }
    buf[size] = '\0';
    free(q);
    return buf;
}

static TreeNode* deserialize(char* data) {
    if (!data || data[0] == '\0') return NULL;
    /* Tokenize by comma */
    int n = (int)strlen(data);
    int cap = 16;
    char** tokens = (char**)malloc(sizeof(char*) * cap);
    int tcount = 0;
    int start = 0;
    for (int i = 0; i <= n; i++) {
        if (i == n || data[i] == ',') {
            int len = i - start;
            char* t = (char*)malloc(len + 1);
            memcpy(t, data + start, len);
            t[len] = '\0';
            if (tcount >= cap) { cap *= 2; tokens = (char**)realloc(tokens, sizeof(char*) * cap); }
            tokens[tcount++] = t;
            start = i + 1;
        }
    }
    if (tcount == 0 || strcmp(tokens[0], "null") == 0) return NULL;
    TreeNode* root = new_tree_node(atoi(tokens[0]));
    int qcap = 64;
    TreeNode** q = (TreeNode**)malloc(sizeof(TreeNode*) * qcap);
    int qh = 0, qt = 0;
    q[qt++] = root;
    int i = 1;
    while (qh < qt && i < tcount) {
        TreeNode* cur = q[qh++];
        if (i < tcount && strcmp(tokens[i], "null") != 0) {
            cur->left = new_tree_node(atoi(tokens[i]));
            if (qt >= qcap) { qcap *= 2; q = (TreeNode**)realloc(q, sizeof(TreeNode*) * qcap); }
            q[qt++] = cur->left;
        }
        i++;
        if (i < tcount && strcmp(tokens[i], "null") != 0) {
            cur->right = new_tree_node(atoi(tokens[i]));
            if (qt >= qcap) { qcap *= 2; q = (TreeNode**)realloc(q, sizeof(TreeNode*) * qcap); }
            q[qt++] = cur->right;
        }
        i++;
    }
    for (int k = 0; k < tcount; k++) free(tokens[k]);
    free(tokens); free(q);
    return root;
}

int main() {
    JsonValue* args = parse_args();
    TreeNode* root = build_tree(&args[0]);
    char* s = serialize(root);
    TreeNode* r = deserialize(s);
    print_tree(r);
    return 0;
}
