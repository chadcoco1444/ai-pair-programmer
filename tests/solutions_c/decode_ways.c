#include "json_helper.h"

int numDecodings(char* s) {
    int n = (int)strlen(s);
    if (n == 0 || s[0] == '0') return 0;
    int* dp = (int*)calloc(n + 1, sizeof(int));
    dp[0] = 1; dp[1] = 1;
    for (int i = 2; i <= n; i++) {
        int one = s[i - 1] - '0';
        int two = (s[i - 2] - '0') * 10 + one;
        if (one >= 1 && one <= 9) dp[i] += dp[i - 1];
        if (two >= 10 && two <= 26) dp[i] += dp[i - 2];
    }
    int r = dp[n];
    free(dp);
    return r;
}

int main() {
    JsonValue* args = parse_args();
    char* s = to_str_copy(&args[0]);
    print_int(numDecodings(s));
    return 0;
}
