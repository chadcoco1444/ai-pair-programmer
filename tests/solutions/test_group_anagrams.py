from collections import defaultdict
from typing import List


class Solution:
    def groupAnagrams(self, strs: List[str]) -> List[List[str]]:
        groups = defaultdict(list)
        for word in strs:
            key = tuple(sorted(word))
            groups[key].append(word)
        return list(groups.values())


def test():
    sol = Solution()
    result = sol.groupAnagrams(["eat", "tea", "tan", "ate", "nat", "bat"])
    assert len(result) == 3
    # Verify each group is correct (order may vary)
    result_sets = [set(g) for g in result]
    assert {"eat", "tea", "ate"} in result_sets
    assert {"tan", "nat"} in result_sets
    assert {"bat"} in result_sets

    # Edge cases
    assert sol.groupAnagrams([""]) == [[""]]
    assert sol.groupAnagrams(["a"]) == [["a"]]
    print("All tests passed.")


if __name__ == "__main__":
    test()
