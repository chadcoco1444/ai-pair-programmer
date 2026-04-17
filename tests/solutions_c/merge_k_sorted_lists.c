#include "json_helper.h"

/* Min-heap of ListNode* by val */
typedef struct {
    ListNode** data;
    int size;
    int cap;
} MHeap;

static void mh_init(MHeap* h) {
    h->cap = 16; h->size = 0;
    h->data = (ListNode**)malloc(sizeof(ListNode*) * h->cap);
}

static void mh_push(MHeap* h, ListNode* n) {
    if (h->size >= h->cap) { h->cap *= 2; h->data = (ListNode**)realloc(h->data, sizeof(ListNode*) * h->cap); }
    int i = h->size++;
    h->data[i] = n;
    while (i > 0) {
        int p = (i - 1) / 2;
        if (h->data[i]->val < h->data[p]->val) {
            ListNode* t = h->data[i]; h->data[i] = h->data[p]; h->data[p] = t;
            i = p;
        } else break;
    }
}

static ListNode* mh_pop(MHeap* h) {
    ListNode* top = h->data[0];
    h->size--;
    if (h->size > 0) {
        h->data[0] = h->data[h->size];
        int i = 0;
        while (1) {
            int l = i*2+1, r = i*2+2, best = i;
            if (l < h->size && h->data[l]->val < h->data[best]->val) best = l;
            if (r < h->size && h->data[r]->val < h->data[best]->val) best = r;
            if (best == i) break;
            ListNode* t = h->data[i]; h->data[i] = h->data[best]; h->data[best] = t;
            i = best;
        }
    }
    return top;
}

ListNode* mergeKLists(ListNode** lists, int listsSize) {
    MHeap h; mh_init(&h);
    for (int i = 0; i < listsSize; i++) if (lists[i]) mh_push(&h, lists[i]);
    ListNode dummy; dummy.next = NULL;
    ListNode* cur = &dummy;
    while (h.size > 0) {
        ListNode* top = mh_pop(&h);
        cur->next = top;
        cur = cur->next;
        if (top->next) mh_push(&h, top->next);
    }
    cur->next = NULL;
    free(h.data);
    return dummy.next;
}

int main() {
    JsonValue* args = parse_args();
    JsonValue* outer = &args[0];
    int n = outer->arr_len;
    ListNode** lists = (ListNode**)malloc(sizeof(ListNode*) * (n > 0 ? n : 1));
    for (int i = 0; i < n; i++) lists[i] = build_list(&outer->arr_val[i]);
    ListNode* r = mergeKLists(lists, n);
    print_list(r);
    return 0;
}
