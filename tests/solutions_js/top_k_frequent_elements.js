class Solution {
  topKFrequent(nums, k) {
    const count = new Map();
    for (const num of nums) {
      count.set(num, (count.get(num) || 0) + 1);
    }

    // Bucket sort: index = frequency, value = list of nums with that frequency
    const buckets = Array.from({ length: nums.length + 1 }, () => []);
    for (const [num, freq] of count) {
      buckets[freq].push(num);
    }

    const result = [];
    for (let i = buckets.length - 1; i >= 0 && result.length < k; i--) {
      for (const num of buckets[i]) {
        result.push(num);
        if (result.length === k) break;
      }
    }

    return result;
  }
}
