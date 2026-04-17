class Solution {
    lengthOfLIS(nums) {
        const tails = [];
        for (const num of nums) {
            let lo = 0, hi = tails.length;
            while (lo < hi) {
                const mid = (lo + hi) >> 1;
                if (tails[mid] < num) lo = mid + 1;
                else hi = mid;
            }
            if (lo === tails.length) {
                tails.push(num);
            } else {
                tails[lo] = num;
            }
        }
        return tails.length;
    }
}
