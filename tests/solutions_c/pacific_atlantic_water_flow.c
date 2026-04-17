#include "json_helper.h"

static int** g_h;
static int g_rows, g_cols;

static void paw_dfs(int r, int c, char** visited) {
    if (visited[r][c]) return;
    visited[r][c] = 1;
    int dr[4] = {0, 0, 1, -1};
    int dc[4] = {1, -1, 0, 0};
    for (int i = 0; i < 4; i++) {
        int nr = r + dr[i], nc = c + dc[i];
        if (nr >= 0 && nr < g_rows && nc >= 0 && nc < g_cols && !visited[nr][nc] && g_h[nr][nc] >= g_h[r][c]) {
            paw_dfs(nr, nc, visited);
        }
    }
}

int** pacificAtlantic(int** heights, int rows, int cols, int* returnSize, int** returnColumnSizes) {
    g_h = heights; g_rows = rows; g_cols = cols;
    char** pac = (char**)malloc(sizeof(char*) * rows);
    char** atl = (char**)malloc(sizeof(char*) * rows);
    for (int i = 0; i < rows; i++) {
        pac[i] = (char*)calloc(cols, 1);
        atl[i] = (char*)calloc(cols, 1);
    }
    for (int r = 0; r < rows; r++) {
        paw_dfs(r, 0, pac);
        paw_dfs(r, cols - 1, atl);
    }
    for (int c = 0; c < cols; c++) {
        paw_dfs(0, c, pac);
        paw_dfs(rows - 1, c, atl);
    }
    int cap = 16;
    int** result = (int**)malloc(sizeof(int*) * cap);
    int* col_sizes = (int*)malloc(sizeof(int) * cap);
    int count = 0;
    for (int r = 0; r < rows; r++) {
        for (int c = 0; c < cols; c++) {
            if (pac[r][c] && atl[r][c]) {
                if (count >= cap) {
                    cap *= 2;
                    result = (int**)realloc(result, sizeof(int*) * cap);
                    col_sizes = (int*)realloc(col_sizes, sizeof(int) * cap);
                }
                int* coord = (int*)malloc(sizeof(int) * 2);
                coord[0] = r; coord[1] = c;
                result[count] = coord;
                col_sizes[count] = 2;
                count++;
            }
        }
    }
    *returnSize = count;
    *returnColumnSizes = col_sizes;
    return result;
}

int main() {
    JsonValue* args = parse_args();
    int rows;
    int* cols;
    int** heights = to_int_matrix(&args[0], &rows, &cols);
    int c = cols ? cols[0] : 0;
    int rs;
    int* rcs;
    int** r = pacificAtlantic(heights, rows, c, &rs, &rcs);
    print_int_matrix(r, rs, rcs);
    return 0;
}
