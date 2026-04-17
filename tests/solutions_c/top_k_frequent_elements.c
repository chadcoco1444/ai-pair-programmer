#include "json_helper.h"

typedef struct { int val; int cnt; } Entry;

static int cmp_by_cnt_desc(const void* a, const void* b) {
    const Entry* ea = (const Entry*)a;
    const Entry* eb = (const Entry*)b;
    return eb->cnt - ea->cnt;
}

static int cmp_int(const void* a, const void* b) {
    int ai = *(int*)a, bi = *(int*)b;
    return ai < bi ? -1 : (ai > bi ? 1 : 0);
}

int* topKFrequent(int* nums, int numsSize, int k, int* returnSize) {
    /* Count with simple sort-and-count */
    int* sorted = (int*)malloc(sizeof(int) * numsSize);
    memcpy(sorted, nums, sizeof(int) * numsSize);
    qsort(sorted, numsSize, sizeof(int), cmp_int);
    Entry* entries = (Entry*)malloc(sizeof(Entry) * numsSize);
    int ecount = 0;
    int i = 0;
    while (i < numsSize) {
        int j = i;
        while (j < numsSize && sorted[j] == sorted[i]) j++;
        entries[ecount].val = sorted[i];
        entries[ecount].cnt = j - i;
        ecount++;
        i = j;
    }
    qsort(entries, ecount, sizeof(Entry), cmp_by_cnt_desc);
    int* result = (int*)malloc(sizeof(int) * k);
    for (int i = 0; i < k; i++) result[i] = entries[i].val;
    qsort(result, k, sizeof(int), cmp_int);
    *returnSize = k;
    free(sorted); free(entries);
    return result;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    int k = to_int(&args[1]);
    int rs;
    int* r = topKFrequent(a, n, k, &rs);
    print_int_array(r, rs);
    return 0;
}
