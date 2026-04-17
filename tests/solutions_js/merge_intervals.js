class Solution {
  merge(intervals) {
    if (!intervals.length) return [];

    intervals.sort((a, b) => a[0] - b[0]);
    const merged = [intervals[0]];

    for (let i = 1; i < intervals.length; i++) {
      const [start, end] = intervals[i];
      if (start <= merged[merged.length - 1][1]) {
        merged[merged.length - 1][1] = Math.max(merged[merged.length - 1][1], end);
      } else {
        merged.push([start, end]);
      }
    }

    return merged;
  }
}
