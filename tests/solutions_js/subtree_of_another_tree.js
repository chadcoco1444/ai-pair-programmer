class Solution {
    isSubtree(root, subRoot) {
        if (subRoot === null) return true;
        if (root === null) return false;
        if (this._sameTree(root, subRoot)) return true;
        return this.isSubtree(root.left, subRoot) || this.isSubtree(root.right, subRoot);
    }

    _sameTree(p, q) {
        if (p === null && q === null) return true;
        if (p === null || q === null) return false;
        return p.val === q.val && this._sameTree(p.left, q.left) && this._sameTree(p.right, q.right);
    }
}
