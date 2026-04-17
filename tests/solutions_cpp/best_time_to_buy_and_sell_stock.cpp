#include "json_helper.h"

class Solution {
public:
    int maxProfit(vector<int>& prices) {
        int minPrice = INT_MAX;
        int best = 0;
        for (int p : prices) {
            if (p < minPrice) minPrice = p;
            else if (p - minPrice > best) best = p - minPrice;
        }
        return best;
    }
};

int main() {
    auto args = parse_args();
    Solution sol;
    auto prices = to_vector_int(args[0]);
    int result = sol.maxProfit(prices);
    cout << result << endl;
    return 0;
}
