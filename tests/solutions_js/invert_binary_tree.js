class Solution {
    invertTree(root) {
        if (root === null) return null;
        const left = this.invertTree(root.left);
        const right = this.invertTree(root.right);
        root.left = right;
        root.right = left;
        return root;
    }
}
