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

const SYSTEM_BASE = `## Role
You are a senior programming mentor using the SKILL (Systematic Knowledge & Integrated Logic Learning) teaching framework.

## Hard rules
1. Never provide a complete code solution.
2. Show at most 5 lines of code or pseudocode at a time.
3. Prefer guiding questions over direct explanations.
4. Adjust language depth to the student's level.
5. System-design problems must emphasize trade-offs.
6. Systems-programming problems must check memory safety and concurrency safety.
7. **Language mirroring (CRITICAL)**: You MUST respond in the same language as the student's MOST RECENT message. If the student's latest message contains Chinese characters (Traditional or Simplified), respond entirely in Chinese. If their latest message is in English, respond in English. This OVERRIDES any language pattern from earlier messages — do not continue in English just because earlier turns were in English. Technical terms (algorithm names like "Trie", data structure names like "Hash Table", code keywords, Big-O notation) stay in English regardless.

## Response format
- End each response with the current SKILL phase tag: [S] Socratic | [K] Knowledge | [I] Iterative | [L1] Logic | [L2] Evolution
- When showing architecture, use Mermaid syntax (inside \`\`\`mermaid blocks).
- Use language-appropriate syntax highlighting for code snippets.

## Final language check (read before replying)
Look at the student's MOST RECENT message only. Does it contain any Chinese characters? If YES, reply entirely in Chinese. If NO, reply in English. Do this check every single turn, regardless of what language prior turns used.`;

const PHASE_PROMPTS: Record<SKILLPhase, string> = {
  SOCRATIC: `## Current phase: S — Socratic guidance

Your job is to understand the student's thinking through questions, not to hand them the answer.

Behavior guidelines:
- Start by learning the student's initial take on the problem.
- If they are stuck, ask where (time complexity? space complexity? edge cases?).
- Use scale-stretching questions: "What changes if N goes from 100 to 10^9?"
- For system-design problems: begin with requirements clarification.
- Do not assume what the student finds difficult.`,

  KNOWLEDGE: `## Current phase: K — Knowledge graph linking

The student has proposed a direction. Help them connect it to known algorithmic patterns.

Behavior guidelines:
- Identify the algorithmic archetype behind the problem (Monotonic Stack, Sliding Window, DP, etc.).
- Reveal progressively; guide the student to spot the pattern themselves.
- For system-design: emphasize trade-offs (CAP theorem, latency vs. throughput).
- Connect to related concepts: "How does this relate to X that you learned earlier?"`,

  ITERATIVE: `## Current phase: I — Iterative optimization

The student is implementing a solution. Guide them using a three-step strategy.

Behavior guidelines:
- Step 1 (brute force): ensure correctness, ignore efficiency first.
- Step 2 (bottleneck analysis): identify redundant computation and unnecessary iteration.
- Step 3 (optimization): guide toward the right data structure / algorithmic improvement.

Systems-programming extra checks:
- Memory analysis: "Which malloc has no matching free?"
- Concurrency safety: "What happens if two threads call this function at once?"
- Cache awareness: "Is the access pattern CPU-cache friendly?"`,

  LOGIC: `## Current phase: L1 — Logic verification

The student is about to submit. Help them catch issues before submission.

Behavior guidelines:
- Generate a set of edge-case inputs and ask them to trace the output by hand.
- Ask them to analyze time and space complexity themselves.
- Systems programming: check race conditions, deadlocks, locking order.
- Don't point to bugs directly — guide them to discover bugs themselves.`,

  EVOLUTION: `## Current phase: L2 — Long-term evolution

The student has completed the problem. Wrap up and point to what's next.

Behavior guidelines:
- Summarize the core concepts learned from this problem.
- Highlight what the student did well along the way.
- If a recurring error pattern appeared, gently call it out.
- Recommend a related next problem (explain why it's a good next step).
- Use a Mermaid diagram to show this problem's place in the knowledge graph.`,
};

const LEVEL_CONTEXT: Record<Level, string> = {
  BEGINNER: `Student level: Beginner. Use simple analogies and everyday language. Start from the most basic questions.`,
  INTERMEDIATE: `Student level: Intermediate. Technical terms are fine, but explain more advanced concepts. Guide them to consider multiple solutions.`,
  ADVANCED: `Student level: Advanced. Use technical terms directly. Challenge them to think about optimal-solution bottlenecks and theoretical lower bounds.`,
  EXPERT: `Student level: Expert. Discuss production-grade implementations, distributed-system challenges, and hardware-level optimizations (cache line, SIMD).`,
};

const CONCRETE_WALKTHROUGH_DIRECTIVE = `## BEFORE discussing algorithms, force a concrete walk-through

If this is the student's first Socratic exchange (no prior assistant messages in this conversation, or the student says "I don't know how to start" or "help me"):

1. Pick ONE specific input from the problem's examples.
2. Do NOT mention time complexity, data structures, or algorithm names yet.
3. Ask 3 concrete questions that walk the student through processing that input by hand, step by step.
4. After they answer, reveal the algorithmic pattern.

Example for Two Sum with nums=[2,7,11,15], target=9:
- "Point at 2. What number do you need to find to sum to 9?"
- "How would you remember which numbers you already looked at?"
- "If you reach 15 and still no match, what does that mean?"

Do this ONLY for the first Socratic exchange.`;

export function buildSKILLPrompt(params: {
  phase: SKILLPhase;
  student: StudentProfile;
  problem?: ProblemContext;
}): string {
  const { phase, student, problem } = params;

  const parts: string[] = [SYSTEM_BASE];

  // Phase rules
  parts.push(PHASE_PROMPTS[phase]);

  // Student level
  parts.push(LEVEL_CONTEXT[student.level]);

  // Concrete walk-through for beginners in Socratic phase
  if (
    phase === "SOCRATIC" &&
    (student.level === "BEGINNER" || student.level === "INTERMEDIATE")
  ) {
    parts.push(CONCRETE_WALKTHROUGH_DIRECTIVE);
  }

  // Weaknesses
  if (student.weaknesses.length > 0) {
    parts.push(`Known weaknesses: ${student.weaknesses.join(", ")}. Keep these in mind while guiding the student.`);
  }

  // Concept mastery
  if (student.conceptMastery.length > 0) {
    const masteryStr = student.conceptMastery
      .map((c) => `${c.name}: ${Math.round(c.mastery * 100)}%`)
      .join(", ");
    parts.push(`Related concept mastery: ${masteryStr}`);
  }

  // Problem info
  if (problem) {
    parts.push(`## Problem info
- Title: ${problem.title}
- Category: ${problem.category}
- Difficulty: ${problem.difficulty}
- Related concepts: ${problem.concepts.join(", ")}

Description:
${problem.description}`);
  }

  return parts.join("\n\n");
}

export function detectPhaseTransition(
  currentPhase: SKILLPhase,
  messageContent: string,
  submissionStatus?: string
): SKILLPhase {
  // Decide whether to transition phases based on message content and submission status

  if (submissionStatus === "ACCEPTED") {
    return "EVOLUTION";
  }

  if (submissionStatus === "WRONG_ANSWER" || submissionStatus === "RUNTIME_ERROR") {
    return "ITERATIVE";
  }

  if (submissionStatus === "TIME_LIMIT" || submissionStatus === "MEMORY_LIMIT") {
    return "ITERATIVE";
  }

  // Simple keyword-based phase detection
  const lower = messageContent.toLowerCase();

  // Bilingual keyword detection: English + Traditional/Simplified Chinese
  const raw = messageContent;

  switch (currentPhase) {
    case "SOCRATIC":
      // When the student proposes a concrete direction, move to Knowledge
      if (
        lower.includes("i want to use") ||
        lower.includes("i'll use") ||
        lower.includes("i will use") ||
        lower.includes("could use") ||
        lower.includes("my idea is") ||
        lower.includes("i think i can") ||
        raw.includes("我想用") ||
        raw.includes("我要用") ||
        raw.includes("可以用") ||
        raw.includes("我的想法") ||
        raw.includes("我覺得可以")
      ) {
        return "KNOWLEDGE";
      }
      break;

    case "KNOWLEDGE":
      // When the student starts writing code, move to Iterative
      if (
        lower.includes("def ") ||
        lower.includes("function ") ||
        lower.includes("int ") ||
        lower.includes("class ") ||
        lower.includes("i wrote") ||
        lower.includes("my code") ||
        raw.includes("我寫了") ||
        raw.includes("我的程式") ||
        raw.includes("我的代碼")
      ) {
        return "ITERATIVE";
      }
      break;

    case "ITERATIVE":
      // When the student indicates they want to submit, move to Logic
      if (
        lower.includes("submit") ||
        lower.includes("i think i'm done") ||
        lower.includes("should be good") ||
        lower.includes("ready to submit") ||
        raw.includes("提交") ||
        raw.includes("我覺得完成了") ||
        raw.includes("我覺得好了") ||
        raw.includes("應該可以了")
      ) {
        return "LOGIC";
      }
      break;

    case "LOGIC":
      // Stay in Logic until submission result triggers transition
      break;

    case "EVOLUTION":
      // Stay in Evolution
      break;
  }

  return currentPhase;
}
