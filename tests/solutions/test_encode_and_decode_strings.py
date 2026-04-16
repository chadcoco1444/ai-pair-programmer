from typing import List


class Solution:
    def encode(self, strs: List[str]) -> str:
        """Encode using length prefix: <length>#<string>"""
        result = []
        for s in strs:
            result.append(f"{len(s)}#{s}")
        return "".join(result)

    def decode(self, s: str) -> List[str]:
        result = []
        i = 0
        while i < len(s):
            j = s.index("#", i)
            length = int(s[i:j])
            result.append(s[j + 1: j + 1 + length])
            i = j + 1 + length
        return result


def test():
    sol = Solution()

    # Basic roundtrip
    original = ["hello", "world"]
    assert sol.decode(sol.encode(original)) == original

    # With special characters
    original2 = ["we", "say", ":", "yes"]
    assert sol.decode(sol.encode(original2)) == original2

    # Empty string in list
    original3 = ["", "abc", ""]
    assert sol.decode(sol.encode(original3)) == original3

    # Single element
    original4 = ["single"]
    assert sol.decode(sol.encode(original4)) == original4

    # Empty list
    original5 = []
    assert sol.decode(sol.encode(original5)) == original5

    # String containing '#' and digits
    original6 = ["3#abc", "10#xyz"]
    assert sol.decode(sol.encode(original6)) == original6

    print("All tests passed.")


if __name__ == "__main__":
    test()
