#include "json_helper.h"

int* countBits(int n, int* returnSize) {
    *returnSize = n + 1;
    int* dp = (int*)calloc(n + 1, sizeof(int));
    for (int i = 1; i <= n; i++) dp[i] = dp[i >> 1] + (i & 1);
    return dp;
}

int main() {
    JsonValue* args = parse_args();
    int n = to_int(&args[0]);
    int rs;
    int* r = countBits(n, &rs);
    print_int_array(r, rs);
    return 0;
}
