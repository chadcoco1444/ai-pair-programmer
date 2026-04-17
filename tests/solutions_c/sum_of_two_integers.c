#include "json_helper.h"

int getSum(int a, int b) {
    while (b != 0) {
        unsigned int carry = (unsigned int)(a & b) << 1;
        a = a ^ b;
        b = (int)carry;
    }
    return a;
}

int main() {
    JsonValue* args = parse_args();
    int a = to_int(&args[0]);
    int b = to_int(&args[1]);
    print_int(getSum(a, b));
    return 0;
}
