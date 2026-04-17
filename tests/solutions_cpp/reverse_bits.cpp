#include "json_helper.h"

class Solution {
public:
    uint32_t reverseBits(uint32_t n) {
        uint32_t result = 0;
        for (int i = 0; i < 32; i++) {
            result = (result << 1) | (n & 1);
            n >>= 1;
        }
        return result;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    uint32_t n = (uint32_t)to_double(args[0]);
    uint32_t result = sol.reverseBits(n);
    cout << result << endl;
    return 0;
}
