#include "json_helper.h"

int coinChange(int* coins, int coinsSize, int amount) {
    int inf = amount + 1;
    int* dp = (int*)malloc(sizeof(int) * (amount + 1));
    dp[0] = 0;
    for (int i = 1; i <= amount; i++) dp[i] = inf;
    for (int i = 1; i <= amount; i++) {
        for (int j = 0; j < coinsSize; j++) {
            int c = coins[j];
            if (c <= i && dp[i - c] + 1 < dp[i]) dp[i] = dp[i - c] + 1;
        }
    }
    int r = dp[amount] > amount ? -1 : dp[amount];
    free(dp);
    return r;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* coins = to_int_array(&args[0], &n);
    int amount = to_int(&args[1]);
    print_int(coinChange(coins, n, amount));
    return 0;
}
