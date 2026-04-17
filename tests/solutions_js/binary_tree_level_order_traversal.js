class Solution {
    levelOrder(root) {
        if (root === null) return [];
        const result = [];
        const queue = [root];
        while (queue.length > 0) {
            const levelSize = queue.length;
            const level = [];
            for (let i = 0; i < levelSize; i++) {
                const node = queue.shift();
                level.push(node.val);
                if (node.left) queue.push(node.left);
                if (node.right) queue.push(node.right);
            }
            result.push(level);
        }
        return result;
    }
}
