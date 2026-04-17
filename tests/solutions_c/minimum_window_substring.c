#include "json_helper.h"

char* minWindow(char* s, char* t) {
    int need[256] = {0};
    int tn = (int)strlen(t);
    int sn = (int)strlen(s);
    for (int i = 0; i < tn; i++) need[(unsigned char)t[i]]++;
    int missing = tn;
    int bestLeft = 0, bestLen = INT_MAX;
    int left = 0;
    for (int right = 0; right < sn; right++) {
        unsigned char c = (unsigned char)s[right];
        if (need[c] > 0) missing--;
        need[c]--;
        if (missing == 0) {
            while (need[(unsigned char)s[left]] < 0) {
                need[(unsigned char)s[left]]++;
                left++;
            }
            if (right - left + 1 < bestLen) {
                bestLen = right - left + 1;
                bestLeft = left;
            }
            need[(unsigned char)s[left]]++;
            missing++;
            left++;
        }
    }
    if (bestLen == INT_MAX) { char* r = (char*)malloc(1); r[0]='\0'; return r; }
    char* r = (char*)malloc(bestLen + 1);
    memcpy(r, s + bestLeft, bestLen);
    r[bestLen] = '\0';
    return r;
}

int main() {
    JsonValue* args = parse_args();
    char* s = to_str_copy(&args[0]);
    char* t = to_str_copy(&args[1]);
    char* r = minWindow(s, t);
    printf("%s\n", r);
    return 0;
}
