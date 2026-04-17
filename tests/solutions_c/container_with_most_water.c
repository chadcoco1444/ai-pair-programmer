#include "json_helper.h"

int maxArea(int* height, int heightSize) {
    int left = 0, right = heightSize - 1;
    int best = 0;
    while (left < right) {
        int h = height[left] < height[right] ? height[left] : height[right];
        int area = h * (right - left);
        if (area > best) best = area;
        if (height[left] < height[right]) left++;
        else right--;
    }
    return best;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* h = to_int_array(&args[0], &n);
    print_int(maxArea(h, n));
    return 0;
}
