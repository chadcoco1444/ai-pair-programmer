class Solution {
    cloneGraph(node) {
        if (!node) return null;

        const visited = new Map();

        const dfs = (n) => {
            if (visited.has(n)) return visited.get(n);
            const clone = new Node(n.val);
            visited.set(n, clone);
            for (const neighbor of n.neighbors) {
                clone.neighbors.push(dfs(neighbor));
            }
            return clone;
        };

        return dfs(node);
    }
}
