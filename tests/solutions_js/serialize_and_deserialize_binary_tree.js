class Codec {
    serialize(root) {
        if (root === null) return "";
        const result = [];
        const queue = [root];
        while (queue.length > 0) {
            const node = queue.shift();
            if (node === null) {
                result.push("null");
            } else {
                result.push(String(node.val));
                queue.push(node.left);
                queue.push(node.right);
            }
        }
        return result.join(",");
    }

    deserialize(data) {
        if (!data) return null;
        const tokens = data.split(",");
        const root = new TreeNode(parseInt(tokens[0]));
        const queue = [root];
        let i = 1;
        while (queue.length > 0 && i < tokens.length) {
            const node = queue.shift();
            if (i < tokens.length && tokens[i] !== "null") {
                node.left = new TreeNode(parseInt(tokens[i]));
                queue.push(node.left);
            }
            i++;
            if (i < tokens.length && tokens[i] !== "null") {
                node.right = new TreeNode(parseInt(tokens[i]));
                queue.push(node.right);
            }
            i++;
        }
        return root;
    }
}
