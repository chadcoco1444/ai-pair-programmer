#include "json_helper.h"

static int cmp_int(const void* a, const void* b) {
    int ai = *(int*)a, bi = *(int*)b;
    return ai < bi ? -1 : (ai > bi ? 1 : 0);
}

int** threeSum(int* nums, int numsSize, int* returnSize, int** returnColumnSizes) {
    qsort(nums, numsSize, sizeof(int), cmp_int);
    int cap = 16;
    int** result = (int**)malloc(sizeof(int*) * cap);
    int* cols = (int*)malloc(sizeof(int) * cap);
    int count = 0;
    for (int i = 0; i < numsSize - 2; i++) {
        if (i > 0 && nums[i] == nums[i-1]) continue;
        int left = i + 1, right = numsSize - 1;
        while (left < right) {
            int s = nums[i] + nums[left] + nums[right];
            if (s < 0) left++;
            else if (s > 0) right--;
            else {
                if (count >= cap) {
                    cap *= 2;
                    result = (int**)realloc(result, sizeof(int*) * cap);
                    cols = (int*)realloc(cols, sizeof(int) * cap);
                }
                int* t = (int*)malloc(sizeof(int) * 3);
                t[0] = nums[i]; t[1] = nums[left]; t[2] = nums[right];
                result[count] = t; cols[count] = 3; count++;
                while (left < right && nums[left] == nums[left+1]) left++;
                while (left < right && nums[right] == nums[right-1]) right--;
                left++; right--;
            }
        }
    }
    *returnSize = count;
    *returnColumnSizes = cols;
    return result;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* a = to_int_array(&args[0], &n);
    int rs;
    int* rcs;
    int** r = threeSum(a, n, &rs, &rcs);
    print_int_matrix(r, rs, rcs);
    return 0;
}
