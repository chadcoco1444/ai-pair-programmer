#include "json_helper.h"

static int* g_parent;
static int* g_rank;

static int uf_find(int x) {
    while (g_parent[x] != x) {
        g_parent[x] = g_parent[g_parent[x]];
        x = g_parent[x];
    }
    return x;
}

int countComponents(int n, int** edges, int edgesSize) {
    g_parent = (int*)malloc(sizeof(int) * n);
    g_rank = (int*)calloc(n, sizeof(int));
    for (int i = 0; i < n; i++) g_parent[i] = i;
    int components = n;
    for (int i = 0; i < edgesSize; i++) {
        int a = uf_find(edges[i][0]);
        int b = uf_find(edges[i][1]);
        if (a == b) continue;
        if (g_rank[a] < g_rank[b]) { int t = a; a = b; b = t; }
        g_parent[b] = a;
        if (g_rank[a] == g_rank[b]) g_rank[a]++;
        components--;
    }
    free(g_parent); free(g_rank);
    return components;
}

int main() {
    JsonValue* args = parse_args();
    int n = to_int(&args[0]);
    int rows;
    int* cols;
    int** edges = to_int_matrix(&args[1], &rows, &cols);
    print_int(countComponents(n, edges, rows));
    return 0;
}
