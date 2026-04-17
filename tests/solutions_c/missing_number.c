#include "json_helper.h"

int missingNumber(int* nums, int numsSize) {
    long long expected = (long long)numsSize * (numsSize + 1) / 2;
    long long actual = 0;
    for (int i = 0; i < numsSize; i++) actual += nums[i];
    return (int)(expected - actual);
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    print_int(missingNumber(a, n));
    return 0;
}
