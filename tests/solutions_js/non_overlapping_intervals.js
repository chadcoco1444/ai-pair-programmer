class Solution {
  eraseOverlapIntervals(intervals) {
    if (!intervals.length) return 0;

    intervals.sort((a, b) => a[1] - b[1]);
    let removals = 0;
    let prevEnd = intervals[0][1];

    for (let i = 1; i < intervals.length; i++) {
      if (intervals[i][0] < prevEnd) {
        removals++;
      } else {
        prevEnd = intervals[i][1];
      }
    }

    return removals;
  }
}
