#include "json_helper.h"

void setZeroes(int** matrix, int rows, int cols) {
    int firstRowZero = 0, firstColZero = 0;
    for (int c = 0; c < cols; c++) if (matrix[0][c] == 0) { firstRowZero = 1; break; }
    for (int r = 0; r < rows; r++) if (matrix[r][0] == 0) { firstColZero = 1; break; }
    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (matrix[r][c] == 0) { matrix[r][0] = 0; matrix[0][c] = 0; }
    for (int r = 1; r < rows; r++)
        for (int c = 1; c < cols; c++)
            if (matrix[r][0] == 0 || matrix[0][c] == 0) matrix[r][c] = 0;
    if (firstRowZero) for (int c = 0; c < cols; c++) matrix[0][c] = 0;
    if (firstColZero) for (int r = 0; r < rows; r++) matrix[r][0] = 0;
}

int main() {
    JsonValue* args = parse_args();
    int rows;
    int* cols;
    int** m = to_int_matrix(&args[0], &rows, &cols);
    int c = cols ? cols[0] : 0;
    setZeroes(m, rows, c);
    print_int_matrix(m, rows, cols);
    return 0;
}
