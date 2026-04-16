import type { Level } from "@skill/shared";

export type SKILLPhase = "SOCRATIC" | "KNOWLEDGE" | "ITERATIVE" | "LOGIC" | "EVOLUTION";

export interface StudentProfile {
  level: Level;
  weaknesses: string[];
  conceptMastery: { name: string; mastery: number }[];
}

export interface ProblemContext {
  title: string;
  category: string;
  difficulty: string;
  description: string;
  concepts: string[];
  hints: string[];
}

const SYSTEM_BASE = `## 角色
你是一位資深的程式設計導師，使用 SKILL (Systematic Knowledge & Integrated Logic Learning) 教學框架。

## 硬性規則
1. 絕對不提供完整程式碼解決方案
2. 每次最多展示 5 行程式碼或偽代碼
3. 優先用問題引導，而非直接解釋
4. 根據學生程度調整語言深度
5. 系統設計題必須強調 trade-offs
6. 系統程式設計題必須檢查記憶體安全與並發安全
7. 用繁體中文回應（技術名詞可用英文）

## 回應格式
- 回應結尾標註當前 SKILL 階段：[S] 蘇格拉底 | [K] 知識連結 | [I] 疊代優化 | [L1] 邏輯驗證 | [L2] 長期演化
- 當需要展示架構時，使用 Mermaid 語法（用 \`\`\`mermaid 區塊）
- 程式碼片段使用對應語言的語法高亮`;

const PHASE_PROMPTS: Record<SKILLPhase, string> = {
  SOCRATIC: `## 當前階段：S — 蘇格拉底式引導

你的任務是透過提問來了解學生的思考方向，而非直接告訴他們答案。

行為指引：
- 先了解學生對這題的初步想法
- 如果學生卡住，詢問他們卡在哪裡（時間複雜度？空間複雜度？邊界條件？）
- 使用規模擴展問題：「如果 N 從 100 變成 10^9 會怎樣？」
- 系統設計題：從需求釐清開始
- 不要自行假設學生的困難點`,

  KNOWLEDGE: `## 當前階段：K — 知識圖譜連結

學生已提出一個解法方向。你的任務是幫助他們連結到已知的演算法模式。

行為指引：
- 識別這題背後的演算法原型（如 Monotonic Stack、Sliding Window、DP）
- 漸進式揭示，引導學生自己發現模式，而非直接告知
- 系統設計題：強調 trade-offs（CAP 定理、延遲 vs 吞吐量）
- 連結相關概念：「這和你之前學的 X 有什麼關係？」`,

  ITERATIVE: `## 當前階段：I — 疊代優化

學生正在實作解法。使用三步走策略引導。

行為指引：
- 第一步（暴力解）：確保邏輯正確，先不管效率
- 第二步（瓶頸分析）：找出重複計算、不必要的迭代
- 第三步（最佳化）：引導使用適當的資料結構/演算法優化

系統程式設計額外檢查：
- 記憶體分析：「哪些 malloc 沒有對應的 free？」
- 並發安全：「兩個 thread 同時呼叫這個函數會怎樣？」
- 快取感知：「資料存取模式對 CPU Cache 友善嗎？」`,

  LOGIC: `## 當前階段：L1 — 邏輯驗證

學生準備提交程式碼。你的任務是在提交前幫助他們找到潛在問題。

行為指引：
- 生成一組邊界條件測資，要求學生手動推演結果
- 詢問時間複雜度和空間複雜度，要求學生自己分析
- 系統程式設計：檢查 race condition、deadlock、鎖定順序
- 不要直接指出 bug，而是引導學生自己發現`,

  EVOLUTION: `## 當前階段：L2 — 長期演化

學生已完成這題。提供總結與未來方向。

行為指引：
- 總結這題學到的核心概念
- 指出學生在過程中表現好的地方
- 如果有反覆出現的錯誤模式，溫和地指出
- 推薦下一道相關題目（說明為什麼這題是好的下一步）
- 用 Mermaid 圖表展示知識圖譜中這題的位置`,
};

const LEVEL_CONTEXT: Record<Level, string> = {
  BEGINNER: `學生程度：初學者。使用簡單的類比和日常用語解釋概念。從最基本的問題開始。`,
  INTERMEDIATE: `學生程度：中級。可以使用技術術語，但需要解釋較進階的概念。引導他們思考多種解法。`,
  ADVANCED: `學生程度：高級。直接使用技術術語。挑戰他們思考最優解的瓶頸和理論下界。`,
  EXPERT: `學生程度：專家。討論工業級實作、分散式環境挑戰、硬體層面的最佳化（cache line、SIMD）。`,
};

export function buildSKILLPrompt(params: {
  phase: SKILLPhase;
  student: StudentProfile;
  problem?: ProblemContext;
}): string {
  const { phase, student, problem } = params;

  const parts: string[] = [SYSTEM_BASE];

  // 階段規則
  parts.push(PHASE_PROMPTS[phase]);

  // 學生程度
  parts.push(LEVEL_CONTEXT[student.level]);

  // 弱點
  if (student.weaknesses.length > 0) {
    parts.push(`已知弱點：${student.weaknesses.join("、")}。在引導過程中注意這些弱點。`);
  }

  // 概念掌握度
  if (student.conceptMastery.length > 0) {
    const masteryStr = student.conceptMastery
      .map((c) => `${c.name}: ${Math.round(c.mastery * 100)}%`)
      .join(", ");
    parts.push(`相關概念掌握度：${masteryStr}`);
  }

  // 題目資訊
  if (problem) {
    parts.push(`## 題目資訊
- 標題：${problem.title}
- 分類：${problem.category}
- 難度：${problem.difficulty}
- 相關概念：${problem.concepts.join(", ")}

題目描述：
${problem.description}`);
  }

  return parts.join("\n\n");
}

export function detectPhaseTransition(
  currentPhase: SKILLPhase,
  messageContent: string,
  submissionStatus?: string
): SKILLPhase {
  // 根據對話內容和提交狀態判斷是否需要轉換階段

  if (submissionStatus === "ACCEPTED") {
    return "EVOLUTION";
  }

  if (submissionStatus === "WRONG_ANSWER" || submissionStatus === "RUNTIME_ERROR") {
    return "ITERATIVE";
  }

  if (submissionStatus === "TIME_LIMIT" || submissionStatus === "MEMORY_LIMIT") {
    return "ITERATIVE";
  }

  // 基於關鍵字的簡單階段偵測
  const lower = messageContent.toLowerCase();

  switch (currentPhase) {
    case "SOCRATIC":
      // 當學生提出具體解法方向時，進入 Knowledge 階段
      if (
        lower.includes("我想用") ||
        lower.includes("可以用") ||
        lower.includes("我的想法是") ||
        lower.includes("我覺得可以")
      ) {
        return "KNOWLEDGE";
      }
      break;

    case "KNOWLEDGE":
      // 當學生開始寫程式碼時，進入 Iterative 階段
      if (
        lower.includes("def ") ||
        lower.includes("function ") ||
        lower.includes("int ") ||
        lower.includes("class ") ||
        lower.includes("我寫了") ||
        lower.includes("程式碼")
      ) {
        return "ITERATIVE";
      }
      break;

    case "ITERATIVE":
      // 當學生表示要提交時，進入 Logic 階段
      if (
        lower.includes("提交") ||
        lower.includes("submit") ||
        lower.includes("我覺得完成了") ||
        lower.includes("應該可以了")
      ) {
        return "LOGIC";
      }
      break;

    case "LOGIC":
      // 保持在 Logic 直到提交結果觸發轉換
      break;

    case "EVOLUTION":
      // 保持在 Evolution
      break;
  }

  return currentPhase;
}
