#include "json_helper.h"

int* spiralOrder(int** matrix, int rows, int cols, int* returnSize) {
    int* result = (int*)malloc(sizeof(int) * rows * cols);
    int count = 0;
    int top = 0, bottom = rows - 1;
    int left = 0, right = cols - 1;
    while (top <= bottom && left <= right) {
        for (int c = left; c <= right; c++) result[count++] = matrix[top][c];
        top++;
        for (int r = top; r <= bottom; r++) result[count++] = matrix[r][right];
        right--;
        if (top <= bottom) {
            for (int c = right; c >= left; c--) result[count++] = matrix[bottom][c];
            bottom--;
        }
        if (left <= right) {
            for (int r = bottom; r >= top; r--) result[count++] = matrix[r][left];
            left++;
        }
    }
    *returnSize = count;
    return result;
}

int main() {
    JsonValue* args = parse_args();
    int rows;
    int* cols;
    int** m = to_int_matrix(&args[0], &rows, &cols);
    int c = cols ? cols[0] : 0;
    int rs;
    int* r = spiralOrder(m, rows, c, &rs);
    print_int_array(r, rs);
    return 0;
}
