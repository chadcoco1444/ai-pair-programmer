class Solution:
    def characterReplacement(self, s: str, k: int) -> int:
        count = {}
        max_count = 0
        max_len = 0
        left = 0
        for right in range(len(s)):
            count[s[right]] = count.get(s[right], 0) + 1
            max_count = max(max_count, count[s[right]])
            # window size - most frequent char > k means we need to shrink
            while (right - left + 1) - max_count > k:
                count[s[left]] -= 1
                left += 1
            max_len = max(max_len, right - left + 1)
        return max_len


def test():
    sol = Solution()
    assert sol.characterReplacement("ABAB", 2) == 4
    assert sol.characterReplacement("AABABBA", 1) == 4
    assert sol.characterReplacement("AAAA", 0) == 4
    assert sol.characterReplacement("ABCD", 0) == 1
    print("All tests passed.")


if __name__ == "__main__":
    test()
