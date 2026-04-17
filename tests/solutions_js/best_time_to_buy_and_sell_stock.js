class Solution {
    maxProfit(prices) {
        let minPrice = Infinity;
        let maxProfit = 0;
        for (const price of prices) {
            if (price < minPrice) {
                minPrice = price;
            } else if (price - minPrice > maxProfit) {
                maxProfit = price - minPrice;
            }
        }
        return maxProfit;
    }
}
