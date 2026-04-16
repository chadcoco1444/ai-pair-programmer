from typing import List


class Solution:
    def wordBreak(self, s: str, wordDict: List[str]) -> bool:
        word_set = set(wordDict)
        n = len(s)
        dp = [False] * (n + 1)
        dp[0] = True
        for i in range(1, n + 1):
            for j in range(i):
                if dp[j] and s[j:i] in word_set:
                    dp[i] = True
                    break
        return dp[n]


def test():
    s = Solution()
    assert s.wordBreak("leetcode", ["leet", "code"]) == True, \
        f"Expected True, got {s.wordBreak('leetcode', ['leet', 'code'])}"
    assert s.wordBreak("applepenapple", ["apple", "pen"]) == True, \
        f"Expected True, got {s.wordBreak('applepenapple', ['apple', 'pen'])}"
    print("All tests passed for Word Break!")


if __name__ == "__main__":
    test()
