#include "json_helper.h"

static char** g_board;
static int g_rows, g_cols;
static const char* g_word;
static int g_word_len;

static bool dfs_ws(int r, int c, int idx) {
    if (idx == g_word_len) return true;
    if (r < 0 || r >= g_rows || c < 0 || c >= g_cols) return false;
    if (g_board[r][c] != g_word[idx]) return false;
    char tmp = g_board[r][c];
    g_board[r][c] = '#';
    bool found = dfs_ws(r+1, c, idx+1) || dfs_ws(r-1, c, idx+1)
               || dfs_ws(r, c+1, idx+1) || dfs_ws(r, c-1, idx+1);
    g_board[r][c] = tmp;
    return found;
}

bool exist(char** board, int rows, int cols, char* word) {
    g_board = board; g_rows = rows; g_cols = cols;
    g_word = word; g_word_len = (int)strlen(word);
    for (int r = 0; r < rows; r++)
        for (int c = 0; c < cols; c++)
            if (dfs_ws(r, c, 0)) return true;
    return false;
}

int main() {
    JsonValue* args = parse_args();
    int rows, cols;
    char** board = to_char_matrix_as_strings(&args[0], &rows, &cols);
    char* word = to_str_copy(&args[1]);
    print_bool(exist(board, rows, cols, word));
    return 0;
}
