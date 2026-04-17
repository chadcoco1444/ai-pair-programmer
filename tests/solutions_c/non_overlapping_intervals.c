#include "json_helper.h"

static int cmp_by_end(const void* a, const void* b) {
    int* ia = *(int**)a;
    int* ib = *(int**)b;
    return ia[1] - ib[1];
}

int eraseOverlapIntervals(int** intervals, int size) {
    if (size == 0) return 0;
    qsort(intervals, size, sizeof(int*), cmp_by_end);
    int removals = 0;
    int prevEnd = intervals[0][1];
    for (int i = 1; i < size; i++) {
        if (intervals[i][0] < prevEnd) removals++;
        else prevEnd = intervals[i][1];
    }
    return removals;
}

int main() {
    JsonValue* args = parse_args();
    int rows;
    int* cols;
    int** intervals = to_int_matrix(&args[0], &rows, &cols);
    print_int(eraseOverlapIntervals(intervals, rows));
    return 0;
}
