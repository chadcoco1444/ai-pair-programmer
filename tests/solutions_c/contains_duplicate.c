#include "json_helper.h"

static int cmp_int(const void* a, const void* b) {
    int ai = *(int*)a, bi = *(int*)b;
    return ai < bi ? -1 : (ai > bi ? 1 : 0);
}

bool containsDuplicate(int* nums, int numsSize) {
    if (numsSize < 2) return false;
    int* copy = (int*)malloc(sizeof(int) * numsSize);
    memcpy(copy, nums, sizeof(int) * numsSize);
    qsort(copy, numsSize, sizeof(int), cmp_int);
    for (int i = 1; i < numsSize; i++) {
        if (copy[i] == copy[i - 1]) { free(copy); return true; }
    }
    free(copy);
    return false;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    print_bool(containsDuplicate(a, n));
    return 0;
}
