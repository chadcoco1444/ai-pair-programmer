class Solution {
    characterReplacement(s, k) {
        const count = {};
        let maxCount = 0;
        let maxLen = 0;
        let left = 0;
        for (let right = 0; right < s.length; right++) {
            count[s[right]] = (count[s[right]] || 0) + 1;
            maxCount = Math.max(maxCount, count[s[right]]);
            while ((right - left + 1) - maxCount > k) {
                count[s[left]]--;
                left++;
            }
            maxLen = Math.max(maxLen, right - left + 1);
        }
        return maxLen;
    }
}
