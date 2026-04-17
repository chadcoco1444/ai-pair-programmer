#include "json_helper.h"

static int rob_range(int* nums, int lo, int hi) {
    int prev = 0, curr = 0;
    for (int i = lo; i <= hi; i++) {
        int nx = curr > prev + nums[i] ? curr : prev + nums[i];
        prev = curr;
        curr = nx;
    }
    return curr;
}

int rob(int* nums, int numsSize) {
    if (numsSize == 0) return 0;
    if (numsSize == 1) return nums[0];
    int a = rob_range(nums, 0, numsSize - 2);
    int b = rob_range(nums, 1, numsSize - 1);
    return a > b ? a : b;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    print_int(rob(a, n));
    return 0;
}
