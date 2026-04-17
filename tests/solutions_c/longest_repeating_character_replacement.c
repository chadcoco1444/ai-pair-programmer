#include "json_helper.h"

int characterReplacement(char* s, int k) {
    int cnt[26] = {0};
    int left = 0, maxFreq = 0, best = 0;
    int n = (int)strlen(s);
    for (int right = 0; right < n; right++) {
        int idx = s[right] - 'A';
        cnt[idx]++;
        if (cnt[idx] > maxFreq) maxFreq = cnt[idx];
        while ((right - left + 1) - maxFreq > k) {
            cnt[s[left] - 'A']--;
            left++;
        }
        if (right - left + 1 > best) best = right - left + 1;
    }
    return best;
}

int main() {
    JsonValue* args = parse_args();
    char* s = to_str_copy(&args[0]);
    int k = to_int(&args[1]);
    print_int(characterReplacement(s, k));
    return 0;
}
