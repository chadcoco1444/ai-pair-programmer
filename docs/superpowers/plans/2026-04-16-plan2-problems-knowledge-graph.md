# Plan 2：題庫系統 + 知識圖譜 + 種子資料 — 實作計畫

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**目標：** 建立題庫 CRUD 服務、知識圖譜管理、種子資料匯入，讓平台有基礎題目可供練習。

**架構：** 在 Plan 1 建立的 Next.js monolith 上新增 tRPC routers 與 service 層。種子資料使用 YAML 格式定義，透過 Prisma seed 腳本匯入。

**技術棧：** tRPC v11, Prisma, YAML (js-yaml), Vitest

---

## 檔案結構

```
apps/web/
├── src/server/
│   ├── routers/
│   │   ├── problem.ts          # 題目 CRUD router
│   │   └── concept.ts          # 知識圖譜 router
│   ├── services/
│   │   ├── problem.ts          # 題目業務邏輯
│   │   └── knowledge-graph.ts  # 知識圖譜查詢與遍歷
│   └── router.ts               # 更新：掛載新 routers
├── __tests__/server/
│   ├── routers/
│   │   ├── problem.test.ts
│   │   └── concept.test.ts
│   └── services/
│       └── knowledge-graph.test.ts
├── prisma/
│   └── seed.ts                 # 種子資料匯入腳本
seed/
├── problems/
│   ├── algorithm/
│   │   ├── two-sum.yaml
│   │   ├── valid-parentheses.yaml
│   │   ├── merge-sorted-array.yaml
│   │   ├── binary-search.yaml
│   │   └── sliding-window-maximum.yaml
│   ├── system-design/
│   │   └── rate-limiter.yaml
│   └── system-programming/
│       └── lru-cache.yaml
└── knowledge-graph/
    └── concepts.yaml           # 概念節點與邊的定義
```

---

### Task 1：種子資料 — 知識圖譜概念定義

**Files:**
- Create: `seed/knowledge-graph/concepts.yaml`

- [ ] **Step 1: 建立 seed/knowledge-graph/concepts.yaml**

```yaml
# 知識圖譜種子資料
# 每個概念包含：name, domain, description
# 邊定義在 edges 區段

concepts:
  # ===== 演算法 =====
  - name: Array
    domain: ALGORITHM
    description: 陣列是最基礎的資料結構，支援隨機存取。理解陣列操作是所有演算法的基礎。

  - name: Two Pointer
    domain: ALGORITHM
    description: 雙指標技巧，使用兩個指標從不同方向遍歷陣列，常用於排序陣列的搜尋問題。

  - name: Sliding Window
    domain: ALGORITHM
    description: 滑動窗口技巧，維護一個動態大小的窗口在陣列上滑動，適用於子陣列/子字串問題。

  - name: Binary Search
    domain: ALGORITHM
    description: 二分搜尋，在有序資料中以 O(log n) 時間找到目標值。可擴展到搜尋答案空間。

  - name: Sorting
    domain: ALGORITHM
    description: 排序演算法，包括比較排序（快速排序、合併排序）和非比較排序（計數排序、基數排序）。

  - name: Divide and Conquer
    domain: ALGORITHM
    description: 分治法，將問題分解為子問題，遞迴求解後合併。合併排序和快速排序是經典範例。

  - name: Greedy
    domain: ALGORITHM
    description: 貪心法，每一步都選擇局部最優解。需要證明局部最優能導致全域最優。

  - name: Dynamic Programming
    domain: ALGORITHM
    description: 動態規劃，透過記錄子問題的解來避免重複計算。適用於具有最優子結構和重疊子問題的問題。

  - name: Backtracking
    domain: ALGORITHM
    description: 回溯法，系統性地搜尋所有可能的解，在發現不可行時回退。常用於排列、組合、棋盤問題。

  # ===== 資料結構 =====
  - name: Hash Table
    domain: DATA_STRUCTURE
    description: 雜湊表，提供平均 O(1) 的插入、刪除、查詢。理解雜湊函數和碰撞處理是關鍵。

  - name: Stack
    domain: DATA_STRUCTURE
    description: 堆疊，後進先出（LIFO）。常用於括號匹配、表達式求值、DFS 迭代實作。

  - name: Monotonic Stack
    domain: DATA_STRUCTURE
    description: 單調棧，維護一個單調遞增或遞減的棧。用於找到每個元素的下一個更大/更小元素。

  - name: Queue
    domain: DATA_STRUCTURE
    description: 佇列，先進先出（FIFO）。BFS 的基礎資料結構。

  - name: Linked List
    domain: DATA_STRUCTURE
    description: 鏈結串列，動態大小的線性資料結構。理解指標操作是系統程式設計的基礎。

  - name: Tree
    domain: DATA_STRUCTURE
    description: 樹是一種階層式資料結構。二元樹、BST、AVL 樹是常見變體。

  - name: Graph
    domain: DATA_STRUCTURE
    description: 圖由節點和邊組成。BFS 和 DFS 是基礎遍歷演算法。

  - name: Heap
    domain: DATA_STRUCTURE
    description: 堆積（優先佇列），支援 O(log n) 的插入和取出最大/最小值。用於 Top-K 問題和排程。

  # ===== 系統設計 =====
  - name: CAP Theorem
    domain: SYSTEM_DESIGN
    description: CAP 定理指出分散式系統最多只能同時滿足一致性、可用性、分區容忍中的兩個。

  - name: Load Balancing
    domain: SYSTEM_DESIGN
    description: 負載均衡，將請求分散到多個伺服器。常見策略有輪詢、最少連接、一致性雜湊。

  - name: Caching
    domain: SYSTEM_DESIGN
    description: 快取策略，在記憶體中儲存常用資料以減少延遲。需要考慮快取失效策略（LRU、LFU、TTL）。

  - name: Rate Limiting
    domain: SYSTEM_DESIGN
    description: 速率限制，保護系統免受過多請求。常見演算法有令牌桶、漏桶、固定窗口、滑動窗口。

  # ===== 系統程式設計 =====
  - name: Memory Management
    domain: MEMORY_MANAGEMENT
    description: 記憶體管理，包括動態記憶體分配（malloc/free）、記憶體對齊、記憶體池。

  - name: Thread Synchronization
    domain: CONCURRENCY
    description: 執行緒同步，使用互斥鎖、信號量、條件變數來協調多個執行緒的存取。

  - name: Lock-free Programming
    domain: CONCURRENCY
    description: 無鎖程式設計，使用原子操作（CAS）實現不需要鎖的併發資料結構。

  - name: Process Communication
    domain: OS_KERNEL
    description: 行程間通訊（IPC），包括管道、共享記憶體、訊息佇列、信號。

edges:
  # 演算法前置關係
  - parent: Array
    child: Two Pointer
    relation: prerequisite

  - parent: Array
    child: Sliding Window
    relation: prerequisite

  - parent: Two Pointer
    child: Sliding Window
    relation: related

  - parent: Array
    child: Binary Search
    relation: prerequisite

  - parent: Binary Search
    child: Divide and Conquer
    relation: prerequisite

  - parent: Array
    child: Sorting
    relation: prerequisite

  - parent: Sorting
    child: Divide and Conquer
    relation: related

  - parent: Dynamic Programming
    child: Greedy
    relation: related

  - parent: Backtracking
    child: Dynamic Programming
    relation: related

  # 資料結構前置關係
  - parent: Array
    child: Hash Table
    relation: prerequisite

  - parent: Stack
    child: Monotonic Stack
    relation: prerequisite

  - parent: Queue
    child: Graph
    relation: prerequisite

  - parent: Tree
    child: Graph
    relation: related

  - parent: Array
    child: Heap
    relation: prerequisite

  # 系統設計關聯
  - parent: Caching
    child: Rate Limiting
    relation: related

  - parent: CAP Theorem
    child: Load Balancing
    relation: related

  # 系統程式設計前置關係
  - parent: Memory Management
    child: Thread Synchronization
    relation: prerequisite

  - parent: Thread Synchronization
    child: Lock-free Programming
    relation: prerequisite

  - parent: Memory Management
    child: Process Communication
    relation: related
```

- [ ] **Step 2: 提交**

```bash
git add seed/knowledge-graph/concepts.yaml
git commit -m "feat: 新增知識圖譜種子資料 — 26 個概念與 20 條邊"
```

---

### Task 2：種子資料 — 基礎題庫

**Files:**
- Create: `seed/problems/algorithm/two-sum.yaml`
- Create: `seed/problems/algorithm/valid-parentheses.yaml`
- Create: `seed/problems/algorithm/binary-search.yaml`
- Create: `seed/problems/algorithm/sliding-window-maximum.yaml`
- Create: `seed/problems/algorithm/merge-sorted-array.yaml`
- Create: `seed/problems/system-design/rate-limiter.yaml`
- Create: `seed/problems/system-programming/lru-cache.yaml`

- [ ] **Step 1: 建立 seed/problems/algorithm/two-sum.yaml**

```yaml
title: Two Sum
slug: two-sum
difficulty: EASY
category: ALGORITHM
tags: [array, hash-table]
concepts:
  - name: Array
    relevance: 0.8
  - name: Hash Table
    relevance: 1.0
description: |
  給定一個整數陣列 `nums` 和一個目標值 `target`，找出陣列中兩個數字的索引，使得它們的和等於 `target`。

  你可以假設每個輸入恰好有一個解，且同一個元素不能使用兩次。

  **範例：**
  ```
  輸入: nums = [2,7,11,15], target = 9
  輸出: [0,1]
  解釋: nums[0] + nums[1] = 2 + 7 = 9
  ```

  **限制：**
  - 2 <= nums.length <= 10^4
  - -10^9 <= nums[i] <= 10^9
  - -10^9 <= target <= 10^9
  - 只有一個有效答案

hints:
  - 最直觀的方法是什麼？時間複雜度是多少？
  - 有沒有辦法用空間換時間？什麼資料結構可以做到 O(1) 的查詢？
  - 如果你知道需要找 target - nums[i]，怎麼快速知道這個值是否存在？

starterCode:
  PYTHON: |
    def two_sum(nums: list[int], target: int) -> list[int]:
        pass
  C: |
    int* twoSum(int* nums, int numsSize, int target, int* returnSize) {

    }
  CPP: |
    class Solution {
    public:
        vector<int> twoSum(vector<int>& nums, int target) {

        }
    };
  JAVASCRIPT: |
    function twoSum(nums, target) {

    }

testCases:
  - input: |
      [2,7,11,15]
      9
    expected: "[0,1]"
    isHidden: false
    isKiller: false

  - input: |
      [3,2,4]
      6
    expected: "[1,2]"
    isHidden: false
    isKiller: false

  - input: |
      [3,3]
      6
    expected: "[0,1]"
    isHidden: false
    isKiller: false

  - input: |
      [-1,-2,-3,-4,-5]
      -8
    expected: "[2,4]"
    isHidden: true
    isKiller: false

  - input: |
      [1000000000,2,-1000000000,3]
      -999999998
    expected: "[1,2]"
    isHidden: true
    isKiller: true
```

- [ ] **Step 2: 建立 seed/problems/algorithm/valid-parentheses.yaml**

```yaml
title: Valid Parentheses
slug: valid-parentheses
difficulty: EASY
category: ALGORITHM
tags: [stack, string]
concepts:
  - name: Stack
    relevance: 1.0
description: |
  給定一個只包含 `'('`, `')'`, `'{'`, `'}'`, `'['`, `']'` 的字串 `s`，判斷字串是否有效。

  有效字串必須滿足：
  1. 左括號必須用相同類型的右括號閉合。
  2. 左括號必須以正確的順序閉合。
  3. 每個右括號都有一個對應的同類型左括號。

  **範例：**
  ```
  輸入: s = "()[]{}"
  輸出: true
  ```

  **限制：**
  - 1 <= s.length <= 10^4

hints:
  - 當你遇到一個右括號，你需要檢查什麼？
  - 什麼資料結構可以幫你記住「最近的未配對左括號」？
  - 空字串是有效的嗎？字串長度是奇數時呢？

starterCode:
  PYTHON: |
    def is_valid(s: str) -> bool:
        pass
  C: |
    bool isValid(char* s) {

    }
  CPP: |
    class Solution {
    public:
        bool isValid(string s) {

        }
    };
  JAVASCRIPT: |
    function isValid(s) {

    }

testCases:
  - input: "()"
    expected: "true"
    isHidden: false
    isKiller: false
  - input: "()[]{}"
    expected: "true"
    isHidden: false
    isKiller: false
  - input: "(]"
    expected: "false"
    isHidden: false
    isKiller: false
  - input: ""
    expected: "true"
    isHidden: true
    isKiller: true
  - input: "((("
    expected: "false"
    isHidden: true
    isKiller: false
```

- [ ] **Step 3: 建立 seed/problems/algorithm/binary-search.yaml**

```yaml
title: Binary Search
slug: binary-search
difficulty: EASY
category: ALGORITHM
tags: [array, binary-search]
concepts:
  - name: Binary Search
    relevance: 1.0
  - name: Array
    relevance: 0.5
description: |
  給定一個已排序的整數陣列 `nums` 和一個目標值 `target`，如果 `target` 存在於陣列中，返回其索引；否則返回 `-1`。

  你必須使用 O(log n) 的演算法。

  **範例：**
  ```
  輸入: nums = [-1,0,3,5,9,12], target = 9
  輸出: 4
  ```

  **限制：**
  - 1 <= nums.length <= 10^4
  - nums 中的所有元素互不相同
  - nums 按升序排列

hints:
  - 如何利用「已排序」這個條件？
  - 每次比較後，你可以排除多少候選元素？
  - 注意邊界條件：left 和 right 的初始值、更新方式、迴圈終止條件。

starterCode:
  PYTHON: |
    def search(nums: list[int], target: int) -> int:
        pass
  C: |
    int search(int* nums, int numsSize, int target) {

    }
  CPP: |
    class Solution {
    public:
        int search(vector<int>& nums, int target) {

        }
    };
  JAVASCRIPT: |
    function search(nums, target) {

    }

testCases:
  - input: |
      [-1,0,3,5,9,12]
      9
    expected: "4"
    isHidden: false
    isKiller: false
  - input: |
      [-1,0,3,5,9,12]
      2
    expected: "-1"
    isHidden: false
    isKiller: false
  - input: |
      [5]
      5
    expected: "0"
    isHidden: true
    isKiller: true
```

- [ ] **Step 4: 建立 seed/problems/algorithm/sliding-window-maximum.yaml**

```yaml
title: Sliding Window Maximum
slug: sliding-window-maximum
difficulty: HARD
category: ALGORITHM
tags: [array, sliding-window, monotonic-deque]
concepts:
  - name: Sliding Window
    relevance: 1.0
  - name: Monotonic Stack
    relevance: 0.8
  - name: Queue
    relevance: 0.6
description: |
  給定一個整數陣列 `nums` 和一個窗口大小 `k`，窗口從陣列最左邊滑到最右邊。每次只能看到窗口中的 `k` 個數字，返回每個窗口位置的最大值。

  **範例：**
  ```
  輸入: nums = [1,3,-1,-3,5,3,6,7], k = 3
  輸出: [3,3,5,5,6,7]
  ```

  **限制：**
  - 1 <= nums.length <= 10^5
  - -10^4 <= nums[i] <= 10^4
  - 1 <= k <= nums.length

hints:
  - 暴力解的時間複雜度是多少？能否做到 O(n)？
  - 你需要一個資料結構，能夠快速找到最大值，同時能夠移除不在窗口內的元素。
  - 考慮使用「單調遞減佇列」：如果新元素比佇列尾部的元素大，那尾部的元素還有用嗎？

starterCode:
  PYTHON: |
    def max_sliding_window(nums: list[int], k: int) -> list[int]:
        pass
  C: |
    int* maxSlidingWindow(int* nums, int numsSize, int k, int* returnSize) {

    }
  CPP: |
    class Solution {
    public:
        vector<int> maxSlidingWindow(vector<int>& nums, int k) {

        }
    };
  JAVASCRIPT: |
    function maxSlidingWindow(nums, k) {

    }

testCases:
  - input: |
      [1,3,-1,-3,5,3,6,7]
      3
    expected: "[3,3,5,5,6,7]"
    isHidden: false
    isKiller: false
  - input: |
      [1]
      1
    expected: "[1]"
    isHidden: false
    isKiller: false
  - input: |
      [1,-1]
      1
    expected: "[1,-1]"
    isHidden: true
    isKiller: false
  - input: |
      [7,2,4]
      2
    expected: "[7,4]"
    isHidden: true
    isKiller: true
```

- [ ] **Step 5: 建立 seed/problems/algorithm/merge-sorted-array.yaml**

```yaml
title: Merge Sorted Array
slug: merge-sorted-array
difficulty: EASY
category: ALGORITHM
tags: [array, two-pointer, sorting]
concepts:
  - name: Array
    relevance: 0.8
  - name: Two Pointer
    relevance: 1.0
  - name: Sorting
    relevance: 0.5
description: |
  給定兩個已排序的整數陣列 `nums1` 和 `nums2`，將 `nums2` 合併到 `nums1` 中，使合併後的陣列仍然有序。

  `nums1` 的初始長度為 `m + n`，前 `m` 個元素是有效的，後 `n` 個元素為 0（用作佔位）。

  **範例：**
  ```
  輸入: nums1 = [1,2,3,0,0,0], m = 3, nums2 = [2,5,6], n = 3
  輸出: [1,2,2,3,5,6]
  ```

  **限制：**
  - 0 <= m, n <= 200

hints:
  - 如果從前面開始合併，會遇到什麼問題？
  - 從後面開始合併呢？哪個陣列的末尾有空間？
  - 邊界條件：如果 nums2 的所有元素都比 nums1 小怎麼辦？

starterCode:
  PYTHON: |
    def merge(nums1: list[int], m: int, nums2: list[int], n: int) -> None:
        pass
  C: |
    void merge(int* nums1, int nums1Size, int m, int* nums2, int nums2Size, int n) {

    }
  CPP: |
    class Solution {
    public:
        void merge(vector<int>& nums1, int m, vector<int>& nums2, int n) {

        }
    };
  JAVASCRIPT: |
    function merge(nums1, m, nums2, n) {

    }

testCases:
  - input: |
      [1,2,3,0,0,0]
      3
      [2,5,6]
      3
    expected: "[1,2,2,3,5,6]"
    isHidden: false
    isKiller: false
  - input: |
      [1]
      1
      []
      0
    expected: "[1]"
    isHidden: false
    isKiller: false
  - input: |
      [0]
      0
      [1]
      1
    expected: "[1]"
    isHidden: true
    isKiller: true
```

- [ ] **Step 6: 建立 seed/problems/system-design/rate-limiter.yaml**

```yaml
title: Design a Rate Limiter
slug: design-rate-limiter
difficulty: HARD
category: SYSTEM_DESIGN
tags: [system-design, distributed-systems]
concepts:
  - name: Rate Limiting
    relevance: 1.0
  - name: Caching
    relevance: 0.6
  - name: CAP Theorem
    relevance: 0.4
description: |
  設計一個可擴展的速率限制器（Rate Limiter），用於保護 API 服務免受過多請求。

  **需求：**
  - 支援每秒/每分鐘/每小時的請求限制
  - 支援按使用者、IP、或 API Key 限制
  - 在分散式環境下正確運作
  - 延遲應盡可能低

  **討論要點：**
  1. 你會選擇哪種演算法？（令牌桶、漏桶、固定窗口、滑動窗口）
  2. 如何在多台伺服器間同步計數？
  3. 當限制被觸發時，如何通知客戶端？
  4. 如何處理突發流量？

hints:
  - 先釐清需求：這個 Rate Limiter 部署在哪裡？API Gateway 還是每個服務內部？
  - 考慮不同演算法的 trade-offs：精準度 vs 記憶體使用 vs 實作複雜度。
  - 分散式環境的挑戰：Redis 是常見的方案，但它引入了什麼新問題？

starterCode: {}

testCases: []
```

- [ ] **Step 7: 建立 seed/problems/system-programming/lru-cache.yaml**

```yaml
title: LRU Cache
slug: lru-cache
difficulty: MEDIUM
category: SYSTEM_PROGRAMMING
tags: [hash-table, linked-list, design]
concepts:
  - name: Hash Table
    relevance: 0.8
  - name: Linked List
    relevance: 0.8
  - name: Caching
    relevance: 0.6
  - name: Memory Management
    relevance: 0.5
description: |
  實作一個 LRU (Least Recently Used) 快取機制。

  支援以下操作：
  - `get(key)`: 如果 key 存在，返回其值並將其標記為最近使用；否則返回 -1。
  - `put(key, value)`: 如果 key 已存在，更新其值；否則插入新的 key-value。當快取達到容量上限時，移除最近最少使用的項目。

  `get` 和 `put` 都必須在 O(1) 時間完成。

  **範例：**
  ```
  LRUCache cache = new LRUCache(2);  // 容量為 2
  cache.put(1, 1);
  cache.put(2, 2);
  cache.get(1);       // 返回 1
  cache.put(3, 3);    // 移除 key 2
  cache.get(2);       // 返回 -1（已被移除）
  ```

  **限制：**
  - 1 <= capacity <= 3000
  - 0 <= key <= 10^4
  - 0 <= value <= 10^5

hints:
  - 什麼資料結構支援 O(1) 的查詢？什麼資料結構支援 O(1) 的插入和刪除？
  - 你需要結合兩種資料結構：一個用於快速查詢，一個用於維護存取順序。
  - 在 C 語言中，你需要自己管理記憶體。注意 malloc/free 的配對。

starterCode:
  PYTHON: |
    class LRUCache:
        def __init__(self, capacity: int):
            pass

        def get(self, key: int) -> int:
            pass

        def put(self, key: int, value: int) -> None:
            pass
  C: |
    typedef struct {

    } LRUCache;

    LRUCache* lRUCacheCreate(int capacity) {

    }

    int lRUCacheGet(LRUCache* obj, int key) {

    }

    void lRUCachePut(LRUCache* obj, int key, int value) {

    }

    void lRUCacheFree(LRUCache* obj) {

    }
  CPP: |
    class LRUCache {
    public:
        LRUCache(int capacity) {

        }

        int get(int key) {

        }

        void put(int key, int value) {

        }
    };
  JAVASCRIPT: |
    class LRUCache {
        constructor(capacity) {

        }

        get(key) {

        }

        put(key, value) {

        }
    }

testCases:
  - input: |
      ["LRUCache","put","put","get","put","get","put","get","get","get"]
      [[2],[1,1],[2,2],[1],[3,3],[2],[4,4],[1],[3],[4]]
    expected: "[null,null,null,1,null,-1,null,-1,3,4]"
    isHidden: false
    isKiller: false
  - input: |
      ["LRUCache","put","get"]
      [[1],[2,1],[2]]
    expected: "[null,null,1]"
    isHidden: false
    isKiller: false
  - input: |
      ["LRUCache","put","put","put","put","get","get"]
      [[2],[2,1],[1,1],[2,3],[4,1],[1],[2]]
    expected: "[null,null,null,null,null,-1,3]"
    isHidden: true
    isKiller: true
```

- [ ] **Step 8: 提交**

```bash
git add seed/problems/
git commit -m "feat: 新增 7 道基礎題目種子資料 — 演算法、系統設計、系統程式設計"
```

---

### Task 3：Prisma Seed 腳本

**Files:**
- Create: `apps/web/prisma/seed.ts`
- Modify: `apps/web/package.json` (新增 prisma seed 設定)

- [ ] **Step 1: 安裝 js-yaml**

```bash
cd apps/web && npm install js-yaml && npm install -D @types/js-yaml
```

- [ ] **Step 2: 建立 apps/web/prisma/seed.ts**

```typescript
import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";
import * as yaml from "js-yaml";

const prisma = new PrismaClient();

interface ConceptSeed {
  name: string;
  domain: string;
  description: string;
}

interface EdgeSeed {
  parent: string;
  child: string;
  relation: string;
}

interface ConceptsFile {
  concepts: ConceptSeed[];
  edges: EdgeSeed[];
}

interface ProblemSeed {
  title: string;
  slug: string;
  difficulty: string;
  category: string;
  tags: string[];
  concepts: { name: string; relevance: number }[];
  description: string;
  hints: string[];
  starterCode: Record<string, string>;
  testCases: {
    input: string;
    expected: string;
    isHidden: boolean;
    isKiller: boolean;
  }[];
}

async function seedConcepts() {
  const filePath = path.resolve(__dirname, "../../../seed/knowledge-graph/concepts.yaml");
  const raw = fs.readFileSync(filePath, "utf-8");
  const data = yaml.load(raw) as ConceptsFile;

  console.log(`匯入 ${data.concepts.length} 個概念...`);

  for (const concept of data.concepts) {
    await prisma.concept.upsert({
      where: { name: concept.name },
      update: { domain: concept.domain as any, description: concept.description },
      create: { name: concept.name, domain: concept.domain as any, description: concept.description },
    });
  }

  console.log(`匯入 ${data.edges.length} 條邊...`);

  for (const edge of data.edges) {
    const parent = await prisma.concept.findUnique({ where: { name: edge.parent } });
    const child = await prisma.concept.findUnique({ where: { name: edge.child } });

    if (!parent || !child) {
      console.warn(`跳過邊 ${edge.parent} -> ${edge.child}：找不到概念`);
      continue;
    }

    await prisma.conceptEdge.upsert({
      where: { parentId_childId: { parentId: parent.id, childId: child.id } },
      update: { relation: edge.relation },
      create: { parentId: parent.id, childId: child.id, relation: edge.relation },
    });
  }
}

async function seedProblems() {
  const baseDir = path.resolve(__dirname, "../../../seed/problems");
  const categories = fs.readdirSync(baseDir);

  for (const category of categories) {
    const categoryPath = path.join(baseDir, category);
    if (!fs.statSync(categoryPath).isDirectory()) continue;

    const files = fs.readdirSync(categoryPath).filter((f) => f.endsWith(".yaml"));

    for (const file of files) {
      const filePath = path.join(categoryPath, file);
      const raw = fs.readFileSync(filePath, "utf-8");
      const data = yaml.load(raw) as ProblemSeed;

      console.log(`匯入題目: ${data.title}`);

      const problem = await prisma.problem.upsert({
        where: { slug: data.slug },
        update: {
          title: data.title,
          description: data.description,
          difficulty: data.difficulty as any,
          category: data.category as any,
          starterCode: data.starterCode || {},
          hints: data.hints || [],
        },
        create: {
          title: data.title,
          slug: data.slug,
          description: data.description,
          difficulty: data.difficulty as any,
          category: data.category as any,
          starterCode: data.starterCode || {},
          hints: data.hints || [],
        },
      });

      // Tags
      if (data.tags) {
        for (const tag of data.tags) {
          await prisma.problemTag.upsert({
            where: { problemId_tag: { problemId: problem.id, tag } },
            update: {},
            create: { problemId: problem.id, tag },
          });
        }
      }

      // Test cases
      if (data.testCases && data.testCases.length > 0) {
        await prisma.testCase.deleteMany({ where: { problemId: problem.id } });
        for (const tc of data.testCases) {
          await prisma.testCase.create({
            data: {
              problemId: problem.id,
              input: tc.input,
              expected: tc.expected,
              isHidden: tc.isHidden,
              isKiller: tc.isKiller,
            },
          });
        }
      }

      // Concept links
      if (data.concepts) {
        for (const conceptRef of data.concepts) {
          const concept = await prisma.concept.findUnique({ where: { name: conceptRef.name } });
          if (!concept) {
            console.warn(`跳過概念連結 ${conceptRef.name}：找不到概念`);
            continue;
          }
          await prisma.problemConcept.upsert({
            where: { problemId_conceptId: { problemId: problem.id, conceptId: concept.id } },
            update: { relevance: conceptRef.relevance },
            create: { problemId: problem.id, conceptId: concept.id, relevance: conceptRef.relevance },
          });
        }
      }
    }
  }
}

async function main() {
  console.log("開始匯入種子資料...\n");

  await seedConcepts();
  console.log("");
  await seedProblems();

  console.log("\n種子資料匯入完成！");
}

main()
  .catch((e) => {
    console.error("種子資料匯入失敗:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

- [ ] **Step 3: 更新 apps/web/package.json 新增 prisma seed 設定**

在 `apps/web/package.json` 最外層新增：

```json
"prisma": {
  "seed": "npx tsx prisma/seed.ts"
}
```

- [ ] **Step 4: 提交**

```bash
git add apps/web/prisma/seed.ts apps/web/package.json
git commit -m "feat: 建立 Prisma seed 腳本 — 匯入知識圖譜與題庫"
```

---

### Task 4：題目 Service 層

**Files:**
- Create: `apps/web/src/server/services/problem.ts`

- [ ] **Step 1: 建立 apps/web/src/server/services/problem.ts**

```typescript
import type { PrismaClient, Difficulty, Category } from "@prisma/client";

export interface ProblemFilters {
  difficulty?: Difficulty;
  category?: Category;
  tag?: string;
  search?: string;
}

export interface ProblemListItem {
  id: string;
  title: string;
  slug: string;
  difficulty: Difficulty;
  category: Category;
  tags: { tag: string }[];
}

export class ProblemService {
  constructor(private prisma: PrismaClient) {}

  async list(filters: ProblemFilters = {}): Promise<ProblemListItem[]> {
    const where: any = {};

    if (filters.difficulty) {
      where.difficulty = filters.difficulty;
    }
    if (filters.category) {
      where.category = filters.category;
    }
    if (filters.tag) {
      where.tags = { some: { tag: filters.tag } };
    }
    if (filters.search) {
      where.title = { contains: filters.search, mode: "insensitive" };
    }

    return this.prisma.problem.findMany({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        difficulty: true,
        category: true,
        tags: { select: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getBySlug(slug: string) {
    return this.prisma.problem.findUnique({
      where: { slug },
      include: {
        tags: { select: { tag: true } },
        testCases: {
          where: { isHidden: false },
          select: {
            id: true,
            input: true,
            expected: true,
            isKiller: true,
          },
        },
        concepts: {
          include: {
            concept: { select: { id: true, name: true, domain: true } },
          },
        },
      },
    });
  }

  async getAllTestCases(problemId: string) {
    return this.prisma.testCase.findMany({
      where: { problemId },
      select: {
        id: true,
        input: true,
        expected: true,
        isHidden: true,
        isKiller: true,
      },
    });
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/server/services/problem.ts
git commit -m "feat: 建立 ProblemService — 題目列表、詳情、測資查詢"
```

---

### Task 5：知識圖譜 Service 層

**Files:**
- Create: `apps/web/src/server/services/knowledge-graph.ts`

- [ ] **Step 1: 建立 apps/web/src/server/services/knowledge-graph.ts**

```typescript
import type { PrismaClient } from "@prisma/client";

export interface ConceptNode {
  id: string;
  name: string;
  domain: string;
  mastery: number;       // 0-1, 從 UserProgress 取得
  problemCount: number;  // 關聯的題目數量
}

export interface ConceptGraphData {
  nodes: ConceptNode[];
  edges: { parentId: string; childId: string; relation: string }[];
}

export class KnowledgeGraphService {
  constructor(private prisma: PrismaClient) {}

  async getFullGraph(userId?: string): Promise<ConceptGraphData> {
    const concepts = await this.prisma.concept.findMany({
      include: {
        problems: { select: { problemId: true } },
        userProgress: userId
          ? { where: { userId }, select: { mastery: true } }
          : false,
      },
    });

    const edges = await this.prisma.conceptEdge.findMany({
      select: { parentId: true, childId: true, relation: true },
    });

    const nodes: ConceptNode[] = concepts.map((c) => ({
      id: c.id,
      name: c.name,
      domain: c.domain,
      mastery: userId && c.userProgress?.length > 0
        ? c.userProgress[0].mastery
        : 0,
      problemCount: c.problems.length,
    }));

    return { nodes, edges };
  }

  async getPrerequisites(conceptId: string): Promise<ConceptNode[]> {
    const edges = await this.prisma.conceptEdge.findMany({
      where: { childId: conceptId, relation: "prerequisite" },
      include: {
        parent: {
          include: { problems: { select: { problemId: true } } },
        },
      },
    });

    return edges.map((e) => ({
      id: e.parent.id,
      name: e.parent.name,
      domain: e.parent.domain,
      mastery: 0,
      problemCount: e.parent.problems.length,
    }));
  }

  async getRelatedConcepts(conceptId: string): Promise<ConceptNode[]> {
    const edges = await this.prisma.conceptEdge.findMany({
      where: {
        OR: [
          { parentId: conceptId, relation: "related" },
          { childId: conceptId, relation: "related" },
        ],
      },
      include: {
        parent: { include: { problems: { select: { problemId: true } } } },
        child: { include: { problems: { select: { problemId: true } } } },
      },
    });

    const concepts: ConceptNode[] = [];
    const seen = new Set<string>();

    for (const edge of edges) {
      const target = edge.parentId === conceptId ? edge.child : edge.parent;
      if (!seen.has(target.id)) {
        seen.add(target.id);
        concepts.push({
          id: target.id,
          name: target.name,
          domain: target.domain,
          mastery: 0,
          problemCount: target.problems.length,
        });
      }
    }

    return concepts;
  }

  async generateMermaidGraph(userId?: string): Promise<string> {
    const { nodes, edges } = await this.getFullGraph(userId);

    const lines: string[] = ["graph TD"];

    for (const node of nodes) {
      const cls = node.mastery >= 0.8
        ? "mastered"
        : node.mastery >= 0.4
        ? "learning"
        : node.mastery > 0
        ? "weak"
        : "unexplored";
      const safeName = node.name.replace(/ /g, "_");
      lines.push(`    ${safeName}[${node.name}]:::${cls}`);
    }

    for (const edge of edges) {
      const parent = nodes.find((n) => n.id === edge.parentId);
      const child = nodes.find((n) => n.id === edge.childId);
      if (parent && child) {
        const pName = parent.name.replace(/ /g, "_");
        const cName = child.name.replace(/ /g, "_");
        const arrow = edge.relation === "prerequisite" ? "-->" : "-..->";
        lines.push(`    ${pName} ${arrow} ${cName}`);
      }
    }

    lines.push("");
    lines.push("    classDef mastered fill:#22c55e,color:#fff");
    lines.push("    classDef learning fill:#f59e0b,color:#fff");
    lines.push("    classDef unexplored fill:#6b7280,color:#fff");
    lines.push("    classDef weak fill:#ef4444,color:#fff");

    return lines.join("\n");
  }
}
```

- [ ] **Step 2: 提交**

```bash
git add apps/web/src/server/services/knowledge-graph.ts
git commit -m "feat: 建立 KnowledgeGraphService — 圖譜查詢、前置概念、Mermaid 生成"
```

---

### Task 6：tRPC Routers — 題目與知識圖譜

**Files:**
- Create: `apps/web/src/server/routers/problem.ts`
- Create: `apps/web/src/server/routers/concept.ts`
- Modify: `apps/web/src/server/router.ts`

- [ ] **Step 1: 建立 apps/web/src/server/routers/problem.ts**

```typescript
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import { ProblemService } from "../services/problem";

export const problemRouter = router({
  list: publicProcedure
    .input(
      z.object({
        difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]).optional(),
        category: z.enum(["ALGORITHM", "DATA_STRUCTURE", "SYSTEM_DESIGN", "SYSTEM_PROGRAMMING", "CONCURRENCY"]).optional(),
        tag: z.string().optional(),
        search: z.string().optional(),
      }).optional()
    )
    .query(async ({ ctx, input }) => {
      const service = new ProblemService(ctx.prisma);
      return service.list(input ?? {});
    }),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new ProblemService(ctx.prisma);
      return service.getBySlug(input.slug);
    }),

  getTestCases: protectedProcedure
    .input(z.object({ problemId: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new ProblemService(ctx.prisma);
      return service.getAllTestCases(input.problemId);
    }),
});
```

- [ ] **Step 2: 建立 apps/web/src/server/routers/concept.ts**

```typescript
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../trpc";
import { KnowledgeGraphService } from "../services/knowledge-graph";

export const conceptRouter = router({
  graph: publicProcedure
    .input(z.object({ userId: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      const userId = input?.userId ?? ctx.session?.user?.id;
      return service.getFullGraph(userId);
    }),

  prerequisites: publicProcedure
    .input(z.object({ conceptId: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      return service.getPrerequisites(input.conceptId);
    }),

  related: publicProcedure
    .input(z.object({ conceptId: z.string() }))
    .query(async ({ ctx, input }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      return service.getRelatedConcepts(input.conceptId);
    }),

  mermaid: protectedProcedure
    .query(async ({ ctx }) => {
      const service = new KnowledgeGraphService(ctx.prisma);
      return service.generateMermaidGraph(ctx.user.id);
    }),
});
```

- [ ] **Step 3: 更新 apps/web/src/server/router.ts**

將 `router.ts` 改為：

```typescript
import { router } from "./trpc";
import { userRouter } from "./routers/user";
import { problemRouter } from "./routers/problem";
import { conceptRouter } from "./routers/concept";

export const appRouter = router({
  user: userRouter,
  problem: problemRouter,
  concept: conceptRouter,
});

export type AppRouter = typeof appRouter;
```

- [ ] **Step 4: 提交**

```bash
git add apps/web/src/server/routers/problem.ts apps/web/src/server/routers/concept.ts apps/web/src/server/router.ts
git commit -m "feat: 新增題目與知識圖譜 tRPC routers"
```

---

### Task 7：執行 Seed 並驗證

- [ ] **Step 1: 執行 seed 腳本**

```bash
cd apps/web && DATABASE_URL="postgresql://skill:skill_password@localhost:5433/skill_platform?schema=public" npx prisma db seed
```

預期輸出：匯入 26 個概念、20 條邊、7 道題目。

- [ ] **Step 2: 用 Prisma Studio 驗證**

```bash
cd apps/web && DATABASE_URL="postgresql://skill:skill_password@localhost:5433/skill_platform?schema=public" npx prisma studio
```

開啟瀏覽器確認資料已匯入。

- [ ] **Step 3: 提交任何變更**

```bash
git add -A && git commit -m "chore: seed 腳本驗證通過" || echo "nothing to commit"
```

---

### Task 8：單元測試 — ProblemService 與 KnowledgeGraphService

**Files:**
- Create: `apps/web/__tests__/server/services/knowledge-graph.test.ts`
- Create: `apps/web/__tests__/server/routers/problem.test.ts`

- [ ] **Step 1: 建立題目 router 測試**

Create: `apps/web/__tests__/server/routers/problem.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";
import { appRouter } from "@/server/router";
import { createCallerFactory } from "@/server/trpc";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    problem: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    testCase: {
      findMany: vi.fn(),
    },
    user: { findUnique: vi.fn() },
  },
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(),
  handlers: {},
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock("@/lib/redis", () => ({ redis: {} }));

import { prisma } from "@/lib/prisma";

const createCaller = createCallerFactory(appRouter);

describe("problem.list", () => {
  it("應回傳題目列表", async () => {
    const mockProblems = [
      {
        id: "p1",
        title: "Two Sum",
        slug: "two-sum",
        difficulty: "EASY",
        category: "ALGORITHM",
        tags: [{ tag: "array" }],
      },
    ];

    vi.mocked(prisma.problem.findMany).mockResolvedValue(mockProblems as any);

    const caller = createCaller({
      session: null,
      prisma,
      redis: {} as any,
    });

    const result = await caller.problem.list();
    expect(result).toEqual(mockProblems);
  });

  it("應支援難度篩選", async () => {
    vi.mocked(prisma.problem.findMany).mockResolvedValue([]);

    const caller = createCaller({
      session: null,
      prisma,
      redis: {} as any,
    });

    await caller.problem.list({ difficulty: "HARD" });

    expect(prisma.problem.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ difficulty: "HARD" }),
      })
    );
  });
});

describe("problem.getBySlug", () => {
  it("應回傳題目詳情（含可見測資）", async () => {
    const mockProblem = {
      id: "p1",
      title: "Two Sum",
      slug: "two-sum",
      description: "...",
      testCases: [{ id: "tc1", input: "[2,7]", expected: "[0,1]", isKiller: false }],
      tags: [{ tag: "array" }],
      concepts: [],
    };

    vi.mocked(prisma.problem.findUnique).mockResolvedValue(mockProblem as any);

    const caller = createCaller({
      session: null,
      prisma,
      redis: {} as any,
    });

    const result = await caller.problem.getBySlug({ slug: "two-sum" });
    expect(result?.title).toBe("Two Sum");
  });
});
```

- [ ] **Step 2: 建立知識圖譜 service 測試**

Create: `apps/web/__tests__/server/services/knowledge-graph.test.ts`

```typescript
import { describe, it, expect, vi } from "vitest";
import { KnowledgeGraphService } from "@/server/services/knowledge-graph";

function createMockPrisma() {
  return {
    concept: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
    },
    conceptEdge: {
      findMany: vi.fn(),
    },
  } as any;
}

describe("KnowledgeGraphService", () => {
  describe("getFullGraph", () => {
    it("應回傳所有概念節點與邊", async () => {
      const mockPrisma = createMockPrisma();

      mockPrisma.concept.findMany.mockResolvedValue([
        {
          id: "c1",
          name: "Array",
          domain: "ALGORITHM",
          problems: [{ problemId: "p1" }, { problemId: "p2" }],
        },
        {
          id: "c2",
          name: "Hash Table",
          domain: "DATA_STRUCTURE",
          problems: [{ problemId: "p1" }],
        },
      ]);

      mockPrisma.conceptEdge.findMany.mockResolvedValue([
        { parentId: "c1", childId: "c2", relation: "prerequisite" },
      ]);

      const service = new KnowledgeGraphService(mockPrisma);
      const graph = await service.getFullGraph();

      expect(graph.nodes).toHaveLength(2);
      expect(graph.nodes[0].name).toBe("Array");
      expect(graph.nodes[0].problemCount).toBe(2);
      expect(graph.edges).toHaveLength(1);
    });
  });

  describe("generateMermaidGraph", () => {
    it("應產生有效的 Mermaid 語法", async () => {
      const mockPrisma = createMockPrisma();

      mockPrisma.concept.findMany.mockResolvedValue([
        { id: "c1", name: "Array", domain: "ALGORITHM", problems: [] },
        { id: "c2", name: "Two Pointer", domain: "ALGORITHM", problems: [] },
      ]);

      mockPrisma.conceptEdge.findMany.mockResolvedValue([
        { parentId: "c1", childId: "c2", relation: "prerequisite" },
      ]);

      const service = new KnowledgeGraphService(mockPrisma);
      const mermaid = await service.generateMermaidGraph();

      expect(mermaid).toContain("graph TD");
      expect(mermaid).toContain("Array[Array]");
      expect(mermaid).toContain("Two_Pointer[Two Pointer]");
      expect(mermaid).toContain("Array --> Two_Pointer");
      expect(mermaid).toContain("classDef mastered");
    });
  });
});
```

- [ ] **Step 3: 執行測試**

```bash
cd apps/web && npx vitest run
```

預期：所有測試通過。

- [ ] **Step 4: 提交**

```bash
git add apps/web/__tests__/
git commit -m "test: 新增題目 router 與知識圖譜 service 單元測試"
```
