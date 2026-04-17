class Solution {
    validTree(n, edges) {
        if (edges.length !== n - 1) return false;

        const parent = Array.from({ length: n }, (_, i) => i);
        const rank = new Array(n).fill(0);

        const find = (x) => {
            if (parent[x] !== x) {
                parent[x] = find(parent[x]);
            }
            return parent[x];
        };

        const union = (x, y) => {
            let px = find(x);
            let py = find(y);
            if (px === py) return false;
            if (rank[px] < rank[py]) [px, py] = [py, px];
            parent[py] = px;
            if (rank[px] === rank[py]) rank[px]++;
            return true;
        };

        for (const [u, v] of edges) {
            if (!union(u, v)) return false;
        }

        return true;
    }
}
