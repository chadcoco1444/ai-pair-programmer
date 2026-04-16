from collections import Counter


class Solution:
    def minWindow(self, s: str, t: str) -> str:
        if not t or not s:
            return ""
        need = Counter(t)
        missing = len(t)
        best_left = 0
        best_right = float("inf")
        left = 0
        for right, char in enumerate(s):
            if need[char] > 0:
                missing -= 1
            need[char] -= 1
            if missing == 0:
                # shrink from left
                while need[s[left]] < 0:
                    need[s[left]] += 1
                    left += 1
                if right - left < best_right - best_left:
                    best_left = left
                    best_right = right
                # move left pointer to start searching for next window
                need[s[left]] += 1
                missing += 1
                left += 1
        return s[best_left: best_right + 1] if best_right != float("inf") else ""


def test():
    sol = Solution()
    assert sol.minWindow("ADOBECODEBANC", "ABC") == "BANC"
    assert sol.minWindow("a", "a") == "a"
    assert sol.minWindow("a", "aa") == ""
    assert sol.minWindow("", "A") == ""
    print("All tests passed.")


if __name__ == "__main__":
    test()
