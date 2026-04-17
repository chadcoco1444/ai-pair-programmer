#include "json_helper.h"

unsigned int reverseBits(unsigned int n) {
    unsigned int result = 0;
    for (int i = 0; i < 32; i++) {
        result = (result << 1) | (n & 1);
        n >>= 1;
    }
    return result;
}

int main() {
    JsonValue* args = parse_args();
    unsigned int n = (unsigned int)to_double(&args[0]);
    unsigned int r = reverseBits(n);
    printf("%u\n", r);
    return 0;
}
