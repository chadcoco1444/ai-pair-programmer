#include "json_helper.h"

class MedianFinder {
public:
    priority_queue<int> lower;                                   // max-heap (lower half)
    priority_queue<int, vector<int>, greater<int>> upper;        // min-heap (upper half)

    MedianFinder() {}

    void addNum(int num) {
        lower.push(num);
        // Ensure ordering: every element in lower <= every element in upper
        if (!lower.empty() && !upper.empty() && lower.top() > upper.top()) {
            int v = lower.top(); lower.pop();
            upper.push(v);
        }
        // Balance sizes: lower may have at most 1 more than upper
        if ((int)lower.size() > (int)upper.size() + 1) {
            int v = lower.top(); lower.pop();
            upper.push(v);
        } else if ((int)upper.size() > (int)lower.size()) {
            int v = upper.top(); upper.pop();
            lower.push(v);
        }
    }

    double findMedian() {
        if (lower.size() > upper.size()) return (double)lower.top();
        return ((double)lower.top() + (double)upper.top()) / 2.0;
    }
};

int main() {
    auto args = parse_args();
    auto& outer = args[0].to_obj();
    auto& ops = outer.at("ops").to_arr();
    auto& opArgs = outer.at("args").to_arr();

    MedianFinder mf;
    MultiOpResult results;
    results.add_null(); // constructor
    for (size_t i = 1; i < ops.size(); i++) {
        const string& op = ops[i].to_str();
        auto& a = opArgs[i].to_arr();
        if (op == "addNum") {
            mf.addNum(a[0].to_int());
            results.add_null();
        } else if (op == "findMedian") {
            results.add_double(mf.findMedian());
        }
    }
    cout << results.to_json_str() << endl;
    return 0;
}
