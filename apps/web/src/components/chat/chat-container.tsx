"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { SuggestionChips } from "./suggestion-chips";
import type { SuggestionPrompt } from "./suggestion-prompts";
import { useChat } from "@/hooks/use-chat";

interface ChatContainerProps {
  conversationId: string;
  initialMessages?: {
    id: string;
    role: string;
    content: string;
    skillPhase?: string | null;
  }[];
  /** Returns current Monaco editor content for code-aware prompts. */
  getCurrentCode?: () => string;
  /** Current language label for fenced code block (e.g. "python", "javascript"). */
  currentLanguage?: string;
}

export function ChatContainer({
  conversationId,
  initialMessages,
  getCurrentCode,
  currentLanguage,
}: ChatContainerProps) {
  const { messages, isLoading, currentPhase, sendMessage, loadHistory } =
    useChat({ conversationId });
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialMessages) {
      loadHistory(initialMessages);
    }
  }, [initialMessages, loadHistory]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSuggestion = (p: SuggestionPrompt) => {
    let message = p.prompt;
    if (p.needsCode) {
      const code = getCurrentCode?.() ?? "";
      const lang = (currentLanguage ?? "").toLowerCase();
      message += `\n\n\`\`\`${lang}\n${code}\n\`\`\``;
    }
    sendMessage(message);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-4xl">
          {messages.map((msg) => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              skillPhase={msg.skillPhase}
              isStreaming={msg.isStreaming}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      </div>
      <SuggestionChips onSelect={handleSuggestion} disabled={isLoading} />
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
