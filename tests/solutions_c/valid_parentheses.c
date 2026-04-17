#include "json_helper.h"

bool isValid(char* s) {
    int n = (int)strlen(s);
    char* stk = (char*)malloc(n + 1);
    int top = 0;
    for (int i = 0; i < n; i++) {
        char c = s[i];
        if (c == '(' || c == '[' || c == '{') stk[top++] = c;
        else {
            if (top == 0) { free(stk); return false; }
            char t = stk[--top];
            if ((c == ')' && t != '(') || (c == ']' && t != '[') || (c == '}' && t != '{')) { free(stk); return false; }
        }
    }
    int r = (top == 0);
    free(stk);
    return r != 0;
}

int main() {
    JsonValue* args = parse_args();
    char* s = to_str_copy(&args[0]);
    print_bool(isValid(s));
    return 0;
}
