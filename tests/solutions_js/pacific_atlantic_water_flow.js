class Solution {
    pacificAtlantic(heights) {
        if (!heights || heights.length === 0 || heights[0].length === 0) return [];

        const rows = heights.length;
        const cols = heights[0].length;
        const directions = [[0, 1], [0, -1], [1, 0], [-1, 0]];

        const bfs = (starts) => {
            const visited = new Set(starts.map(([r, c]) => `${r},${c}`));
            const queue = [...starts];
            let head = 0;
            while (head < queue.length) {
                const [r, c] = queue[head++];
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    const key = `${nr},${nc}`;
                    if (
                        nr >= 0 && nr < rows &&
                        nc >= 0 && nc < cols &&
                        !visited.has(key) &&
                        heights[nr][nc] >= heights[r][c]
                    ) {
                        visited.add(key);
                        queue.push([nr, nc]);
                    }
                }
            }
            return visited;
        };

        const pacificStarts = [];
        const atlanticStarts = [];
        for (let r = 0; r < rows; r++) {
            pacificStarts.push([r, 0]);
            atlanticStarts.push([r, cols - 1]);
        }
        for (let c = 0; c < cols; c++) {
            pacificStarts.push([0, c]);
            atlanticStarts.push([rows - 1, c]);
        }

        const pacific = bfs(pacificStarts);
        const atlantic = bfs(atlanticStarts);

        const result = [];
        for (const key of pacific) {
            if (atlantic.has(key)) {
                result.push(key.split(",").map(Number));
            }
        }

        result.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
        return result;
    }
}
