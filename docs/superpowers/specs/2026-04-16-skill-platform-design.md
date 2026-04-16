# SKILL 平台 — AI 驅動的程式解題與系統設計導師

> **SKILL = Systematic Knowledge & Integrated Logic Learning**

## 概覽

一個全端平台，結合 AI 導師 (Claude) 與線上評測系統 (Online Judge)，幫助使用者練習演算法解題與系統程式設計。與傳統 OJ 不同，AI 導師遵循 SKILL 框架，透過蘇格拉底式對話引導使用者思考，而非直接餵答案。

## 決策摘要

| 項目 | 決定 |
|------|------|
| 範疇 | 完整平台（所有子系統） |
| 目標使用者 | 全程度，自適應難度 |
| 支援語言 | Python, C, C++, JavaScript |
| 部署方式 | Docker Compose（本地開發優先） |
| 題庫來源 | 混合模式：基礎題庫 + AI 動態生成 |
| UI 風格 | 互動對話風（AI 導師對話為核心體驗） |
| 系統設計題 | AI 生成架構圖（Mermaid/D2）+ 使用者手繪（Excalidraw） |
| 帳號系統 | 輕量 OAuth（Google/GitHub 登入） |
| 學習追蹤 | 自適應學習路徑引擎 + 知識圖譜 |
| 架構方案 | Monolith-First（Next.js 全棧 + 獨立沙盒執行引擎） |

---

## 第一章：整體架構與技術棧

### 架構概覽

```
┌─────────────────────────────────────────────────────┐
│                    Docker Compose                    │
│                                                      │
│  ┌───────────────────────────────────────────────┐   │
│  │         Next.js 15 全棧應用                    │   │
│  │                                                │   │
│  │  ┌──────────┐  ┌───────────┐  ┌────────────┐  │   │
│  │  │ React UI │  │ API 層    │  │ AI 模組    │  │   │
│  │  │ (對話式)  │  │ (tRPC)    │  │ (Claude)   │  │   │
│  │  └──────────┘  └─────┬─────┘  └──────┬─────┘  │   │
│  │                      │               │         │   │
│  │              ┌───────▼───────────────▼──────┐  │   │
│  │              │        服務層                  │  │   │
│  │              │  ├── ProblemService           │  │   │
│  │              │  ├── SKILLOrchestrator        │  │   │
│  │              │  ├── KnowledgeGraphEngine     │  │   │
│  │              │  ├── AdaptiveLearningEngine   │  │   │
│  │              │  └── ExecutionClient          │  │   │
│  │              └───────┬──────────────────────┘  │   │
│  │                      │                         │   │
│  │              ┌───────▼──────┐                  │   │
│  │              │ PostgreSQL   │                  │   │
│  │              │ + Prisma ORM │                  │   │
│  │              └──────────────┘                  │   │
│  └───────────────────────────────────────────────┘   │
│                         │                             │
│                    HTTP (REST)                        │
│                         │                             │
│  ┌──────────────────────▼────────────────────────┐   │
│  │            沙盒執行引擎                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐         │   │
│  │  │ Python  │ │  C/C++  │ │   JS    │         │   │
│  │  │ Runner  │ │ Runner  │ │ Runner  │         │   │
│  │  └─────────┘ └─────────┘ └─────────┘         │   │
│  │  （每次執行在獨立容器，有資源限制）              │   │
│  └───────────────────────────────────────────────┘   │
│                                                      │
│  ┌──────────────┐                                    │
│  │    Redis     │ （Session、執行佇列、快取）         │
│  └──────────────┘                                    │
└──────────────────────────────────────────────────────┘
```

### 技術棧

| 層級 | 技術 | 理由 |
|------|------|------|
| 前端 | Next.js 15 + React 19 + Tailwind CSS | App Router、Server Components、串流回應 |
| 對話 UI | 自建對話元件 + react-markdown | 支援 Mermaid 圖表渲染、程式碼高亮 |
| 程式碼編輯器 | Monaco Editor (@monaco-editor/react) | VS Code 同核心、多語言語法高亮 |
| 繪圖 | Excalidraw（嵌入）+ Mermaid（AI 生成） | 使用者手繪 + AI 動態圖表 |
| API 層 | tRPC v11 | 型別安全、與 Next.js 無縫整合 |
| ORM / 資料庫 | Prisma + PostgreSQL | 型別生成、Migration 管理 |
| 快取 / 佇列 | Redis + BullMQ | Session 管理、執行任務佇列 |
| 認證 | NextAuth.js v5 | 內建 Google/GitHub OAuth provider |
| AI | Anthropic SDK (Claude Sonnet/Opus) | SKILL 框架核心推論引擎 |
| 沙盒執行 | Dockerode + 預建語言映像 | 程式碼在隔離容器中執行、有資源限制 |
| 測試 | Vitest + Playwright | 單元測試 + E2E 測試 |

### 專案目錄結構

```
ai-pair-programmer/
├── docker-compose.yml
├── apps/
│   └── web/                    # Next.js 主應用
│       ├── src/
│       │   ├── app/            # App Router 頁面
│       │   ├── components/     # React 元件
│       │   ├── server/         # tRPC routers + 服務層
│       │   │   ├── routers/
│       │   │   ├── services/
│       │   │   │   ├── skill-orchestrator.ts
│       │   │   │   ├── knowledge-graph.ts
│       │   │   │   ├── adaptive-learning.ts
│       │   │   │   ├── problem.ts
│       │   │   │   └── execution-client.ts
│       │   │   └── trpc.ts
│       │   ├── lib/            # 共用工具
│       │   └── types/          # TypeScript 型別
│       └── prisma/
│           └── schema.prisma
├── services/
│   └── executor/               # 沙盒執行引擎
│       ├── Dockerfile
│       ├── src/
│       │   ├── server.ts       # HTTP API
│       │   ├── runners/        # 各語言執行器
│       │   └── sandbox.ts      # 容器管理
│       └── images/             # 預建語言 Docker 映像
│           ├── python/
│           ├── c-cpp/
│           └── javascript/
├── packages/
│   └── shared/                 # 共享型別與常數
└── seed/
    └── problems/               # 基礎題庫 JSON/YAML
```

---

## 第二章：資料模型與知識圖譜

### 核心資料模型（Prisma Schema）

```prisma
// ===== 使用者 =====
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  name          String?
  image         String?
  provider      String    // "google" | "github"
  level         Level     @default(BEGINNER)
  xp            Int       @default(0)
  createdAt     DateTime  @default(now())

  sessions      Session[]     // 由 NextAuth.js Prisma adapter 自動管理
  submissions   Submission[]
  conversations Conversation[]
  progress      UserProgress[]
  weaknesses    UserWeakness[]
}

// NextAuth.js 管理的 Session 與 Account model 由 next-auth Prisma adapter 自動生成，此處不列出。

enum Level {
  BEGINNER      // 初學者
  INTERMEDIATE  // 中級
  ADVANCED      // 高級
  EXPERT        // 專家
}

// ===== 題目 =====
model Problem {
  id            String        @id @default(cuid())
  title         String
  slug          String        @unique
  description   String        @db.Text
  difficulty    Difficulty
  category      Category
  tags          ProblemTag[]

  starterCode   Json          // { python: "...", c: "...", cpp: "...", js: "..." }
  testCases     TestCase[]
  hints         String[]      // SKILL 規則 1.2：階段式提示

  concepts      ProblemConcept[]
  prerequisites ProblemPrereq[]

  isGenerated   Boolean       @default(false)  // 是否為 AI 動態生成

  submissions   Submission[]
  createdAt     DateTime      @default(now())
}

model ProblemTag {
  id        String  @id @default(cuid())
  problemId String
  problem   Problem @relation(fields: [problemId], references: [id])
  tag       String  // 例如 "array", "hash-table", "dynamic-programming"

  @@unique([problemId, tag])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
  EXPERT
}

enum Category {
  ALGORITHM           // 演算法
  DATA_STRUCTURE      // 資料結構
  SYSTEM_DESIGN       // 系統設計
  SYSTEM_PROGRAMMING  // 系統程式設計
  CONCURRENCY         // 併發
}

model TestCase {
  id        String   @id @default(cuid())
  problemId String
  problem   Problem  @relation(fields: [problemId], references: [id])
  input     String   @db.Text
  expected  String   @db.Text
  isHidden  Boolean  @default(false)   // 隱藏測資
  isKiller  Boolean  @default(false)   // SKILL 規則 4.1：殺手級測資
}

// ===== 知識圖譜 =====
model Concept {
  id          String   @id @default(cuid())
  name        String   @unique   // 例如 "Sliding Window", "CAP Theorem"
  domain      Domain
  description String   @db.Text

  problems     ProblemConcept[]
  parents      ConceptEdge[]     @relation("child")
  children     ConceptEdge[]     @relation("parent")
  userProgress UserProgress[]
}

enum Domain {
  ALGORITHM           // 演算法
  DATA_STRUCTURE      // 資料結構
  SYSTEM_DESIGN       // 系統設計
  OS_KERNEL           // 作業系統核心
  CONCURRENCY         // 併發
  NETWORKING          // 網路
  MEMORY_MANAGEMENT   // 記憶體管理
}

model ConceptEdge {
  id        String  @id @default(cuid())
  parentId  String
  childId   String
  parent    Concept @relation("parent", fields: [parentId], references: [id])
  child     Concept @relation("child", fields: [childId], references: [id])
  relation  String  // "prerequisite" | "related" | "variant"

  @@unique([parentId, childId])
}

model ProblemConcept {
  problemId String
  conceptId String
  problem   Problem @relation(fields: [problemId], references: [id])
  concept   Concept @relation(fields: [conceptId], references: [id])
  relevance Float   // 0-1，這題與該概念的相關程度

  @@id([problemId, conceptId])
}

model ProblemPrereq {
  id              String  @id @default(cuid())
  problemId       String
  problem         Problem @relation(fields: [problemId], references: [id])
  prereqProblemId String  // 建議先做的題目
}

// ===== 使用者進度追蹤 =====
model UserProgress {
  id         String  @id @default(cuid())
  userId     String
  conceptId  String
  user       User    @relation(fields: [userId], references: [id])
  concept    Concept @relation(fields: [conceptId], references: [id])
  mastery    Float   @default(0)  // 0-1，掌握程度
  attempts   Int     @default(0)
  lastPracticed DateTime?

  @@unique([userId, conceptId])
}

model UserWeakness {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id])
  pattern     String   // 例如 "off-by-one", "missing-base-case"
  frequency   Int      @default(1)
  lastSeen    DateTime @default(now())
  resolved    Boolean  @default(false)
}

// ===== 對話與提交 =====
model Conversation {
  id        String    @id @default(cuid())
  userId    String
  user      User      @relation(fields: [userId], references: [id])
  problemId String?
  mode      ConversationMode
  messages  Message[]
  createdAt DateTime  @default(now())
}

enum ConversationMode {
  GUIDED_PRACTICE   // SKILL 引導練習
  SYSTEM_DESIGN     // 系統設計討論
  FREE_DISCUSSION   // 自由提問
  CODE_REVIEW       // 程式碼審查
}

model Message {
  id             String       @id @default(cuid())
  conversationId String
  conversation   Conversation @relation(fields: [conversationId], references: [id])
  role           Role
  content        String       @db.Text
  metadata       Json?        // 存放 Mermaid 圖表、程式碼片段等
  skillPhase     String?      // 當前 SKILL 階段標記
  createdAt      DateTime     @default(now())
}

enum Role {
  USER
  ASSISTANT
  SYSTEM
}

model Submission {
  id          String           @id @default(cuid())
  userId      String
  problemId   String
  user        User             @relation(fields: [userId], references: [id])
  problem     Problem          @relation(fields: [problemId], references: [id])
  language    Language
  code        String           @db.Text
  status      SubmissionStatus
  runtime     Int?             // 毫秒
  memory      Int?             // KB
  results     Json?            // 各測資結果
  aiAnalysis  String?          @db.Text  // SKILL 回饋分析
  createdAt   DateTime         @default(now())
}

enum Language {
  PYTHON
  C
  CPP
  JAVASCRIPT
}

enum SubmissionStatus {
  PENDING        // 等待中
  RUNNING        // 執行中
  ACCEPTED       // 通過
  WRONG_ANSWER   // 答案錯誤
  TIME_LIMIT     // 超時
  MEMORY_LIMIT   // 記憶體超限
  RUNTIME_ERROR  // 執行時錯誤
  COMPILE_ERROR  // 編譯錯誤
}
```

### 知識圖譜結構

概念形成一個有向無環圖（DAG）。每個節點是一個 `Concept`，邊是 `ConceptEdge` 記錄，關係類型包含：`prerequisite`（前置條件）、`related`（相關）、`variant`（變體）。

自適應學習引擎透過使用者的 `UserProgress.mastery` 值來遍歷圖譜，決定推薦路徑。已嘗試的概念若其前置概念 mastery 低於閾值，會被優先推薦複習。

```
演算法
├── 排序（快速排序、合併排序、堆排序）
├── 搜尋（二分搜尋 → 雙指標 → 滑動窗口 → 單調棧）
└── 圖論（BFS、DFS、Dijkstra）

系統程式設計
├── 記憶體管理（LRU Cache、malloc/free）
├── 執行緒同步（Mutex、Semaphore、Lock-free Queue）
└── 行程間通訊（Pipes、共享記憶體、訊息佇列）
```

---

## 第三章：SKILL 框架 — AI 編排器核心邏輯

### SKILL 狀態機

每次練習 session 遵循 SKILL 狀態流。AI 根據使用者在對話中的進展，在各階段之間轉換。

```
S（蘇格拉底式引導）→ K（知識圖譜連結）→ I（疊代優化）→ L1（邏輯驗證）→ L2（長期演化）
                                             ↑ 優化循環 ↓
任何階段都可以回溯到較早的階段。
```

### 各階段定義

#### S — Socratic Inquiry（蘇格拉底式引導）

- **觸發時機**：使用者選擇題目或開始新對話。
- **規則**：
  1. 絕對不提供完整程式碼解決方案。
  2. 每次最多展示 5 行程式碼；優先使用偽代碼。
  3. 當使用者卡住時，先詢問卡在哪裡，不要自行假設。
  4. 使用規模擴展問題：「如果 N 從 100 變成 10^9，會怎樣？」
  5. 系統設計題：必須從需求釐清開始。
- **依程度調整**：
  - 初學者：「你覺得這題需要用到什麼資料結構？」
  - 中級：「你能想到幾種解法？各自的時間複雜度大概是多少？」
  - 高級：「最優解的瓶頸在哪？有沒有可能突破理論下界？」
  - 專家：「這個問題在分散式環境下會有什麼額外的挑戰？」

#### K — Knowledge Mapping（知識圖譜連結）

- **觸發時機**：使用者提出一個解法方向後。
- **動作**：
  1. 從知識圖譜中識別演算法原型（例如 Monotonic Stack、Sliding Window、DP）。
  2. 漸進式揭示 — 引導使用者自己發現模式，而非直接告知。
  3. 系統設計題：強調權衡取捨（CAP 定理、延遲 vs 吞吐量、一致性 vs 可用性）。
  4. 從知識圖譜中連結相關概念。

#### I — Iterative Refinement（疊代優化）

- **三步走策略**：
  1. **暴力解**：引導使用者先寫出正確的暴力解。
  2. **瓶頸分析**：找出效能瓶頸（重複計算、不必要的迭代）。
  3. **最佳化**：引導使用者使用合適的資料結構/演算法進行優化。
- **系統程式設計擴展**：
  - 記憶體分析：「你的程式有沒有 memory leak 的風險？哪些 malloc 沒有對應的 free？」
  - 並發安全：「如果兩個 thread 同時呼叫這個函數，會發生什麼？」
  - 快取感知：「你的資料存取模式對 CPU Cache 友善嗎？有沒有 false sharing？」

#### L1 — Logic Verification（邏輯驗證）

- **觸發時機**：使用者準備提交程式碼前。
- **動作**：
  1. **殺手級測資挑戰**：AI 生成邊界條件測資，使用者必須手動推演結果後才能提交。
  2. **複雜度自我評估**：「你的解法時間複雜度是多少？空間複雜度呢？能證明嗎？」
  3. **並發驗證**（系統程式設計）：競態條件分析、死鎖偵測、鎖定順序檢查。

#### L2 — Long-term Evolution（長期演化）

- **觸發時機**：使用者完成一題後。
- **動作**：
  1. 根據表現更新掌握度分數。
  2. 從提交歷史中偵測弱點模式。
  3. 從知識圖譜中產生自適應推薦。
  4. 產出進度視覺化（帶有顏色編碼掌握度的 Mermaid 圖表）。

### SKILL Prompt 組裝

```typescript
function buildSKILLPrompt(context: {
  user: User,
  problem: Problem,
  phase: SKILLPhase,
  conversationHistory: Message[],
  userProgress: UserProgress[],
  weaknesses: UserWeakness[]
}): string {
  return `
    ## 角色
    你是一位資深的程式設計導師，使用 SKILL 教學框架。

    ## 當前階段：${context.phase}
    ${getPhaseRules(context.phase)}

    ## 學生檔案
    - 程度：${context.user.level}
    - 已知弱點：${context.weaknesses.map(w => w.pattern).join(', ')}
    - 相關概念掌握度：${formatMastery(context.userProgress)}

    ## 題目資訊
    - 標題：${context.problem.title}
    - 分類：${context.problem.category}
    - 相關概念：${context.problem.concepts}

    ## 硬性規則
    1. 絕對不提供完整程式碼
    2. 每次最多 5 行程式碼或偽代碼
    3. 優先用問題引導，而非直接解釋
    4. 根據學生程度調整語言深度
    5. 系統設計題必須強調 trade-offs
    6. 系統程式設計題必須檢查記憶體安全與並發安全
  `;
}
```

---

## 第四章：沙盒執行引擎

### 架構

執行引擎作為 Docker Compose 中的獨立服務運行。透過 HTTP 接收程式碼，將執行任務放入 Redis（BullMQ）佇列，並在隔離容器中執行每次提交。

### 執行流程

1. Next.js API 將任務放入 Redis 佇列（BullMQ）。
2. Worker 從佇列取出任務，使用預建語言映像建立容器。
3. 使用者程式碼與測資以唯讀磁碟掛載到容器中。
4. 容器在資源限制與超時機制下執行。
5. 擷取 stdout、stderr 與 exit code。
6. 將輸出與預期結果逐一比對。
7. 透過 WebSocket/SSE 將結果回傳給客戶端。

### 各語言執行器

| 語言 | 基礎映像 | 編譯指令 | 執行指令 |
|------|----------|----------|----------|
| Python | python:3.12-slim | 不需要 | `python3 /code/solution.py < /input/stdin.txt` |
| C | gcc:13-slim | `gcc -O2 -Wall -pthread -o /tmp/solution /code/solution.c` | `/tmp/solution < /input/stdin.txt` |
| C++ | gcc:13-slim | `g++ -O2 -std=c++20 -Wall -pthread -o /tmp/solution /code/solution.cpp` | `/tmp/solution < /input/stdin.txt` |
| JavaScript | node:20-slim | 不需要 | `node /code/solution.js < /input/stdin.txt` |

### 安全防護

| 威脅 | 防護措施 |
|------|----------|
| 無限迴圈 | 硬性超時（10 秒），超時強制 kill 容器 |
| 記憶體炸彈 | 容器記憶體上限 256MB，超出 OOM kill |
| Fork 炸彈 | `--pids-limit 50` 限制 process 數量 |
| 網路攻擊 | `--network none` 禁用所有網路存取 |
| 檔案系統攻擊 | 根檔案系統唯讀，僅 `/tmp` 可寫且限 50MB |
| 特權升級 | `--security-opt no-new-privileges`，以非 root 使用者執行 |
| 容器逃逸 | 移除所有 capabilities（`--cap-drop ALL`） |

### 結果格式

```typescript
interface ExecutionResult {
  submissionId: string;
  status: SubmissionStatus;
  testResults: {
    testCaseId: string;
    passed: boolean;
    input: string;       // 隱藏測資不顯示
    expected: string;    // 隱藏測資不顯示
    actual: string;
    runtime: number;     // 毫秒
    memory: number;      // KB
  }[];
  totalRuntime: number;
  totalMemory: number;
  compileError?: string; // C/C++ 編譯錯誤訊息
}
```

### 與 SKILL 框架整合

執行結果回傳後，SKILL 編排器會：
- **L1（邏輯驗證）**：如果答案錯誤，引導使用者分析哪組測資失敗、為什麼。
- **I（疊代優化）**：如果超時/超記憶體，引導使用者回到瓶頸分析步驟。
- **L2（長期演化）**：記錄本次提交的表現，更新 mastery 與 weakness。

---

## 第五章：自適應學習路徑引擎

### 推薦決策流程

```
1. 檢查未掌握的前置概念（mastery < 0.4）→ 推薦基礎題
2. 檢查未解決的弱點模式（frequency >= 3）→ 推薦針對性練習
3. 正常推進 → 從知識圖譜中找到前沿概念
   - mastery 0.4~0.8 → 鞏固練習
   - mastery > 0.8 → 進階到新概念
4. 難度校準 → 依使用者等級過濾
   - 初學者 → EASY
   - 中級 → EASY~MEDIUM
   - 高級 → MEDIUM~HARD
   - 專家 → HARD~EXPERT
```

### 掌握度計算公式

```typescript
function calculateMastery(params: {
  submissions: Submission[];   // 該概念相關的所有提交
  hintsUsed: number;           // SKILL 對話中使用的提示次數
  totalHints: number;          // 該題可用提示總數
  averageAttempts: number;     // 平均提交次數才 AC
}): number {
  const { submissions, hintsUsed, totalHints, averageAttempts } = params;

  // 1. 通過率 (0~1)
  const passRate = submissions.filter(s => s.status === 'ACCEPTED').length
                   / Math.max(submissions.length, 1);

  // 2. 獨立性分數 — 用越少提示，分數越高
  const independenceScore = 1 - (hintsUsed / Math.max(totalHints, 1));

  // 3. 效率分數 — 越少次提交就 AC，分數越高
  const efficiencyScore = Math.max(0, 1 - (averageAttempts - 1) * 0.2);

  // 4. 時間衰減 — 最後一次練習越久遠，掌握度緩慢下降
  const lastPractice = getLastPracticeDate(submissions);
  const daysSince = daysBetween(lastPractice, new Date());
  const decayFactor = Math.exp(-0.01 * daysSince);  // 半衰期約 70 天

  // 加權合成
  const rawMastery = (passRate * 0.4)
                   + (independenceScore * 0.3)
                   + (efficiencyScore * 0.3);

  return Math.min(1, rawMastery * decayFactor);
}
```

### 弱點偵測

AI 分析每次提交的錯誤，歸類到已知模式：

| 模式 | 描述 |
|------|------|
| `off-by-one` | 迴圈邊界錯誤，差一問題 |
| `missing-base-case` | 遞迴缺少終止條件 |
| `integer-overflow` | 整數溢位未處理 |
| `null-deref` | 空指標存取 |
| `race-condition` | 多執行緒資料競爭 |
| `memory-leak` | 動態記憶體未釋放 |
| `wrong-ds` | 選擇了不適合的資料結構 |
| `greedy-fallacy` | 誤用貪心法（需要 DP） |
| `tle-nested-loop` | 不必要的巢狀迴圈 |
| `missing-edge-case` | 未處理邊際條件（空輸入、單元素等） |

當某模式的 frequency 達到 3 次以上，會被標記為需要針對性強化。

### 推薦引擎

```typescript
async function getRecommendations(userId: string): Promise<RecommendedProblem[]> {
  const progress = await getUserProgress(userId);
  const weaknesses = await getUnresolvedWeaknesses(userId);
  const graph = await getConceptGraph();
  const user = await getUser(userId);

  const candidates: ScoredProblem[] = [];

  // === 優先級 1：補基礎 ===
  const weakPrereqs = progress.filter(p => p.mastery < 0.4);
  for (const prereq of weakPrereqs) {
    const problems = await getProblemsForConcept(prereq.conceptId);
    problems.forEach(p => candidates.push({
      problem: p,
      score: 100 + (0.4 - prereq.mastery) * 50,  // 越弱分數越高
      reason: `基礎概念「${prereq.concept.name}」需要加強`
    }));
  }

  // === 優先級 2：弱點強化 ===
  for (const weakness of weaknesses) {
    const problems = await getProblemsTargetingWeakness(weakness.pattern);
    problems.forEach(p => candidates.push({
      problem: p,
      score: 80 + weakness.frequency * 5,
      reason: `你經常出現「${weakness.pattern}」錯誤，這題可以幫你克服`
    }));
  }

  // === 優先級 3：正常推進 ===
  const frontier = findFrontierConcepts(graph, progress);
  for (const concept of frontier) {
    const problems = await getProblemsForConcept(concept.id);
    problems.forEach(p => candidates.push({
      problem: p,
      score: 50,
      reason: `下一個建議學習的概念：「${concept.name}」`
    }));
  }

  // === 難度過濾 ===
  const allowedDifficulties = getDifficultyRange(user.level);
  const filtered = candidates.filter(c =>
    allowedDifficulties.includes(c.problem.difficulty)
  );

  // === 去重、排序、取前 5 ===
  return deduplicate(filtered)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(c => ({ problem: c.problem, reason: c.reason }));
}
```

### 等級升級條件

| 升級路徑 | 需掌握概念數（>= 0.7） | 需通過題數 | 需涉及領域 |
|----------|----------------------|-----------|-----------|
| 初學者 → 中級 | 10 | 20 | 演算法、資料結構 |
| 中級 → 高級 | 25 | 60 | + 系統設計 |
| 高級 → 專家 | 45 | 120 | + 併發、作業系統核心 |

### 進度視覺化

完成一題後，AI 生成 Mermaid 知識圖譜，用顏色標示掌握度：
- 綠色：mastery >= 0.8（已掌握）
- 黃色：mastery 0.4~0.8（學習中）
- 灰色：未探索
- 紅色：有弱點模式需強化

---

## 第六章：前端互動體驗與頁面結構

### 頁面路由

```
/                          → 首頁（登入 + 平台介紹）
/dashboard                 → 個人儀表板（進度、推薦、知識圖譜）
/practice                  → 題庫瀏覽（篩選、搜尋）
/practice/[slug]           → 解題頁面（核心體驗）
/system-design             → 系統設計題列表
/system-design/[slug]      → 系統設計互動頁
/profile                   → 個人檔案（統計、弱點分析）
/api/auth/[...nextauth]    → OAuth 回調
/api/trpc/[trpc]           → tRPC API
```

### 核心頁面：解題互動頁 `/practice/[slug]`

核心體驗是以對話為主軸的解題介面。AI 導師的對話流是主要互動方式，程式碼編輯器和執行結果內嵌在聊天中。

**版面**：單欄對話流。

**對話中嵌入的元素**：
1. **AI 訊息**：Markdown 文字帶 SKILL 階段標籤，可包含 Mermaid 圖表。
2. **使用者訊息**：描述解題思路的自由文字。
3. **內嵌程式碼編輯器**：輕量版 Monaco Editor 區塊嵌入對話流。支援語法高亮、自動縮排、括號配對。操作按鈕：執行（跑範例測資）、提交（跑全部測資含隱藏）、展開（全螢幕編輯模式）。
4. **執行結果**：可折疊的結果面板，顯示各測資通過/失敗、執行時間與記憶體。
5. **提示卡片**：SKILL 框架觸發的漸進式提示。
6. **挑戰卡片**：殺手級測資挑戰，使用者必須手動推演結果。

**輸入區**：文字聊天輸入、貼上程式碼按鈕、開啟繪圖板按鈕。

### 訊息內容類型

```typescript
type MessageContent =
  | { type: "text"; text: string }                     // 一般文字（支援 Markdown）
  | { type: "code"; language: Language; code: string }  // 程式碼區塊（可編輯）
  | { type: "mermaid"; diagram: string }                // AI 生成的架構圖
  | { type: "test-result"; result: ExecutionResult }    // 執行結果
  | { type: "hint"; level: number; content: string }    // 分級提示
  | { type: "challenge"; testInput: string }            // 殺手級測資挑戰
```

### 儀表板 `/dashboard`

- 歡迎列：使用者名稱、等級、XP、連續練習天數。
- 今日推薦：分為基礎補強、弱點強化、進階挑戰三類，每項附帶自適應引擎的推薦理由。
- 互動式知識圖譜：Mermaid 渲染的概念地圖，帶顏色編碼的掌握度。
- 統計概覽：已解題數、通過率、本週活動量、各分類進度條。

### 系統設計頁面

- 嵌入 Excalidraw 供使用者手繪架構圖。
- AI 在回應中生成 Mermaid 圖表供對比。
- 權衡分析卡片內嵌在對話中。

### 串流回應

AI 回應透過 Server-Sent Events 串流，使用 Anthropic SDK 的串流 API。SKILL 系統 prompt 根據當前階段、使用者檔案與對話歷史在每次請求時動態組裝。

---

## Docker Compose 服務

```yaml
services:
  web:           # Next.js 15 應用（port 3000）
  executor:      # 沙盒執行引擎（port 4000）
  postgres:      # PostgreSQL 16
  redis:         # Redis 7
```

執行引擎服務需要 Docker socket 存取權限（`/var/run/docker.sock`）以建立隔離容器執行程式碼。語言映像（python:3.12-slim、gcc:13-slim、node:20-slim）在建置時預先拉取。
