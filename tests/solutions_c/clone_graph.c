#include "json_helper.h"

/* Simple map: source pointer -> cloned pointer using two parallel arrays */
static GraphNode** g_src;
static GraphNode** g_dst;
static int g_map_count;
static int g_map_cap;

static GraphNode* find_clone(GraphNode* s) {
    for (int i = 0; i < g_map_count; i++) {
        if (g_src[i] == s) return g_dst[i];
    }
    return NULL;
}

static void add_clone(GraphNode* s, GraphNode* d) {
    if (g_map_count >= g_map_cap) {
        g_map_cap *= 2;
        g_src = (GraphNode**)realloc(g_src, sizeof(GraphNode*) * g_map_cap);
        g_dst = (GraphNode**)realloc(g_dst, sizeof(GraphNode*) * g_map_cap);
    }
    g_src[g_map_count] = s;
    g_dst[g_map_count] = d;
    g_map_count++;
}

static GraphNode* cg_clone(GraphNode* n) {
    GraphNode* existing = find_clone(n);
    if (existing) return existing;
    GraphNode* copy = new_graph_node(n->val);
    add_clone(n, copy);
    for (int i = 0; i < n->neighbors_count; i++) {
        graph_add_neighbor(copy, cg_clone(n->neighbors[i]));
    }
    return copy;
}

GraphNode* cloneGraph(GraphNode* node) {
    if (!node) return NULL;
    g_map_cap = 16;
    g_map_count = 0;
    g_src = (GraphNode**)malloc(sizeof(GraphNode*) * g_map_cap);
    g_dst = (GraphNode**)malloc(sizeof(GraphNode*) * g_map_cap);
    return cg_clone(node);
}

int main() {
    JsonValue* args = parse_args();
    GraphNode* g = build_graph(&args[0]);
    GraphNode* c = cloneGraph(g);
    print_graph(c);
    return 0;
}
