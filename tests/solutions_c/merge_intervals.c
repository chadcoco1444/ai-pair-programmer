#include "json_helper.h"

static int cmp_interval(const void* a, const void* b) {
    int* ia = *(int**)a;
    int* ib = *(int**)b;
    return ia[0] - ib[0];
}

int** merge_intervals(int** intervals, int size, int* returnSize, int** returnColumnSizes) {
    if (size == 0) {
        *returnSize = 0;
        *returnColumnSizes = (int*)malloc(sizeof(int));
        return (int**)malloc(sizeof(int*));
    }
    qsort(intervals, size, sizeof(int*), cmp_interval);
    int** result = (int**)malloc(sizeof(int*) * size);
    int* cols = (int*)malloc(sizeof(int) * size);
    int count = 0;
    int* first = (int*)malloc(sizeof(int) * 2);
    first[0] = intervals[0][0]; first[1] = intervals[0][1];
    result[count] = first; cols[count] = 2; count++;
    for (int i = 1; i < size; i++) {
        if (intervals[i][0] <= result[count-1][1]) {
            if (intervals[i][1] > result[count-1][1]) result[count-1][1] = intervals[i][1];
        } else {
            int* n = (int*)malloc(sizeof(int) * 2);
            n[0] = intervals[i][0]; n[1] = intervals[i][1];
            result[count] = n; cols[count] = 2; count++;
        }
    }
    *returnSize = count;
    *returnColumnSizes = cols;
    return result;
}

int main() {
    JsonValue* args = parse_args();
    int rows;
    int* cols;
    int** intervals = to_int_matrix(&args[0], &rows, &cols);
    int rs;
    int* rcs;
    int** r = merge_intervals(intervals, rows, &rs, &rcs);
    print_int_matrix(r, rs, rcs);
    return 0;
}
