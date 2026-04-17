#include "json_helper.h"

bool canJump(int* nums, int numsSize) {
    int reach = 0;
    for (int i = 0; i < numsSize; i++) {
        if (i > reach) return false;
        if (i + nums[i] > reach) reach = i + nums[i];
    }
    return true;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    print_bool(canJump(a, n));
    return 0;
}
