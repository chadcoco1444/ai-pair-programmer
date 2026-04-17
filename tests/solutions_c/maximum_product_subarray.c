#include "json_helper.h"

static int imax(int a, int b) { return a > b ? a : b; }
static int imin(int a, int b) { return a < b ? a : b; }

int maxProduct(int* nums, int numsSize) {
    int best = nums[0], curMax = nums[0], curMin = nums[0];
    for (int i = 1; i < numsSize; i++) {
        int n = nums[i];
        int a = n, b = curMax * n, c = curMin * n;
        int tmax = imax(a, imax(b, c));
        int tmin = imin(a, imin(b, c));
        curMax = tmax; curMin = tmin;
        if (curMax > best) best = curMax;
    }
    return best;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    print_int(maxProduct(a, n));
    return 0;
}
