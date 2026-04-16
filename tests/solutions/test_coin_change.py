from typing import List


class Solution:
    def coinChange(self, coins: List[int], amount: int) -> int:
        dp = [float('inf')] * (amount + 1)
        dp[0] = 0
        for i in range(1, amount + 1):
            for coin in coins:
                if coin <= i:
                    dp[i] = min(dp[i], dp[i - coin] + 1)
        return dp[amount] if dp[amount] != float('inf') else -1


def test():
    s = Solution()
    assert s.coinChange([1, 5, 10], 11) == 2, f"Expected 2, got {s.coinChange([1, 5, 10], 11)}"
    assert s.coinChange([2], 3) == -1, f"Expected -1, got {s.coinChange([2], 3)}"
    assert s.coinChange([1], 0) == 0, f"Expected 0, got {s.coinChange([1], 0)}"
    print("All tests passed for Coin Change!")


if __name__ == "__main__":
    test()
