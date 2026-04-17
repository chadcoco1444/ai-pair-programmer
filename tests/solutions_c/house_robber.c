#include "json_helper.h"

int rob(int* nums, int numsSize) {
    int prev = 0, curr = 0;
    for (int i = 0; i < numsSize; i++) {
        int nx = curr > prev + nums[i] ? curr : prev + nums[i];
        prev = curr;
        curr = nx;
    }
    return curr;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    print_int(rob(a, n));
    return 0;
}
