class Solution:
    def isValid(self, s: str) -> bool:
        stack = []
        mapping = {")": "(", "}": "{", "]": "["}
        for char in s:
            if char in mapping:
                top = stack.pop() if stack else "#"
                if mapping[char] != top:
                    return False
            else:
                stack.append(char)
        return not stack


def test():
    sol = Solution()
    assert sol.isValid("()") == True
    assert sol.isValid("()[]{}") == True
    assert sol.isValid("(]") == False
    assert sol.isValid("") == True
    assert sol.isValid("([)]") == False
    assert sol.isValid("{[]}") == True
    assert sol.isValid("]") == False
    print("All tests passed.")


if __name__ == "__main__":
    test()
