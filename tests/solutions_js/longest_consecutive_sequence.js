class Solution {
  longestConsecutive(nums) {
    const numSet = new Set(nums);
    let longest = 0;

    for (const num of numSet) {
      if (!numSet.has(num - 1)) {
        let current = num;
        let length = 1;
        while (numSet.has(current + 1)) {
          current++;
          length++;
        }
        longest = Math.max(longest, length);
      }
    }

    return longest;
  }
}
