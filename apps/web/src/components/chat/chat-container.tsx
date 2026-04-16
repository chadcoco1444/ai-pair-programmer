"use client";

import { useEffect, useRef } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { useChat } from "@/hooks/use-chat";

interface ChatContainerProps {
  conversationId: string;
  initialMessages?: {
    id: string;
    role: string;
    content: string;
    skillPhase?: string | null;
  }[];
}

export function ChatContainer({ conversationId, initialMessages }: ChatContainerProps) {
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
      <ChatInput onSend={sendMessage} disabled={isLoading} />
    </div>
  );
}
