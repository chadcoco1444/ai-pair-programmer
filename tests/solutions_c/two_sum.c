#include "json_helper.h"

int* twoSum(int* nums, int numsSize, int target, int* returnSize) {
    /* Using a simple open addressing hash table */
    int cap = 1;
    while (cap < numsSize * 2) cap *= 2;
    if (cap < 16) cap = 16;
    int* keys = (int*)malloc(sizeof(int) * cap);
    int* idxs = (int*)malloc(sizeof(int) * cap);
    char* used = (char*)calloc(cap, 1);
    int* result = (int*)malloc(sizeof(int) * 2);
    *returnSize = 0;

    for (int i = 0; i < numsSize; i++) {
        int complement = target - nums[i];
        unsigned int h = (unsigned int)(complement * 2654435761u) & (cap - 1);
        while (used[h]) {
            if (keys[h] == complement) {
                result[0] = idxs[h];
                result[1] = i;
                *returnSize = 2;
                free(keys); free(idxs); free(used);
                return result;
            }
            h = (h + 1) & (cap - 1);
        }
        unsigned int h2 = (unsigned int)(nums[i] * 2654435761u) & (cap - 1);
        while (used[h2]) h2 = (h2 + 1) & (cap - 1);
        used[h2] = 1;
        keys[h2] = nums[i];
        idxs[h2] = i;
    }
    free(keys); free(idxs); free(used);
    return result;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* nums = to_int_array(&args[0], &n);
    int target = to_int(&args[1]);
    int rs;
    int* r = twoSum(nums, n, target, &rs);
    print_int_array(r, rs);
    return 0;
}
