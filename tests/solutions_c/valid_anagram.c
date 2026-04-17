#include "json_helper.h"

bool isAnagram(char* s, char* t) {
    int ls = (int)strlen(s), lt = (int)strlen(t);
    if (ls != lt) return false;
    int cnt[26] = {0};
    for (int i = 0; i < ls; i++) cnt[s[i] - 'a']++;
    for (int i = 0; i < lt; i++) if (--cnt[t[i] - 'a'] < 0) return false;
    return true;
}

int main() {
    JsonValue* args = parse_args();
    char* s = to_str_copy(&args[0]);
    char* t = to_str_copy(&args[1]);
    print_bool(isAnagram(s, t));
    return 0;
}
