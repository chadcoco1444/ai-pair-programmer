class Solution {
    canFinish(numCourses, prerequisites) {
        const graph = new Map();
        for (let i = 0; i < numCourses; i++) graph.set(i, []);
        for (const [course, prereq] of prerequisites) {
            graph.get(course).push(prereq);
        }

        // 0 = unvisited, 1 = visiting, 2 = visited
        const state = new Array(numCourses).fill(0);

        const hasCycle = (node) => {
            if (state[node] === 1) return true;
            if (state[node] === 2) return false;
            state[node] = 1;
            for (const neighbor of graph.get(node)) {
                if (hasCycle(neighbor)) return true;
            }
            state[node] = 2;
            return false;
        };

        for (let i = 0; i < numCourses; i++) {
            if (hasCycle(i)) return false;
        }
        return true;
    }
}
