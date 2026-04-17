#include "json_helper.h"

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

int main() {
    JsonValue* args = parse_args();
    int n = to_int(&args[0]);
    print_int(climbStairs(n));
    return 0;
}
