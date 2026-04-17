#include "json_helper.h"

int lengthOfLongestSubstring(char* s) {
    int last[256];
    for (int i = 0; i < 256; i++) last[i] = -1;
    int best = 0, left = 0;
    int n = (int)strlen(s);
    for (int right = 0; right < n; right++) {
        unsigned char c = (unsigned char)s[right];
        if (last[c] >= left) left = last[c] + 1;
        last[c] = right;
        if (right - left + 1 > best) best = right - left + 1;
    }
    return best;
}

int main() {
    JsonValue* args = parse_args();
    char* s = to_str_copy(&args[0]);
    print_int(lengthOfLongestSubstring(s));
    return 0;
}
