class Solution:
    def climbStairs(self, n: int) -> int:
        if n <= 2:
            return n
        dp = [0] * (n + 1)
        dp[1] = 1
        dp[2] = 2
        for i in range(3, n + 1):
            dp[i] = dp[i - 1] + dp[i - 2]
        return dp[n]


def test():
    s = Solution()
    assert s.climbStairs(2) == 2, f"Expected 2, got {s.climbStairs(2)}"
    assert s.climbStairs(3) == 3, f"Expected 3, got {s.climbStairs(3)}"
    assert s.climbStairs(1) == 1, f"Expected 1, got {s.climbStairs(1)}"
    assert s.climbStairs(10) == 89, f"Expected 89, got {s.climbStairs(10)}"
    print("All tests passed for Climbing Stairs!")


if __name__ == "__main__":
    test()
