class Solution {
    combinationSum(candidates, target) {
        const result = [];
        candidates.sort((a, b) => a - b);

        function backtrack(start, current, remaining) {
            if (remaining === 0) {
                result.push([...current]);
                return;
            }
            for (let i = start; i < candidates.length; i++) {
                if (candidates[i] > remaining) break;
                current.push(candidates[i]);
                backtrack(i, current, remaining - candidates[i]);
                current.pop();
            }
        }

        backtrack(0, [], target);
        return result;
    }
}
