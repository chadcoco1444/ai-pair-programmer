class Solution {
    rob(nums) {
        if (!nums.length) return 0;
        if (nums.length === 1) return nums[0];
        let prev2 = 0, prev1 = 0;
        for (const num of nums) {
            const curr = Math.max(prev1, prev2 + num);
            prev2 = prev1;
            prev1 = curr;
        }
        return prev1;
    }
}
