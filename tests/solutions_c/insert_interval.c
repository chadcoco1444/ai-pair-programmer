#include "json_helper.h"

int** insert(int** intervals, int intervalsSize, int* intervalsColSize, int* newInterval, int newIntervalSize, int* returnSize, int** returnColumnSizes) {
    int** result = (int**)malloc(sizeof(int*) * (intervalsSize + 1));
    int* cols = (int*)malloc(sizeof(int) * (intervalsSize + 1));
    int rcount = 0;
    int i = 0;
    int ns = newInterval[0], ne = newInterval[1];
    while (i < intervalsSize && intervals[i][1] < ns) {
        int* x = (int*)malloc(sizeof(int) * 2);
        x[0] = intervals[i][0]; x[1] = intervals[i][1];
        result[rcount] = x; cols[rcount] = 2; rcount++;
        i++;
    }
    while (i < intervalsSize && intervals[i][0] <= ne) {
        if (intervals[i][0] < ns) ns = intervals[i][0];
        if (intervals[i][1] > ne) ne = intervals[i][1];
        i++;
    }
    int* merged = (int*)malloc(sizeof(int) * 2);
    merged[0] = ns; merged[1] = ne;
    result[rcount] = merged; cols[rcount] = 2; rcount++;
    while (i < intervalsSize) {
        int* x = (int*)malloc(sizeof(int) * 2);
        x[0] = intervals[i][0]; x[1] = intervals[i][1];
        result[rcount] = x; cols[rcount] = 2; rcount++;
        i++;
    }
    *returnSize = rcount;
    *returnColumnSizes = cols;
    return result;
}

int main() {
    JsonValue* args = parse_args();
    int rows;
    int* cols;
    int** intervals = to_int_matrix(&args[0], &rows, &cols);
    int nn;
    int* ni = to_int_array(&args[1], &nn);
    int rs;
    int* rcs;
    int** r = insert(intervals, rows, cols, ni, nn, &rs, &rcs);
    print_int_matrix(r, rs, rcs);
    return 0;
}
