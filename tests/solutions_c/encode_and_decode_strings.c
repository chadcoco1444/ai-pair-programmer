#include "json_helper.h"

char* encode(char** strs, int count) {
    /* Compute total length */
    size_t total = 1;
    for (int i = 0; i < count; i++) total += strlen(strs[i]) + 16;
    char* buf = (char*)malloc(total);
    int pos = 0;
    for (int i = 0; i < count; i++) {
        int len = (int)strlen(strs[i]);
        pos += sprintf(buf + pos, "%d#", len);
        memcpy(buf + pos, strs[i], len);
        pos += len;
    }
    buf[pos] = '\0';
    return buf;
}

char** decode(const char* s, int* count) {
    int cap = 8;
    char** result = (char**)malloc(sizeof(char*) * cap);
    *count = 0;
    int i = 0;
    int n = (int)strlen(s);
    while (i < n) {
        int j = i;
        while (j < n && s[j] != '#') j++;
        char num[16] = {0};
        memcpy(num, s + i, j - i);
        num[j - i] = '\0';
        int length = atoi(num);
        if (*count >= cap) { cap *= 2; result = (char**)realloc(result, sizeof(char*) * cap); }
        char* piece = (char*)malloc(length + 1);
        memcpy(piece, s + j + 1, length);
        piece[length] = '\0';
        result[(*count)++] = piece;
        i = j + 1 + length;
    }
    return result;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    char** strs = to_string_array(&args[0], &n);
    char* enc = encode(strs, n);
    int dc;
    char** dec = decode(enc, &dc);
    print_string_array(dec, dc);
    return 0;
}
