#include "json_helper.h"

bool canFinish(int numCourses, int** prerequisites, int prerequisitesSize, int* prerequisitesColSize) {
    /* Build adjacency list */
    int* indeg = (int*)calloc(numCourses, sizeof(int));
    int** adj = (int**)malloc(sizeof(int*) * numCourses);
    int* adj_cap = (int*)malloc(sizeof(int) * numCourses);
    int* adj_count = (int*)calloc(numCourses, sizeof(int));
    for (int i = 0; i < numCourses; i++) { adj_cap[i] = 4; adj[i] = (int*)malloc(sizeof(int) * 4); }

    for (int i = 0; i < prerequisitesSize; i++) {
        int a = prerequisites[i][0];
        int b = prerequisites[i][1];
        /* b -> a */
        if (adj_count[b] >= adj_cap[b]) {
            adj_cap[b] *= 2;
            adj[b] = (int*)realloc(adj[b], sizeof(int) * adj_cap[b]);
        }
        adj[b][adj_count[b]++] = a;
        indeg[a]++;
    }

    int* q = (int*)malloc(sizeof(int) * numCourses);
    int qh = 0, qt = 0;
    for (int i = 0; i < numCourses; i++) if (indeg[i] == 0) q[qt++] = i;
    int taken = 0;
    while (qh < qt) {
        int c = q[qh++];
        taken++;
        for (int i = 0; i < adj_count[c]; i++) {
            int nx = adj[c][i];
            if (--indeg[nx] == 0) q[qt++] = nx;
        }
    }
    bool r = taken == numCourses;
    for (int i = 0; i < numCourses; i++) free(adj[i]);
    free(adj); free(adj_cap); free(adj_count); free(indeg); free(q);
    return r;
}

int main() {
    JsonValue* args = parse_args();
    int numCourses = to_int(&args[0]);
    int rows;
    int* cols;
    int** pre = to_int_matrix(&args[1], &rows, &cols);
    print_bool(canFinish(numCourses, pre, rows, cols));
    return 0;
}
