class Solution {
    maxPathSum(root) {
        this.maxSum = -Infinity;

        const dfs = (node) => {
            if (node === null) return 0;
            const leftGain = Math.max(dfs(node.left), 0);
            const rightGain = Math.max(dfs(node.right), 0);
            this.maxSum = Math.max(this.maxSum, node.val + leftGain + rightGain);
            return node.val + Math.max(leftGain, rightGain);
        };

        dfs(root);
        return this.maxSum;
    }
}
