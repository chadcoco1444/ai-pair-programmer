#include "json_helper.h"

int maxSubArray(int* nums, int numsSize) {
    int best = nums[0], curr = nums[0];
    for (int i = 1; i < numsSize; i++) {
        curr = curr + nums[i] > nums[i] ? curr + nums[i] : nums[i];
        if (curr > best) best = curr;
    }
    return best;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    print_int(maxSubArray(a, n));
    return 0;
}
