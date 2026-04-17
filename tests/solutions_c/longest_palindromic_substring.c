#include "json_helper.h"

char* longestPalindrome(char* s) {
    int n = (int)strlen(s);
    if (n == 0) { char* r = (char*)malloc(1); r[0]='\0'; return r; }
    int start = 0, end = 0;
    for (int i = 0; i < n; i++) {
        int l, r;
        /* odd */
        l = i; r = i;
        while (l >= 0 && r < n && s[l] == s[r]) { l--; r++; }
        if ((r - 1) - (l + 1) > end - start) { start = l + 1; end = r - 1; }
        /* even */
        l = i; r = i + 1;
        while (l >= 0 && r < n && s[l] == s[r]) { l--; r++; }
        if ((r - 1) - (l + 1) > end - start) { start = l + 1; end = r - 1; }
    }
    int len = end - start + 1;
    char* out = (char*)malloc(len + 1);
    memcpy(out, s + start, len);
    out[len] = '\0';
    return out;
}

int main() {
    JsonValue* args = parse_args();
    char* s = to_str_copy(&args[0]);
    char* r = longestPalindrome(s);
    printf("%s\n", r);
    return 0;
}
