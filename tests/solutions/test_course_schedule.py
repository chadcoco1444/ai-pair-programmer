"""
Course Schedule - Blind 75 Graph #2
Given numCourses and prerequisites, determine if you can finish all courses.
Approach: Topological sort / cycle detection using DFS.
"""
from collections import defaultdict, deque


class Solution:
    def canFinish(self, numCourses: int, prerequisites: list[list[int]]) -> bool:
        graph = defaultdict(list)
        for course, prereq in prerequisites:
            graph[course].append(prereq)

        # 0 = unvisited, 1 = visiting, 2 = visited
        state = [0] * numCourses

        def has_cycle(node):
            if state[node] == 1:
                return True
            if state[node] == 2:
                return False
            state[node] = 1
            for neighbor in graph[node]:
                if has_cycle(neighbor):
                    return True
            state[node] = 2
            return False

        for i in range(numCourses):
            if has_cycle(i):
                return False
        return True


def test():
    sol = Solution()

    # Test 1: (2, [[1,0]]) -> True (course 1 requires course 0, no cycle)
    assert sol.canFinish(2, [[1, 0]]) == True, "Test 1 failed"

    # Test 2: (2, [[1,0],[0,1]]) -> False (mutual dependency = cycle)
    assert sol.canFinish(2, [[1, 0], [0, 1]]) == False, "Test 2 failed"

    # Test 3: No prerequisites -> True
    assert sol.canFinish(3, []) == True, "Test 3 failed"

    # Test 4: Linear chain no cycle -> True
    assert sol.canFinish(4, [[1, 0], [2, 1], [3, 2]]) == True, "Test 4 failed"

    # Test 5: Cycle in longer chain -> False
    assert sol.canFinish(3, [[0, 1], [1, 2], [2, 0]]) == False, "Test 5 failed"

    print("All test_course_schedule tests passed!")


if __name__ == "__main__":
    test()
