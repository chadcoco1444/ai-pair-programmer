class Solution {
    rob(nums) {
        if (!nums.length) return 0;
        if (nums.length === 1) return nums[0];
        if (nums.length === 2) return Math.max(nums[0], nums[1]);

        function robLinear(houses) {
            let prev2 = 0, prev1 = 0;
            for (const num of houses) {
                const curr = Math.max(prev1, prev2 + num);
                prev2 = prev1;
                prev1 = curr;
            }
            return prev1;
        }

        return Math.max(
            robLinear(nums.slice(0, -1)),
            robLinear(nums.slice(1))
        );
    }
}
