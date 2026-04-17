class Solution {
    minWindow(s, t) {
        if (!t || !s) return "";
        const need = {};
        for (const c of t) need[c] = (need[c] || 0) + 1;
        let missing = t.length;
        let bestLeft = 0, bestRight = Infinity;
        let left = 0;
        for (let right = 0; right < s.length; right++) {
            const char = s[right];
            if ((need[char] || 0) > 0) missing--;
            need[char] = (need[char] || 0) - 1;
            if (missing === 0) {
                while (need[s[left]] < 0) {
                    need[s[left]]++;
                    left++;
                }
                if (right - left < bestRight - bestLeft) {
                    bestLeft = left;
                    bestRight = right;
                }
                need[s[left]]++;
                missing++;
                left++;
            }
        }
        return bestRight !== Infinity ? s.slice(bestLeft, bestRight + 1) : "";
    }
}
