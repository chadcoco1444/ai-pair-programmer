#include "json_helper.h"

static int* g_parent;

static int uf_find(int x) {
    while (g_parent[x] != x) {
        g_parent[x] = g_parent[g_parent[x]];
        x = g_parent[x];
    }
    return x;
}

bool validTree(int n, int** edges, int edgesSize) {
    if (edgesSize != n - 1) return false;
    g_parent = (int*)malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) g_parent[i] = i;
    for (int i = 0; i < edgesSize; i++) {
        int a = uf_find(edges[i][0]);
        int b = uf_find(edges[i][1]);
        if (a == b) { free(g_parent); return false; }
        g_parent[a] = b;
    }
    free(g_parent);
    return true;
}

int main() {
    JsonValue* args = parse_args();
    int n = to_int(&args[0]);
    int rows;
    int* cols;
    int** edges = to_int_matrix(&args[1], &rows, &cols);
    print_bool(validTree(n, edges, rows));
    return 0;
}
