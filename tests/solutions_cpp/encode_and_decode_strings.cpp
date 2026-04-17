#include "json_helper.h"

class Codec {
public:
    string encode(vector<string>& strs) {
        string result;
        for (const string& s : strs) {
            result += to_string(s.size()) + "#" + s;
        }
        return result;
    }

    vector<string> decode(const string& s) {
        vector<string> result;
        size_t i = 0;
        while (i < s.size()) {
            size_t j = s.find('#', i);
            int length = stoi(s.substr(i, j - i));
            result.push_back(s.substr(j + 1, length));
            i = j + 1 + length;
        }
        return result;
    }
};

int main() {
    auto args = parse_args();
    auto strs = to_vector_string(args[0]);
    Codec c;
    auto encoded = c.encode(strs);
    auto decoded = c.decode(encoded);
    cout << to_json(decoded) << endl;
    return 0;
}
