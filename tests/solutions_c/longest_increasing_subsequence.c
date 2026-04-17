#include "json_helper.h"

int lengthOfLIS(int* nums, int numsSize) {
    if (numsSize == 0) return 0;
    int* tails = (int*)malloc(sizeof(int) * numsSize);
    int len = 0;
    for (int i = 0; i < numsSize; i++) {
        int lo = 0, hi = len;
        while (lo < hi) {
            int mid = (lo + hi) / 2;
            if (tails[mid] < nums[i]) lo = mid + 1;
            else hi = mid;
        }
        tails[lo] = nums[i];
        if (lo == len) len++;
    }
    free(tails);
    return len;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    print_int(lengthOfLIS(a, n));
    return 0;
}
