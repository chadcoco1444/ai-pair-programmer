#include "json_helper.h"

class Solution {
public:
    int getSum(int a, int b) {
        while (b != 0) {
            unsigned int carry = (unsigned int)(a & b) << 1;
            a = a ^ b;
            b = (int)carry;
        }
        return a;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    int a = to_int(args[0]);
    int b = to_int(args[1]);
    int result = sol.getSum(a, b);
    cout << result << endl;
    return 0;
}
