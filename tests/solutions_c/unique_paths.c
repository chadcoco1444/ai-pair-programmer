#include "json_helper.h"

int uniquePaths(int m, int n) {
    int* dp = (int*)malloc(sizeof(int) * n);
    for (int i = 0; i < n; i++) dp[i] = 1;
    for (int i = 1; i < m; i++) {
        for (int j = 1; j < n; j++) dp[j] += dp[j-1];
    }
    int r = dp[n-1];
    free(dp);
    return r;
}

int main() {
    JsonValue* args = parse_args();
    int m = to_int(&args[0]);
    int n = to_int(&args[1]);
    print_int(uniquePaths(m, n));
    return 0;
}
