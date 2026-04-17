class Solution {
  findWords(board, words) {
    const root = {};

    // Build trie
    for (const word of words) {
      let node = root;
      for (const char of word) {
        if (!node[char]) node[char] = {};
        node = node[char];
      }
      node._word = word;
    }

    const rows = board.length, cols = board[0].length;
    const result = [];
    const dirs = [[-1, 0], [1, 0], [0, -1], [0, 1]];

    const dfs = (row, col, node) => {
      const char = board[row][col];
      if (!node[char]) return;
      const nextNode = node[char];

      if (nextNode._word) {
        result.push(nextNode._word);
        nextNode._word = null;
      }

      board[row][col] = '#';
      for (const [dr, dc] of dirs) {
        const nr = row + dr, nc = col + dc;
        if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && board[nr][nc] !== '#') {
          dfs(nr, nc, nextNode);
        }
      }
      board[row][col] = char;

      // Prune empty trie nodes
      if (Object.keys(nextNode).length === 0) {
        delete node[char];
      }
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        dfs(r, c, root);
      }
    }

    return result;
  }
}
