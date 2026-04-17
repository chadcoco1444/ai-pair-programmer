#include "json_helper.h"

class Solution {
public:
    int hammingWeight(uint32_t n) {
        int count = 0;
        while (n) {
            n &= (n - 1);
            count++;
        }
        return count;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    uint32_t n = (uint32_t)(long long)args[0].to_double();
    int result = sol.hammingWeight(n);
    cout << result << endl;
    return 0;
}
