class Solution {
    kthSmallest(root, k) {
        this.count = 0;
        this.result = null;

        const inorder = (node) => {
            if (node === null || this.result !== null) return;
            inorder(node.left);
            this.count++;
            if (this.count === k) {
                this.result = node.val;
                return;
            }
            inorder(node.right);
        };

        inorder(root);
        return this.result;
    }
}
