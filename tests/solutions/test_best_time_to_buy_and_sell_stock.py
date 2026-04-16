"""
Problem: Best Time to Buy and Sell Stock
Category: Array
Difficulty: Easy
"""

class Solution:
    def maxProfit(self, prices):
        min_price = float('inf')
        max_profit = 0
        for price in prices:
            if price < min_price:
                min_price = price
            elif price - min_price > max_profit:
                max_profit = price - min_price
        return max_profit

# === Tests ===

def test():
    sol = Solution()

    # Test 1: standard profitable case
    result = sol.maxProfit([7, 1, 5, 3, 6, 4])
    assert result == 5, f"Test 1 failed: {result}"

    # Test 2: descending prices — no profit
    result = sol.maxProfit([7, 6, 4, 3, 1])
    assert result == 0, f"Test 2 failed: {result}"

    # Test 3: single price
    result = sol.maxProfit([5])
    assert result == 0, f"Test 3 failed: {result}"

    # Test 4: two prices, profit
    result = sol.maxProfit([1, 2])
    assert result == 1, f"Test 4 failed: {result}"

    print("All tests passed!")

if __name__ == "__main__":
    test()
