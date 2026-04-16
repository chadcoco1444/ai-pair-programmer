class Solution:
    def countSubstrings(self, s: str) -> int:
        count = 0

        def expand(left: int, right: int):
            nonlocal count
            while left >= 0 and right < len(s) and s[left] == s[right]:
                count += 1
                left -= 1
                right += 1

        for i in range(len(s)):
            expand(i, i)      # Odd length
            expand(i, i + 1)  # Even length

        return count


def test():
    sol = Solution()
    assert sol.countSubstrings("abc") == 3
    assert sol.countSubstrings("aaa") == 6
    assert sol.countSubstrings("a") == 1
    assert sol.countSubstrings("aa") == 3
    print("All tests passed.")


if __name__ == "__main__":
    test()
