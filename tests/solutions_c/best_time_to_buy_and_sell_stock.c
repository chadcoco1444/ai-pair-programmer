#include "json_helper.h"

int maxProfit(int* prices, int pricesSize) {
    int minPrice = INT_MAX;
    int best = 0;
    for (int i = 0; i < pricesSize; i++) {
        int p = prices[i];
        if (p < minPrice) minPrice = p;
        else if (p - minPrice > best) best = p - minPrice;
    }
    return best;
}

int main() {
    JsonValue* args = parse_args();
    int n;
    int* prices = to_int_array(&args[0], &n);
    print_int(maxProfit(prices, n));
    return 0;
}
