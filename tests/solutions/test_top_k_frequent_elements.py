import heapq
from collections import Counter
from typing import List


class Solution:
    def topKFrequent(self, nums: List[int], k: int) -> List[int]:
        count = Counter(nums)
        # Use heap of size k
        return heapq.nlargest(k, count.keys(), key=lambda x: count[x])


def test():
    sol = Solution()

    result = sol.topKFrequent([1, 1, 1, 2, 2, 3], 2)
    assert sorted(result) == [1, 2], f"Expected [1,2], got {result}"

    result2 = sol.topKFrequent([1], 1)
    assert result2 == [1]

    result3 = sol.topKFrequent([1, 2], 2)
    assert sorted(result3) == [1, 2]

    result4 = sol.topKFrequent([4, 1, -1, 2, -1, 2, 3], 2)
    assert sorted(result4) == sorted([-1, 2]), f"Got {result4}"

    print("All tests passed.")


if __name__ == "__main__":
    test()
