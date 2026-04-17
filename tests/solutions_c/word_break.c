#include "json_helper.h"

bool wordBreak(char* s, char** wordDict, int dictSize) {
    int n = (int)strlen(s);
    bool* dp = (bool*)calloc(n + 1, sizeof(bool));
    dp[0] = true;
    for (int i = 1; i <= n; i++) {
        for (int j = 0; j < i; j++) {
            if (dp[j]) {
                int sublen = i - j;
                for (int k = 0; k < dictSize; k++) {
                    if ((int)strlen(wordDict[k]) == sublen && strncmp(s + j, wordDict[k], sublen) == 0) {
                        dp[i] = true;
                        break;
                    }
                }
                if (dp[i]) break;
            }
        }
    }
    bool r = dp[n];
    free(dp);
    return r;
}

int main() {
    JsonValue* args = parse_args();
    char* s = to_str_copy(&args[0]);
    int wn;
    char** dict = to_string_array(&args[1], &wn);
    print_bool(wordBreak(s, dict, wn));
    return 0;
}
