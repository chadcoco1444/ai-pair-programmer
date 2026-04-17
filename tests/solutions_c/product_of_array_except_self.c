#include "json_helper.h"

int* productExceptSelf(int* nums, int numsSize, int* returnSize) {
    int* result = (int*)malloc(sizeof(int) * numsSize);
    int left = 1;
    for (int i = 0; i < numsSize; i++) { result[i] = left; left *= nums[i]; }
    int right = 1;
    for (int i = numsSize - 1; i >= 0; i--) { result[i] *= right; right *= nums[i]; }
    *returnSize = numsSize;
    return result;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    int rs;
    int* r = productExceptSelf(a, n, &rs);
    print_int_array(r, rs);
    return 0;
}
