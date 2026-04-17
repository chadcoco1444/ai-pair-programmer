#include "json_helper.h"

int** levelOrder(TreeNode* root, int* returnSize, int** returnColumnSizes) {
    *returnSize = 0;
    *returnColumnSizes = NULL;
    if (!root) return NULL;
    int cap = 16;
    int** result = (int**)malloc(sizeof(int*) * cap);
    int* cols = (int*)malloc(sizeof(int) * cap);

    int qcap = 256;
    TreeNode** q = (TreeNode**)malloc(sizeof(TreeNode*) * qcap);
    int qh = 0, qt = 0;
    q[qt++] = root;

    while (qh < qt) {
        int sz = qt - qh;
        int* level = (int*)malloc(sizeof(int) * sz);
        for (int i = 0; i < sz; i++) {
            TreeNode* n = q[qh++];
            level[i] = n->val;
            if (n->left) {
                if (qt >= qcap) { qcap *= 2; q = (TreeNode**)realloc(q, sizeof(TreeNode*) * qcap); }
                q[qt++] = n->left;
            }
            if (n->right) {
                if (qt >= qcap) { qcap *= 2; q = (TreeNode**)realloc(q, sizeof(TreeNode*) * qcap); }
                q[qt++] = n->right;
            }
        }
        if (*returnSize >= cap) {
            cap *= 2;
            result = (int**)realloc(result, sizeof(int*) * cap);
            cols = (int*)realloc(cols, sizeof(int) * cap);
        }
        result[*returnSize] = level;
        cols[*returnSize] = sz;
        (*returnSize)++;
    }
    free(q);
    *returnColumnSizes = cols;
    return result;
}

int main() {
    JsonValue* args = parse_args();
    TreeNode* root = build_tree(&args[0]);
    int rs;
    int* cs;
    int** r = levelOrder(root, &rs, &cs);
    print_int_matrix(r, rs, cs);
    return 0;
}
