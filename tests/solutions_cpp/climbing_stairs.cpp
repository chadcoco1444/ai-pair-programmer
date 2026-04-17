#include "json_helper.h"

class Solution {
public:
    int climbStairs(int n) {
        if (n <= 2) return n;
        int a = 1, b = 2;
        for (int i = 3; i <= n; i++) {
            int c = a + b;
            a = b;
            b = c;
        }
        return b;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    int n = to_int(args[0]);
    int result = sol.climbStairs(n);
    cout << result << endl;
    return 0;
}
