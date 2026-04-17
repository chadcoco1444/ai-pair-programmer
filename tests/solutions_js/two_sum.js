class Solution {
    twoSum(nums, target) {
        const lookup = {};
        for (let i = 0; i < nums.length; i++) {
            const complement = target - nums[i];
            if (complement in lookup) {
                return [lookup[complement], i];
            }
            lookup[nums[i]] = i;
        }
    }
}
