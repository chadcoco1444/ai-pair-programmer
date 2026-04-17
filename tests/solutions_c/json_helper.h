#ifndef JSON_HELPER_H
#define JSON_HELPER_H

#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <stdbool.h>
#include <ctype.h>
#include <limits.h>
#include <math.h>
#include <assert.h>

/* ============================================================
 * Minimal JSON value type
 * ============================================================ */

typedef enum {
    JSON_NULL,
    JSON_BOOL,
    JSON_NUMBER,
    JSON_STRING,
    JSON_ARRAY,
    JSON_OBJECT
} JsonType;

typedef struct JsonValue {
    JsonType type;
    int bool_val;
    double num_val;
    char* str_val;                   /* heap allocated null-term string */
    struct JsonValue* arr_val;       /* heap array of children */
    int arr_len;
    /* Object: parallel key/val arrays */
    char** obj_keys;
    struct JsonValue* obj_vals;
    int obj_len;
} JsonValue;

/* ============================================================
 * JSON parser (simple recursive descent)
 * ============================================================ */

static void jh_skip_ws(const char* s, int* pos) {
    while (s[*pos] && (s[*pos]==' '||s[*pos]=='\t'||s[*pos]=='\n'||s[*pos]=='\r')) (*pos)++;
}

static JsonValue jh_parse_value(const char* s, int* pos);

static JsonValue jh_parse_string(const char* s, int* pos) {
    JsonValue v;
    memset(&v, 0, sizeof(v));
    v.type = JSON_STRING;
    (*pos)++; /* skip opening quote */
    int cap = 16;
    int len = 0;
    char* buf = (char*)malloc(cap);
    while (s[*pos] && s[*pos] != '"') {
        char c = s[*pos];
        if (c == '\\') {
            (*pos)++;
            char esc = s[*pos];
            char out = '?';
            switch (esc) {
                case '"': out = '"'; break;
                case '\\': out = '\\'; break;
                case '/': out = '/'; break;
                case 'n': out = '\n'; break;
                case 't': out = '\t'; break;
                case 'r': out = '\r'; break;
                case 'b': out = '\b'; break;
                case 'f': out = '\f'; break;
                case 'u': {
                    /* Basic 4-hex */
                    if (s[*pos+1] && s[*pos+2] && s[*pos+3] && s[*pos+4]) {
                        char hex[5] = {s[*pos+1], s[*pos+2], s[*pos+3], s[*pos+4], 0};
                        int code = (int)strtol(hex, NULL, 16);
                        out = (code < 128) ? (char)code : '?';
                        (*pos) += 4;
                    }
                    break;
                }
                default: out = esc; break;
            }
            if (len + 1 >= cap) { cap *= 2; buf = (char*)realloc(buf, cap); }
            buf[len++] = out;
            (*pos)++;
        } else {
            if (len + 1 >= cap) { cap *= 2; buf = (char*)realloc(buf, cap); }
            buf[len++] = c;
            (*pos)++;
        }
    }
    if (s[*pos] == '"') (*pos)++;
    buf[len] = '\0';
    v.str_val = buf;
    return v;
}

static JsonValue jh_parse_number(const char* s, int* pos) {
    JsonValue v;
    memset(&v, 0, sizeof(v));
    v.type = JSON_NUMBER;
    int start = *pos;
    if (s[*pos] == '-' || s[*pos] == '+') (*pos)++;
    while (isdigit((unsigned char)s[*pos])) (*pos)++;
    if (s[*pos] == '.') { (*pos)++; while (isdigit((unsigned char)s[*pos])) (*pos)++; }
    if (s[*pos] == 'e' || s[*pos] == 'E') {
        (*pos)++;
        if (s[*pos] == '+' || s[*pos] == '-') (*pos)++;
        while (isdigit((unsigned char)s[*pos])) (*pos)++;
    }
    int n = *pos - start;
    char* tmp = (char*)malloc(n + 1);
    memcpy(tmp, s + start, n);
    tmp[n] = '\0';
    v.num_val = strtod(tmp, NULL);
    free(tmp);
    return v;
}

static JsonValue jh_parse_array(const char* s, int* pos) {
    JsonValue v;
    memset(&v, 0, sizeof(v));
    v.type = JSON_ARRAY;
    (*pos)++; /* skip [ */
    int cap = 4;
    v.arr_val = (JsonValue*)malloc(sizeof(JsonValue) * cap);
    v.arr_len = 0;
    jh_skip_ws(s, pos);
    if (s[*pos] == ']') { (*pos)++; return v; }
    while (s[*pos]) {
        JsonValue child = jh_parse_value(s, pos);
        if (v.arr_len >= cap) {
            cap *= 2;
            v.arr_val = (JsonValue*)realloc(v.arr_val, sizeof(JsonValue) * cap);
        }
        v.arr_val[v.arr_len++] = child;
        jh_skip_ws(s, pos);
        if (s[*pos] == ',') { (*pos)++; continue; }
        if (s[*pos] == ']') { (*pos)++; break; }
    }
    return v;
}

static JsonValue jh_parse_object(const char* s, int* pos) {
    JsonValue v;
    memset(&v, 0, sizeof(v));
    v.type = JSON_OBJECT;
    (*pos)++; /* skip { */
    int cap = 4;
    v.obj_keys = (char**)malloc(sizeof(char*) * cap);
    v.obj_vals = (JsonValue*)malloc(sizeof(JsonValue) * cap);
    v.obj_len = 0;
    jh_skip_ws(s, pos);
    if (s[*pos] == '}') { (*pos)++; return v; }
    while (s[*pos]) {
        jh_skip_ws(s, pos);
        JsonValue key = jh_parse_string(s, pos);
        jh_skip_ws(s, pos);
        if (s[*pos] == ':') (*pos)++;
        JsonValue val = jh_parse_value(s, pos);
        if (v.obj_len >= cap) {
            cap *= 2;
            v.obj_keys = (char**)realloc(v.obj_keys, sizeof(char*) * cap);
            v.obj_vals = (JsonValue*)realloc(v.obj_vals, sizeof(JsonValue) * cap);
        }
        v.obj_keys[v.obj_len] = key.str_val; /* take ownership */
        v.obj_vals[v.obj_len] = val;
        v.obj_len++;
        jh_skip_ws(s, pos);
        if (s[*pos] == ',') { (*pos)++; continue; }
        if (s[*pos] == '}') { (*pos)++; break; }
    }
    return v;
}

static JsonValue jh_parse_value(const char* s, int* pos) {
    jh_skip_ws(s, pos);
    char c = s[*pos];
    if (c == '"') return jh_parse_string(s, pos);
    if (c == '[') return jh_parse_array(s, pos);
    if (c == '{') return jh_parse_object(s, pos);
    if (c == 't') { *pos += 4; JsonValue v; memset(&v,0,sizeof(v)); v.type = JSON_BOOL; v.bool_val = 1; return v; }
    if (c == 'f') { *pos += 5; JsonValue v; memset(&v,0,sizeof(v)); v.type = JSON_BOOL; v.bool_val = 0; return v; }
    if (c == 'n') { *pos += 4; JsonValue v; memset(&v,0,sizeof(v)); v.type = JSON_NULL; return v; }
    return jh_parse_number(s, pos);
}

static JsonValue json_parse(const char* s) {
    int pos = 0;
    return jh_parse_value(s, &pos);
}

/* ============================================================
 * Read args from /tmp/args.json
 * Returns a heap-allocated array of JsonValues (root array elements)
 * ============================================================ */

static JsonValue g_args_root; /* owns the parsed tree */

static JsonValue* parse_args(void) {
    FILE* f = fopen("/tmp/args.json", "r");
    if (!f) { fprintf(stderr, "cannot open /tmp/args.json\n"); exit(1); }
    fseek(f, 0, SEEK_END);
    long sz = ftell(f);
    fseek(f, 0, SEEK_SET);
    char* buf = (char*)malloc(sz + 1);
    fread(buf, 1, sz, f);
    buf[sz] = '\0';
    fclose(f);
    g_args_root = json_parse(buf);
    free(buf);
    return g_args_root.arr_val;
}

/* ============================================================
 * Object lookup
 * ============================================================ */

static JsonValue* json_obj_get(JsonValue* v, const char* key) {
    if (!v || v->type != JSON_OBJECT) return NULL;
    for (int i = 0; i < v->obj_len; i++) {
        if (strcmp(v->obj_keys[i], key) == 0) return &v->obj_vals[i];
    }
    return NULL;
}

/* ============================================================
 * Accessors
 * ============================================================ */

static int to_int(JsonValue* v) {
    if (!v) return 0;
    if (v->type == JSON_BOOL) return v->bool_val;
    return (int)v->num_val;
}

static long long to_long(JsonValue* v) {
    if (!v) return 0;
    return (long long)v->num_val;
}

static double to_double(JsonValue* v) {
    if (!v) return 0.0;
    return v->num_val;
}

static bool to_bool(JsonValue* v) {
    if (!v) return false;
    if (v->type == JSON_BOOL) return v->bool_val != 0;
    return v->num_val != 0;
}

static const char* to_str(JsonValue* v) {
    if (!v || v->type != JSON_STRING) return "";
    return v->str_val;
}

/* Returns heap-allocated copy */
static char* to_str_copy(JsonValue* v) {
    const char* s = to_str(v);
    char* out = (char*)malloc(strlen(s) + 1);
    strcpy(out, s);
    return out;
}

static int* to_int_array(JsonValue* v, int* out_len) {
    if (!v || v->type != JSON_ARRAY) { *out_len = 0; return NULL; }
    *out_len = v->arr_len;
    if (v->arr_len == 0) { return (int*)malloc(1); }
    int* out = (int*)malloc(sizeof(int) * v->arr_len);
    for (int i = 0; i < v->arr_len; i++) out[i] = to_int(&v->arr_val[i]);
    return out;
}

static char** to_string_array(JsonValue* v, int* out_len) {
    if (!v || v->type != JSON_ARRAY) { *out_len = 0; return NULL; }
    *out_len = v->arr_len;
    if (v->arr_len == 0) { return (char**)malloc(sizeof(char*)); }
    char** out = (char**)malloc(sizeof(char*) * v->arr_len);
    for (int i = 0; i < v->arr_len; i++) out[i] = to_str_copy(&v->arr_val[i]);
    return out;
}

static int** to_int_matrix(JsonValue* v, int* out_rows, int** out_cols) {
    if (!v || v->type != JSON_ARRAY) { *out_rows = 0; *out_cols = NULL; return NULL; }
    *out_rows = v->arr_len;
    if (v->arr_len == 0) { *out_cols = (int*)malloc(sizeof(int)); return (int**)malloc(sizeof(int*)); }
    int** out = (int**)malloc(sizeof(int*) * v->arr_len);
    int* cols = (int*)malloc(sizeof(int) * v->arr_len);
    for (int i = 0; i < v->arr_len; i++) {
        out[i] = to_int_array(&v->arr_val[i], &cols[i]);
    }
    *out_cols = cols;
    return out;
}

/* Char matrix: each row is an array of 1-char strings.
 * Returns array of null-terminated strings (each row is a C string) */
static char** to_char_matrix_as_strings(JsonValue* v, int* out_rows, int* out_cols) {
    if (!v || v->type != JSON_ARRAY) { *out_rows = 0; *out_cols = 0; return NULL; }
    *out_rows = v->arr_len;
    if (v->arr_len == 0) { *out_cols = 0; return (char**)malloc(sizeof(char*)); }
    char** out = (char**)malloc(sizeof(char*) * v->arr_len);
    int cols = v->arr_val[0].arr_len;
    *out_cols = cols;
    for (int i = 0; i < v->arr_len; i++) {
        JsonValue* row = &v->arr_val[i];
        char* s = (char*)malloc(cols + 1);
        for (int j = 0; j < cols; j++) {
            JsonValue* cell = &row->arr_val[j];
            const char* cs = to_str(cell);
            s[j] = cs[0];
        }
        s[cols] = '\0';
        out[i] = s;
    }
    return out;
}

/* ============================================================
 * Output helpers (print JSON to stdout)
 * ============================================================ */

static void print_int(int v) { printf("%d\n", v); }
static void print_long(long long v) { printf("%lld\n", v); }
static void print_bool(bool v) { printf("%s\n", v ? "true" : "false"); }
static void print_null(void) { printf("null\n"); }

static void print_double(double v) {
    if (v == (long long)v) printf("%lld.0\n", (long long)v);
    else printf("%g\n", v);
}

static void print_json_string(const char* s) {
    putchar('"');
    for (const char* p = s; *p; p++) {
        char c = *p;
        if (c == '"') { putchar('\\'); putchar('"'); }
        else if (c == '\\') { putchar('\\'); putchar('\\'); }
        else if (c == '\n') { putchar('\\'); putchar('n'); }
        else if (c == '\t') { putchar('\\'); putchar('t'); }
        else if (c == '\r') { putchar('\\'); putchar('r'); }
        else putchar(c);
    }
    putchar('"');
}

static void print_string(const char* s) {
    print_json_string(s);
    putchar('\n');
}

static void print_int_array(int* arr, int n) {
    putchar('[');
    for (int i = 0; i < n; i++) {
        if (i > 0) putchar(',');
        printf("%d", arr[i]);
    }
    putchar(']');
    putchar('\n');
}

static void print_long_array(long long* arr, int n) {
    putchar('[');
    for (int i = 0; i < n; i++) {
        if (i > 0) putchar(',');
        printf("%lld", arr[i]);
    }
    putchar(']');
    putchar('\n');
}

static void print_int_matrix(int** mat, int rows, int* cols) {
    putchar('[');
    for (int i = 0; i < rows; i++) {
        if (i > 0) putchar(',');
        putchar('[');
        for (int j = 0; j < cols[i]; j++) {
            if (j > 0) putchar(',');
            printf("%d", mat[i][j]);
        }
        putchar(']');
    }
    putchar(']');
    putchar('\n');
}

static void print_string_array(char** arr, int n) {
    putchar('[');
    for (int i = 0; i < n; i++) {
        if (i > 0) putchar(',');
        print_json_string(arr[i]);
    }
    putchar(']');
    putchar('\n');
}

static void print_string_matrix(char*** mat, int rows, int* cols) {
    putchar('[');
    for (int i = 0; i < rows; i++) {
        if (i > 0) putchar(',');
        putchar('[');
        for (int j = 0; j < cols[i]; j++) {
            if (j > 0) putchar(',');
            print_json_string(mat[i][j]);
        }
        putchar(']');
    }
    putchar(']');
    putchar('\n');
}

/* ============================================================
 * TreeNode
 * ============================================================ */

typedef struct TreeNode {
    int val;
    struct TreeNode* left;
    struct TreeNode* right;
} TreeNode;

static TreeNode* new_tree_node(int val) {
    TreeNode* n = (TreeNode*)malloc(sizeof(TreeNode));
    n->val = val;
    n->left = n->right = NULL;
    return n;
}

/* Build tree from level-order JSON array (with nulls) */
static TreeNode* build_tree(JsonValue* v) {
    if (!v || v->type != JSON_ARRAY || v->arr_len == 0) return NULL;
    if (v->arr_val[0].type == JSON_NULL) return NULL;
    TreeNode* root = new_tree_node(to_int(&v->arr_val[0]));
    /* BFS queue for tree node pointers */
    int qcap = 16;
    TreeNode** q = (TreeNode**)malloc(sizeof(TreeNode*) * qcap);
    int qhead = 0, qtail = 0;
    q[qtail++] = root;
    int i = 1;
    while (qhead < qtail && i < v->arr_len) {
        TreeNode* cur = q[qhead++];
        if (i < v->arr_len && v->arr_val[i].type != JSON_NULL) {
            cur->left = new_tree_node(to_int(&v->arr_val[i]));
            if (qtail >= qcap) { qcap *= 2; q = (TreeNode**)realloc(q, sizeof(TreeNode*) * qcap); }
            q[qtail++] = cur->left;
        }
        i++;
        if (i < v->arr_len && v->arr_val[i].type != JSON_NULL) {
            cur->right = new_tree_node(to_int(&v->arr_val[i]));
            if (qtail >= qcap) { qcap *= 2; q = (TreeNode**)realloc(q, sizeof(TreeNode*) * qcap); }
            q[qtail++] = cur->right;
        }
        i++;
    }
    free(q);
    return root;
}

/* BFS find node by value */
static TreeNode* find_node(TreeNode* root, int val) {
    if (!root) return NULL;
    int qcap = 16;
    TreeNode** q = (TreeNode**)malloc(sizeof(TreeNode*) * qcap);
    int qhead = 0, qtail = 0;
    q[qtail++] = root;
    TreeNode* result = NULL;
    while (qhead < qtail) {
        TreeNode* n = q[qhead++];
        if (n->val == val) { result = n; break; }
        if (n->left) {
            if (qtail >= qcap) { qcap *= 2; q = (TreeNode**)realloc(q, sizeof(TreeNode*) * qcap); }
            q[qtail++] = n->left;
        }
        if (n->right) {
            if (qtail >= qcap) { qcap *= 2; q = (TreeNode**)realloc(q, sizeof(TreeNode*) * qcap); }
            q[qtail++] = n->right;
        }
    }
    free(q);
    return result;
}

/* Print tree as level-order array with null markers, trailing nulls stripped */
static void print_tree(TreeNode* root) {
    if (!root) { printf("[]\n"); return; }
    /* BFS collect including null children */
    int cap = 32;
    TreeNode** q = (TreeNode**)malloc(sizeof(TreeNode*) * cap);
    int qhead = 0, qtail = 0;
    q[qtail++] = root;
    char** tokens = (char**)malloc(sizeof(char*) * cap);
    int n = 0;
    int tcap = cap;
    while (qhead < qtail) {
        TreeNode* cur = q[qhead++];
        if (n >= tcap) { tcap *= 2; tokens = (char**)realloc(tokens, sizeof(char*) * tcap); }
        if (cur) {
            char buf[32];
            snprintf(buf, sizeof(buf), "%d", cur->val);
            tokens[n] = (char*)malloc(strlen(buf)+1); strcpy(tokens[n], buf); n++;
            if (qtail + 2 >= cap) { cap *= 2; q = (TreeNode**)realloc(q, sizeof(TreeNode*) * cap); }
            q[qtail++] = cur->left;
            q[qtail++] = cur->right;
        } else {
            tokens[n] = (char*)malloc(5); strcpy(tokens[n], "null"); n++;
        }
    }
    /* strip trailing nulls */
    while (n > 0 && strcmp(tokens[n-1], "null") == 0) { free(tokens[n-1]); n--; }
    putchar('[');
    for (int i = 0; i < n; i++) {
        if (i > 0) putchar(',');
        printf("%s", tokens[i]);
        free(tokens[i]);
    }
    printf("]\n");
    free(tokens);
    free(q);
}

/* ============================================================
 * ListNode
 * ============================================================ */

typedef struct ListNode {
    int val;
    struct ListNode* next;
} ListNode;

static ListNode* new_list_node(int val) {
    ListNode* n = (ListNode*)malloc(sizeof(ListNode));
    n->val = val;
    n->next = NULL;
    return n;
}

static ListNode* build_list(JsonValue* v) {
    if (!v || v->type != JSON_ARRAY || v->arr_len == 0) return NULL;
    ListNode dummy; dummy.next = NULL;
    ListNode* cur = &dummy;
    for (int i = 0; i < v->arr_len; i++) {
        cur->next = new_list_node(to_int(&v->arr_val[i]));
        cur = cur->next;
    }
    return dummy.next;
}

static ListNode* build_list_with_cycle(JsonValue* v, int pos) {
    if (!v || v->type != JSON_ARRAY || v->arr_len == 0) return NULL;
    ListNode** nodes = (ListNode**)malloc(sizeof(ListNode*) * v->arr_len);
    for (int i = 0; i < v->arr_len; i++) {
        nodes[i] = new_list_node(to_int(&v->arr_val[i]));
    }
    for (int i = 0; i + 1 < v->arr_len; i++) {
        nodes[i]->next = nodes[i+1];
    }
    if (pos >= 0 && pos < v->arr_len) {
        nodes[v->arr_len - 1]->next = nodes[pos];
    }
    ListNode* head = nodes[0];
    free(nodes);
    return head;
}

static void print_list(ListNode* head) {
    putchar('[');
    int first = 1;
    /* cycle-safe: limit iterations to 100000 */
    int guard = 0;
    while (head && guard < 100000) {
        if (!first) putchar(',');
        printf("%d", head->val);
        first = 0;
        head = head->next;
        guard++;
    }
    printf("]\n");
}

/* ============================================================
 * GraphNode (clone-graph)
 * ============================================================ */

typedef struct GraphNode {
    int val;
    struct GraphNode** neighbors;
    int neighbors_count;
    int neighbors_cap;
} GraphNode;

static GraphNode* new_graph_node(int val) {
    GraphNode* n = (GraphNode*)malloc(sizeof(GraphNode));
    n->val = val;
    n->neighbors_cap = 4;
    n->neighbors = (GraphNode**)malloc(sizeof(GraphNode*) * n->neighbors_cap);
    n->neighbors_count = 0;
    return n;
}

static void graph_add_neighbor(GraphNode* n, GraphNode* nb) {
    if (n->neighbors_count >= n->neighbors_cap) {
        n->neighbors_cap *= 2;
        n->neighbors = (GraphNode**)realloc(n->neighbors, sizeof(GraphNode*) * n->neighbors_cap);
    }
    n->neighbors[n->neighbors_count++] = nb;
}

static GraphNode* build_graph(JsonValue* v) {
    if (!v || v->type != JSON_ARRAY || v->arr_len == 0) return NULL;
    GraphNode** nodes = (GraphNode**)malloc(sizeof(GraphNode*) * v->arr_len);
    for (int i = 0; i < v->arr_len; i++) {
        nodes[i] = new_graph_node(i + 1);
    }
    for (int i = 0; i < v->arr_len; i++) {
        JsonValue* adj = &v->arr_val[i];
        for (int j = 0; j < adj->arr_len; j++) {
            int nb = to_int(&adj->arr_val[j]);
            graph_add_neighbor(nodes[i], nodes[nb - 1]);
        }
    }
    GraphNode* head = nodes[0];
    free(nodes);
    return head;
}

/* Print graph as adjacency list, sorted by node value */
static void print_graph(GraphNode* node) {
    if (!node) { printf("[]\n"); return; }
    /* BFS */
    int cap = 16;
    GraphNode** visited = (GraphNode**)malloc(sizeof(GraphNode*) * cap);
    int vlen = 0;
    GraphNode** queue = (GraphNode**)malloc(sizeof(GraphNode*) * cap);
    int qh = 0, qt = 0;
    queue[qt++] = node;
    visited[vlen++] = node;

    while (qh < qt) {
        GraphNode* cur = queue[qh++];
        for (int i = 0; i < cur->neighbors_count; i++) {
            GraphNode* nb = cur->neighbors[i];
            int seen = 0;
            for (int k = 0; k < vlen; k++) if (visited[k] == nb) { seen = 1; break; }
            if (!seen) {
                if (vlen >= cap) { cap *= 2; visited = (GraphNode**)realloc(visited, sizeof(GraphNode*) * cap); queue = (GraphNode**)realloc(queue, sizeof(GraphNode*) * cap); }
                visited[vlen++] = nb;
                queue[qt++] = nb;
            }
        }
    }
    /* Build result: for each val in sorted order, get neighbors sorted by val */
    /* find max val */
    int max_val = 0;
    for (int i = 0; i < vlen; i++) if (visited[i]->val > max_val) max_val = visited[i]->val;
    GraphNode** by_val = (GraphNode**)calloc(max_val + 1, sizeof(GraphNode*));
    for (int i = 0; i < vlen; i++) by_val[visited[i]->val] = visited[i];
    putchar('[');
    int first = 1;
    for (int v = 1; v <= max_val; v++) {
        if (!by_val[v]) continue;
        if (!first) putchar(',');
        first = 0;
        /* collect neighbor vals and sort */
        int nc = by_val[v]->neighbors_count;
        int* nbs = (int*)malloc(sizeof(int) * (nc > 0 ? nc : 1));
        for (int i = 0; i < nc; i++) nbs[i] = by_val[v]->neighbors[i]->val;
        /* simple insertion sort */
        for (int i = 1; i < nc; i++) {
            int t = nbs[i], j = i - 1;
            while (j >= 0 && nbs[j] > t) { nbs[j+1] = nbs[j]; j--; }
            nbs[j+1] = t;
        }
        putchar('[');
        for (int i = 0; i < nc; i++) { if (i>0) putchar(','); printf("%d", nbs[i]); }
        putchar(']');
        free(nbs);
    }
    printf("]\n");
    free(by_val);
    free(visited);
    free(queue);
}

/* ============================================================
 * Multi-op result helper (for design problems)
 * ============================================================ */

typedef struct {
    char** items;
    int count;
    int cap;
} MultiOpResult;

static void mor_init(MultiOpResult* m) {
    m->cap = 8;
    m->count = 0;
    m->items = (char**)malloc(sizeof(char*) * m->cap);
}

static void mor_push_raw(MultiOpResult* m, const char* s) {
    if (m->count >= m->cap) {
        m->cap *= 2;
        m->items = (char**)realloc(m->items, sizeof(char*) * m->cap);
    }
    m->items[m->count] = (char*)malloc(strlen(s) + 1);
    strcpy(m->items[m->count], s);
    m->count++;
}

static void mor_add_null(MultiOpResult* m) { mor_push_raw(m, "null"); }
static void mor_add_bool(MultiOpResult* m, bool v) { mor_push_raw(m, v ? "true" : "false"); }

static void mor_add_int(MultiOpResult* m, int v) {
    char buf[32];
    snprintf(buf, sizeof(buf), "%d", v);
    mor_push_raw(m, buf);
}

static void mor_add_double(MultiOpResult* m, double v) {
    char buf[64];
    if (v == (long long)v) snprintf(buf, sizeof(buf), "%lld.0", (long long)v);
    else snprintf(buf, sizeof(buf), "%g", v);
    mor_push_raw(m, buf);
}

static void mor_add_string(MultiOpResult* m, const char* s) {
    size_t n = strlen(s);
    char* buf = (char*)malloc(n * 2 + 4);
    int k = 0;
    buf[k++] = '"';
    for (size_t i = 0; i < n; i++) {
        char c = s[i];
        if (c == '"') { buf[k++]='\\'; buf[k++]='"'; }
        else if (c == '\\') { buf[k++]='\\'; buf[k++]='\\'; }
        else if (c == '\n') { buf[k++]='\\'; buf[k++]='n'; }
        else if (c == '\t') { buf[k++]='\\'; buf[k++]='t'; }
        else buf[k++] = c;
    }
    buf[k++] = '"';
    buf[k] = '\0';
    mor_push_raw(m, buf);
    free(buf);
}

static void mor_print(MultiOpResult* m) {
    putchar('[');
    for (int i = 0; i < m->count; i++) {
        if (i > 0) putchar(',');
        printf("%s", m->items[i]);
    }
    printf("]\n");
}

#endif /* JSON_HELPER_H */
