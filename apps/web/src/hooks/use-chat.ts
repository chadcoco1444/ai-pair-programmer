"use client";

import { useState, useCallback } from "react";

interface Message {
  id: string;
  role: "USER" | "ASSISTANT";
  content: string;
  skillPhase?: string;
  isStreaming?: boolean;
}

interface UseChatOptions {
  conversationId: string;
}

export function useChat({ conversationId }: UseChatOptions) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<string>("SOCRATIC");

  const sendMessage = useCallback(
    async (content: string, submissionStatus?: string) => {
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "USER",
        content,
      };

      const assistantMessage: Message = {
        id: `assistant-${Date.now()}`,
        role: "ASSISTANT",
        content: "",
        isStreaming: true,
      };

      setMessages((prev) => [...prev, userMessage, assistantMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ conversationId, content, submissionStatus }),
        });

        if (!response.ok) throw new Error("串流連線失敗");

        const reader = response.body?.getReader();
        const decoder = new TextDecoder();

        if (!reader) throw new Error("無法讀取回應串流");

        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            const data = JSON.parse(line.slice(6));

            if (data.type === "phase") {
              setCurrentPhase(data.phase);
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, skillPhase: data.phase }
                    : m
                )
              );
            } else if (data.type === "text") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: m.content + data.text }
                    : m
                )
              );
            } else if (data.type === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, isStreaming: false }
                    : m
                )
              );
            } else if (data.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id
                    ? { ...m, content: `錯誤：${data.error}`, isStreaming: false }
                    : m
                )
              );
            }
          }
        }
      } catch (error: any) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMessage.id
              ? { ...m, content: `連線錯誤：${error.message}`, isStreaming: false }
              : m
          )
        );
      } finally {
        setIsLoading(false);
      }
    },
    [conversationId]
  );

  const loadHistory = useCallback((history: {
    id: string;
    role: string;
    content: string;
    skillPhase?: string | null;
  }[]) => {
    setMessages(
      history
        .filter((m) => m.role !== "SYSTEM")
        .map((m) => ({
          id: m.id,
          role: m.role as "USER" | "ASSISTANT",
          content: m.content,
          skillPhase: m.skillPhase ?? undefined,
        }))
    );
    const lastPhase = history.findLast((m) => m.skillPhase)?.skillPhase;
    if (lastPhase) setCurrentPhase(lastPhase);
  }, []);

  return { messages, isLoading, currentPhase, sendMessage, loadHistory };
}
