import heapq


class MedianFinder:
    def __init__(self):
        # max_heap for lower half (negate values for max-heap behavior)
        self.lower = []  # max-heap (negated)
        # min_heap for upper half
        self.upper = []  # min-heap

    def addNum(self, num: int) -> None:
        # Push to lower (max-heap)
        heapq.heappush(self.lower, -num)

        # Balance: ensure every element in lower <= every element in upper
        if self.lower and self.upper and (-self.lower[0]) > self.upper[0]:
            val = -heapq.heappop(self.lower)
            heapq.heappush(self.upper, val)

        # Rebalance sizes: lower can have at most 1 more than upper
        if len(self.lower) > len(self.upper) + 1:
            val = -heapq.heappop(self.lower)
            heapq.heappush(self.upper, val)
        elif len(self.upper) > len(self.lower):
            val = heapq.heappop(self.upper)
            heapq.heappush(self.lower, -val)

    def findMedian(self) -> float:
        if len(self.lower) > len(self.upper):
            return float(-self.lower[0])
        return (-self.lower[0] + self.upper[0]) / 2.0


def test():
    mf = MedianFinder()
    mf.addNum(1)
    mf.addNum(2)
    assert mf.findMedian() == 1.5, f"Expected 1.5, got {mf.findMedian()}"
    mf.addNum(3)
    assert mf.findMedian() == 2.0, f"Expected 2.0, got {mf.findMedian()}"

    # Test with more numbers
    mf2 = MedianFinder()
    for n in [5, 2, 8, 1, 9, 3]:
        mf2.addNum(n)
    # sorted: [1,2,3,5,8,9], median = (3+5)/2 = 4.0
    assert mf2.findMedian() == 4.0, f"Expected 4.0, got {mf2.findMedian()}"

    # Odd count
    mf3 = MedianFinder()
    mf3.addNum(6)
    assert mf3.findMedian() == 6.0

    mf3.addNum(10)
    assert mf3.findMedian() == 8.0

    mf3.addNum(2)
    # sorted: [2,6,10], median = 6
    assert mf3.findMedian() == 6.0

    print("All tests passed.")


if __name__ == "__main__":
    test()
