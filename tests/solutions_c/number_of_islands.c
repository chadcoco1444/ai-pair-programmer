#include "json_helper.h"

static char** g_grid;
static int g_rows, g_cols;

static void dfs_ni(int r, int c) {
    if (r < 0 || r >= g_rows || c < 0 || c >= g_cols || g_grid[r][c] != '1') return;
    g_grid[r][c] = '0';
    dfs_ni(r+1, c); dfs_ni(r-1, c); dfs_ni(r, c+1); dfs_ni(r, c-1);
}

int numIslands(char** grid, int rows, int cols) {
    g_grid = grid; g_rows = rows; g_cols = cols;
    int count = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (grid[r][c] == '1') { count++; dfs_ni(r, c); }
        }
    }
    return count;
}

int main() {
    JsonValue* args = parse_args();
    int rows, cols;
    char** grid = to_char_matrix_as_strings(&args[0], &rows, &cols);
    print_int(numIslands(grid, rows, cols));
    return 0;
}
