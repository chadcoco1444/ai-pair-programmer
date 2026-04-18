import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { SuggestionChips } from "@/components/chat/suggestion-chips";
import { SUGGESTION_PROMPTS } from "@/components/chat/suggestion-prompts";

describe("SuggestionChips", () => {
  it("renders a button for each prompt", () => {
    const onSelect = vi.fn();
    render(<SuggestionChips onSelect={onSelect} />);
    for (const p of SUGGESTION_PROMPTS) {
      expect(screen.getByRole("button", { name: new RegExp(p.label, "i") })).toBeInTheDocument();
    }
  });

  it("fires onSelect with the matching prompt when a chip is clicked", () => {
    const onSelect = vi.fn();
    render(<SuggestionChips onSelect={onSelect} />);
    const btn = screen.getByRole("button", { name: /approach/i });
    fireEvent.click(btn);
    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect).toHaveBeenCalledWith(
      SUGGESTION_PROMPTS.find((p) => p.id === "approach")
    );
  });

  it("does not fire onSelect when disabled", () => {
    const onSelect = vi.fn();
    render(<SuggestionChips onSelect={onSelect} disabled />);
    fireEvent.click(screen.getByRole("button", { name: /approach/i }));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("each chip has disabled attribute when disabled", () => {
    render(<SuggestionChips onSelect={vi.fn()} disabled />);
    for (const p of SUGGESTION_PROMPTS) {
      const btn = screen.getByRole("button", { name: new RegExp(p.label, "i") });
      expect(btn).toBeDisabled();
    }
  });
});
