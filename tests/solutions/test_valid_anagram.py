from collections import Counter


class Solution:
    def isAnagram(self, s: str, t: str) -> bool:
        return Counter(s) == Counter(t)


def test():
    sol = Solution()
    assert sol.isAnagram("anagram", "nagaram") == True
    assert sol.isAnagram("rat", "car") == False
    assert sol.isAnagram("", "") == True
    assert sol.isAnagram("a", "ab") == False
    print("All tests passed.")


if __name__ == "__main__":
    test()
