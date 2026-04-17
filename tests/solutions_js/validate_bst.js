class Solution {
    isValidBST(root) {
        return this._validate(root, -Infinity, Infinity);
    }

    _validate(node, minVal, maxVal) {
        if (node === null) return true;
        if (node.val <= minVal || node.val >= maxVal) return false;
        return this._validate(node.left, minVal, node.val) &&
               this._validate(node.right, node.val, maxVal);
    }
}
