class MedianFinder {
  constructor() {
    this.lower = []; // max-heap (stored as negated values)
    this.upper = []; // min-heap
  }

  addNum(num) {
    this._heapPush(this.lower, -num);

    // Ensure max of lower <= min of upper
    if (this.lower.length && this.upper.length && -this.lower[0] > this.upper[0]) {
      const val = -this._heapPop(this.lower);
      this._heapPush(this.upper, val);
    }

    // Rebalance sizes
    if (this.lower.length > this.upper.length + 1) {
      const val = -this._heapPop(this.lower);
      this._heapPush(this.upper, val);
    } else if (this.upper.length > this.lower.length) {
      const val = this._heapPop(this.upper);
      this._heapPush(this.lower, -val);
    }
  }

  findMedian() {
    if (this.lower.length > this.upper.length) {
      return -this.lower[0];
    }
    return (-this.lower[0] + this.upper[0]) / 2;
  }

  _heapPush(heap, val) {
    heap.push(val);
    let i = heap.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (heap[parent] <= heap[i]) break;
      [heap[parent], heap[i]] = [heap[i], heap[parent]];
      i = parent;
    }
  }

  _heapPop(heap) {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length > 0) {
      heap[0] = last;
      let i = 0;
      while (true) {
        let smallest = i;
        const left = 2 * i + 1, right = 2 * i + 2;
        if (left < heap.length && heap[left] < heap[smallest]) smallest = left;
        if (right < heap.length && heap[right] < heap[smallest]) smallest = right;
        if (smallest === i) break;
        [heap[i], heap[smallest]] = [heap[smallest], heap[i]];
        i = smallest;
      }
    }
    return top;
  }
}
