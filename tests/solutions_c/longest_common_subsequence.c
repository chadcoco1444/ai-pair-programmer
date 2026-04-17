#include "json_helper.h"

int longestCommonSubsequence(char* text1, char* text2) {
    int m = (int)strlen(text1), n = (int)strlen(text2);
    int* prev = (int*)calloc(n + 1, sizeof(int));
    int* curr = (int*)calloc(n + 1, sizeof(int));
    for (int i = 1; i <= m; i++) {
        for (int j = 1; j <= n; j++) {
            if (text1[i-1] == text2[j-1]) curr[j] = prev[j-1] + 1;
            else {
                int a = prev[j], b = curr[j-1];
                curr[j] = a > b ? a : b;
            }
        }
        int* t = prev; prev = curr; curr = t;
        memset(curr, 0, sizeof(int) * (n + 1));
    }
    int r = prev[n];
    free(prev); free(curr);
    return r;
}

int main() {
    JsonValue* args = parse_args();
    char* t1 = to_str_copy(&args[0]);
    char* t2 = to_str_copy(&args[1]);
    print_int(longestCommonSubsequence(t1, t2));
    return 0;
}
