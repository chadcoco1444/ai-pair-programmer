class Solution {
    maxDepth(root) {
        if (root === null) return 0;
        return 1 + Math.max(this.maxDepth(root.left), this.maxDepth(root.right));
    }
}
