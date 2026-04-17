#include "json_helper.h"

int countSubstrings(char* s) {
    int n = (int)strlen(s);
    int count = 0;
    for (int i = 0; i < n; i++) {
        int l = i, r = i;
        while (l >= 0 && r < n && s[l] == s[r]) { count++; l--; r++; }
        l = i; r = i + 1;
        while (l >= 0 && r < n && s[l] == s[r]) { count++; l--; r++; }
    }
    return count;
}

int main() {
    JsonValue* args = parse_args();
    char* s = to_str_copy(&args[0]);
    print_int(countSubstrings(s));
    return 0;
}
