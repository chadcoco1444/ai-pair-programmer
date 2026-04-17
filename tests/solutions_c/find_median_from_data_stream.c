#include "json_helper.h"

/* Two heaps: lower (max-heap), upper (min-heap) */

typedef struct {
    int* data;
    int size;
    int cap;
    int is_min; /* 1 for min-heap, 0 for max-heap */
} Heap;

static void heap_init(Heap* h, int is_min) {
    h->cap = 16;
    h->size = 0;
    h->data = (int*)malloc(sizeof(int) * h->cap);
    h->is_min = is_min;
}

static int heap_cmp(Heap* h, int a, int b) {
    return h->is_min ? (a < b) : (a > b);
}

static void heap_push(Heap* h, int val) {
    if (h->size >= h->cap) {
        h->cap *= 2;
        h->data = (int*)realloc(h->data, sizeof(int) * h->cap);
    }
    int i = h->size++;
    h->data[i] = val;
    while (i > 0) {
        int parent = (i - 1) / 2;
        if (heap_cmp(h, h->data[i], h->data[parent])) {
            int t = h->data[i]; h->data[i] = h->data[parent]; h->data[parent] = t;
            i = parent;
        } else break;
    }
}

static int heap_top(Heap* h) { return h->data[0]; }

static int heap_pop(Heap* h) {
    int top = h->data[0];
    h->size--;
    if (h->size > 0) {
        h->data[0] = h->data[h->size];
        int i = 0;
        while (1) {
            int l = i*2+1, r = i*2+2, best = i;
            if (l < h->size && heap_cmp(h, h->data[l], h->data[best])) best = l;
            if (r < h->size && heap_cmp(h, h->data[r], h->data[best])) best = r;
            if (best == i) break;
            int t = h->data[i]; h->data[i] = h->data[best]; h->data[best] = t;
            i = best;
        }
    }
    return top;
}

static Heap g_lower, g_upper;

static void mf_add(int num) {
    heap_push(&g_lower, num);
    if (g_lower.size > 0 && g_upper.size > 0 && heap_top(&g_lower) > heap_top(&g_upper)) {
        int v = heap_pop(&g_lower);
        heap_push(&g_upper, v);
    }
    if (g_lower.size > g_upper.size + 1) {
        int v = heap_pop(&g_lower);
        heap_push(&g_upper, v);
    } else if (g_upper.size > g_lower.size) {
        int v = heap_pop(&g_upper);
        heap_push(&g_lower, v);
    }
}

static double mf_find(void) {
    if (g_lower.size > g_upper.size) return (double)heap_top(&g_lower);
    return ((double)heap_top(&g_lower) + (double)heap_top(&g_upper)) / 2.0;
}

int main() {
    JsonValue* args = parse_args();
    JsonValue* outer = &args[0];
    JsonValue* ops = json_obj_get(outer, "ops");
    JsonValue* opArgs = json_obj_get(outer, "args");

    heap_init(&g_lower, 0); /* max-heap */
    heap_init(&g_upper, 1); /* min-heap */

    MultiOpResult mor; mor_init(&mor);
    mor_add_null(&mor);
    for (int i = 1; i < ops->arr_len; i++) {
        const char* op = to_str(&ops->arr_val[i]);
        JsonValue* a = &opArgs->arr_val[i];
        if (strcmp(op, "addNum") == 0) {
            mf_add(to_int(&a->arr_val[0]));
            mor_add_null(&mor);
        } else if (strcmp(op, "findMedian") == 0) {
            mor_add_double(&mor, mf_find());
        }
    }
    mor_print(&mor);
    return 0;
}
