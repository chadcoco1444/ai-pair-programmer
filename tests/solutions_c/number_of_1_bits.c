#include "json_helper.h"

int hammingWeight(unsigned int n) {
    int count = 0;
    while (n) { n &= (n - 1); count++; }
    return count;
}

int main() {
    JsonValue* args = parse_args();
    unsigned int n = (unsigned int)(long long)to_double(&args[0]);
    print_int(hammingWeight(n));
    return 0;
}
