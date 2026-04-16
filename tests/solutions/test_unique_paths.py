class Solution:
    def uniquePaths(self, m: int, n: int) -> int:
        dp = [[1] * n for _ in range(m)]
        for i in range(1, m):
            for j in range(1, n):
                dp[i][j] = dp[i - 1][j] + dp[i][j - 1]
        return dp[m - 1][n - 1]


def test():
    s = Solution()
    assert s.uniquePaths(3, 7) == 28, f"Expected 28, got {s.uniquePaths(3, 7)}"
    assert s.uniquePaths(3, 2) == 3, f"Expected 3, got {s.uniquePaths(3, 2)}"
    print("All tests passed for Unique Paths!")


if __name__ == "__main__":
    test()
