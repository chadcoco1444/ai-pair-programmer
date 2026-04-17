#include "json_helper.h"

bool isPalindrome(char* s) {
    int left = 0, right = (int)strlen(s) - 1;
    while (left < right) {
        while (left < right && !isalnum((unsigned char)s[left])) left++;
        while (left < right && !isalnum((unsigned char)s[right])) right--;
        if (tolower((unsigned char)s[left]) != tolower((unsigned char)s[right])) return false;
        left++; right--;
    }
    return true;
}

int main() {
    JsonValue* args = parse_args();
    char* s = to_str_copy(&args[0]);
    print_bool(isPalindrome(s));
    return 0;
}
