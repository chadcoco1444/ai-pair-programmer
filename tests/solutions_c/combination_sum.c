#include "json_helper.h"

static int* g_candidates;
static int g_candidates_size;
static int** g_result;
static int g_result_count;
static int g_result_cap;
static int* g_result_col_sizes;
static int* g_current;
static int g_current_size;

static int cmp_int_asc(const void* a, const void* b) {
    return (*(int*)a) - (*(int*)b);
}

static void cs_backtrack(int start, int remaining) {
    if (remaining == 0) {
        if (g_result_count >= g_result_cap) {
            g_result_cap *= 2;
            g_result = (int**)realloc(g_result, sizeof(int*) * g_result_cap);
            g_result_col_sizes = (int*)realloc(g_result_col_sizes, sizeof(int) * g_result_cap);
        }
        int* copy = (int*)malloc(sizeof(int) * g_current_size);
        memcpy(copy, g_current, sizeof(int) * g_current_size);
        g_result[g_result_count] = copy;
        g_result_col_sizes[g_result_count] = g_current_size;
        g_result_count++;
        return;
    }
    for (int i = start; i < g_candidates_size; i++) {
        if (g_candidates[i] > remaining) break;
        g_current[g_current_size++] = g_candidates[i];
        cs_backtrack(i, remaining - g_candidates[i]);
        g_current_size--;
    }
}

int** combinationSum(int* candidates, int candidatesSize, int target, int* returnSize, int** returnColumnSizes) {
    qsort(candidates, candidatesSize, sizeof(int), cmp_int_asc);
    g_candidates = candidates;
    g_candidates_size = candidatesSize;
    g_result_cap = 16;
    g_result = (int**)malloc(sizeof(int*) * g_result_cap);
    g_result_col_sizes = (int*)malloc(sizeof(int) * g_result_cap);
    g_result_count = 0;
    g_current = (int*)malloc(sizeof(int) * 200);
    g_current_size = 0;
    cs_backtrack(0, target);
    *returnSize = g_result_count;
    *returnColumnSizes = g_result_col_sizes;
    return g_result;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* cands = to_int_array(&args[0], &n);
    int target = to_int(&args[1]);
    int rs;
    int* cs;
    int** r = combinationSum(cands, n, target, &rs, &cs);
    print_int_matrix(r, rs, cs);
    return 0;
}
