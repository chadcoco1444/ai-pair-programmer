class Solution:
    def numDecodings(self, s: str) -> int:
        if not s or s[0] == '0':
            return 0
        n = len(s)
        dp = [0] * (n + 1)
        dp[0] = 1
        dp[1] = 1
        for i in range(2, n + 1):
            one_digit = int(s[i - 1])
            two_digit = int(s[i - 2:i])
            if one_digit != 0:
                dp[i] += dp[i - 1]
            if 10 <= two_digit <= 26:
                dp[i] += dp[i - 2]
        return dp[n]


def test():
    s = Solution()
    assert s.numDecodings("12") == 2, f"Expected 2, got {s.numDecodings('12')}"
    assert s.numDecodings("226") == 3, f"Expected 3, got {s.numDecodings('226')}"
    assert s.numDecodings("06") == 0, f"Expected 0, got {s.numDecodings('06')}"
    assert s.numDecodings("0") == 0, f"Expected 0, got {s.numDecodings('0')}"
    print("All tests passed for Decode Ways!")


if __name__ == "__main__":
    test()
