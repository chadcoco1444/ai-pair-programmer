class Solution {
  rotate(matrix) {
    const n = matrix.length;

    // Step 1: Transpose
    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
      }
    }

    // Step 2: Reverse each row
    for (const row of matrix) {
      row.reverse();
    }
  }
}
