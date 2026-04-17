#include "json_helper.h"

typedef struct TrieN {
    struct TrieN* children[26];
    char* word; /* non-NULL if end of word */
} TrieN;

static TrieN* new_trie(void) {
    TrieN* n = (TrieN*)calloc(1, sizeof(TrieN));
    return n;
}

static char** g_result;
static int g_count;
static int g_cap;
static char** g_board;
static int g_rows, g_cols;

static int cmp_str(const void* a, const void* b) {
    return strcmp(*(const char**)a, *(const char**)b);
}

static void ws2_dfs(int r, int c, TrieN* node) {
    char ch = g_board[r][c];
    if (ch == '#') return;
    int idx = ch - 'a';
    TrieN* nxt = node->children[idx];
    if (!nxt) return;
    if (nxt->word) {
        if (g_count >= g_cap) { g_cap *= 2; g_result = (char**)realloc(g_result, sizeof(char*) * g_cap); }
        g_result[g_count++] = nxt->word;
        nxt->word = NULL;
    }
    g_board[r][c] = '#';
    if (r > 0) ws2_dfs(r-1, c, nxt);
    if (r + 1 < g_rows) ws2_dfs(r+1, c, nxt);
    if (c > 0) ws2_dfs(r, c-1, nxt);
    if (c + 1 < g_cols) ws2_dfs(r, c+1, nxt);
    g_board[r][c] = ch;
}

char** findWords(char** board, int rows, int cols, char** words, int wordsSize, int* returnSize) {
    TrieN* root = new_trie();
    for (int i = 0; i < wordsSize; i++) {
        TrieN* n = root;
        for (int j = 0; words[i][j]; j++) {
            int idx = words[i][j] - 'a';
            if (!n->children[idx]) n->children[idx] = new_trie();
            n = n->children[idx];
        }
        n->word = words[i];
    }
    g_board = board; g_rows = rows; g_cols = cols;
    g_cap = 16;
    g_count = 0;
    g_result = (char**)malloc(sizeof(char*) * g_cap);
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            ws2_dfs(r, c, root);
        }
    }
    qsort(g_result, g_count, sizeof(char*), cmp_str);
    *returnSize = g_count;
    return g_result;
}

int main() {
    JsonValue* args = parse_args();
    int rows, cols;
    char** board = to_char_matrix_as_strings(&args[0], &rows, &cols);
    int wn;
    char** words = to_string_array(&args[1], &wn);
    int rs;
    char** r = findWords(board, rows, cols, words, wn, &rs);
    print_string_array(r, rs);
    return 0;
}
