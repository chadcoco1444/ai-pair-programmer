class Solution {
    buildTree(preorder, inorder) {
        if (!preorder.length || !inorder.length) return null;
        const rootVal = preorder[0];
        const root = new TreeNode(rootVal);
        const mid = inorder.indexOf(rootVal);
        root.left = this.buildTree(preorder.slice(1, mid + 1), inorder.slice(0, mid));
        root.right = this.buildTree(preorder.slice(mid + 1), inorder.slice(mid + 1));
        return root;
    }
}
