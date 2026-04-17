class Solution {
  exist(board, word) {
    const rows = board.length, cols = board[0].length;

    const dfs = (r, c, idx) => {
      if (idx === word.length) return true;
      if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
      if (board[r][c] !== word[idx]) return false;

      const tmp = board[r][c];
      board[r][c] = '#';

      const found =
        dfs(r + 1, c, idx + 1) ||
        dfs(r - 1, c, idx + 1) ||
        dfs(r, c + 1, idx + 1) ||
        dfs(r, c - 1, idx + 1);

      board[r][c] = tmp;
      return found;
    };

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (dfs(r, c, 0)) return true;
      }
    }
    return false;
  }
}
