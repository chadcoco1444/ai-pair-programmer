#include "json_helper.h"

static int cmp_int(const void* a, const void* b) {
    int ai = *(int*)a, bi = *(int*)b;
    return ai < bi ? -1 : (ai > bi ? 1 : 0);
}

int longestConsecutive(int* nums, int numsSize) {
    if (numsSize == 0) return 0;
    int* a = (int*)malloc(sizeof(int) * numsSize);
    memcpy(a, nums, sizeof(int) * numsSize);
    qsort(a, numsSize, sizeof(int), cmp_int);
    int best = 1;
    int len = 1;
    for (int i = 1; i < numsSize; i++) {
        if (a[i] == a[i-1]) continue;
        if (a[i] == a[i-1] + 1) len++;
        else len = 1;
        if (len > best) best = len;
    }
    free(a);
    return best;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    print_int(longestConsecutive(a, n));
    return 0;
}
