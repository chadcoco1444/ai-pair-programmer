#include "json_helper.h"

void rotate(int** matrix, int n) {
    for (int i = 0; i < n; i++) {
        for (int j = i + 1; j < n; j++) {
            int t = matrix[i][j]; matrix[i][j] = matrix[j][i]; matrix[j][i] = t;
        }
    }
    for (int i = 0; i < n; i++) {
        for (int l = 0, r = n - 1; l < r; l++, r--) {
            int t = matrix[i][l]; matrix[i][l] = matrix[i][r]; matrix[i][r] = t;
        }
    }
}

int main() {
    JsonValue* args = parse_args();
    int rows;
    int* cols;
    int** m = to_int_matrix(&args[0], &rows, &cols);
    rotate(m, rows);
    print_int_matrix(m, rows, cols);
    return 0;
}
