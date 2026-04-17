#include "json_helper.h"

static int cmp_char(const void* a, const void* b) { return *(char*)a - *(char*)b; }

static int cmp_str(const void* a, const void* b) {
    return strcmp(*(const char**)a, *(const char**)b);
}

static int cmp_str_arr(const void* a, const void* b) {
    /* Compare arrays of strings: compare first element, break ties with next */
    const char* const* ap = *(const char* const**)a;
    const char* const* bp = *(const char* const**)b;
    /* We need size info outside scope; use global */
    /* We'll bundle (array, size) via struct below */
    return strcmp(ap[0], bp[0]); /* simplistic */
}

typedef struct {
    char** words;
    int count;
    char key[128];
} Group;

int main() {
    JsonValue* args = parse_args();
    int n;
    char** strs = to_string_array(&args[0], &n);

    Group* groups = (Group*)calloc(n, sizeof(Group));
    int group_count = 0;
    for (int i = 0; i < n; i++) {
        char key[128];
        int kl = (int)strlen(strs[i]);
        if (kl >= (int)sizeof(key)) kl = (int)sizeof(key) - 1;
        memcpy(key, strs[i], kl);
        key[kl] = '\0';
        qsort(key, kl, 1, cmp_char);
        int found = -1;
        for (int j = 0; j < group_count; j++) {
            if (strcmp(groups[j].key, key) == 0) { found = j; break; }
        }
        if (found < 0) {
            found = group_count++;
            strcpy(groups[found].key, key);
            groups[found].words = (char**)malloc(sizeof(char*) * n);
            groups[found].count = 0;
        }
        groups[found].words[groups[found].count++] = strs[i];
    }
    /* Sort each group; then sort groups by first string */
    for (int i = 0; i < group_count; i++) {
        qsort(groups[i].words, groups[i].count, sizeof(char*), cmp_str);
    }
    /* Sort groups by first word */
    for (int i = 0; i < group_count; i++) {
        for (int j = i + 1; j < group_count; j++) {
            int a = strcmp(groups[i].words[0], groups[j].words[0]);
            if (a > 0) {
                Group t = groups[i]; groups[i] = groups[j]; groups[j] = t;
            }
        }
    }
    /* Print */
    putchar('[');
    for (int i = 0; i < group_count; i++) {
        if (i > 0) putchar(',');
        putchar('[');
        for (int j = 0; j < groups[i].count; j++) {
            if (j > 0) putchar(',');
            print_json_string(groups[i].words[j]);
        }
        putchar(']');
    }
    printf("]\n");
    return 0;
}
