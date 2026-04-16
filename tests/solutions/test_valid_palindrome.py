class Solution:
    def isPalindrome(self, s: str) -> bool:
        filtered = [c.lower() for c in s if c.isalnum()]
        return filtered == filtered[::-1]


def test():
    sol = Solution()
    assert sol.isPalindrome("A man, a plan, a canal: Panama") == True
    assert sol.isPalindrome("race a car") == False
    assert sol.isPalindrome(" ") == True
    assert sol.isPalindrome("") == True
    assert sol.isPalindrome("0P") == False
    print("All tests passed.")


if __name__ == "__main__":
    test()
