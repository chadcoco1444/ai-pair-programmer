"use client";

import { useState, useCallback, useRef, useEffect } from "react";

interface ResizablePanelsProps {
  top: React.ReactNode;
  bottom: React.ReactNode;
  defaultRatio?: number; // 0-1, top panel ratio
  minTopHeight?: number;
  minBottomHeight?: number;
}

export function ResizableVertical({
  top,
  bottom,
  defaultRatio = 0.6,
  minTopHeight = 100,
  minBottomHeight = 80,
}: ResizablePanelsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(defaultRatio);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "row-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const total = rect.height;
      const newRatio = Math.max(
        minTopHeight / total,
        Math.min(1 - minBottomHeight / total, y / total)
      );
      setRatio(newRatio);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minTopHeight, minBottomHeight]);

  return (
    <div ref={containerRef} className="flex h-full flex-col">
      <div style={{ height: `${ratio * 100}%` }} className="min-h-0 overflow-hidden">
        {top}
      </div>
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="group flex h-1.5 cursor-row-resize items-center justify-center bg-[#0a0a0f] hover:bg-blue-500/30"
      >
        <div className="h-0.5 w-8 rounded-full bg-gray-600 group-hover:bg-blue-400" />
      </div>
      <div style={{ height: `${(1 - ratio) * 100}%` }} className="min-h-0 overflow-hidden">
        {bottom}
      </div>
    </div>
  );
}

interface ResizableHorizontalProps {
  left: React.ReactNode;
  right: React.ReactNode;
  defaultRatio?: number;
  minLeftWidth?: number;
  minRightWidth?: number;
}

export function ResizableHorizontal({
  left,
  right,
  defaultRatio = 0.5,
  minLeftWidth = 300,
  minRightWidth = 300,
}: ResizableHorizontalProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ratio, setRatio] = useState(defaultRatio);
  const isDragging = useRef(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = true;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const total = rect.width;
      const newRatio = Math.max(
        minLeftWidth / total,
        Math.min(1 - minRightWidth / total, x / total)
      );
      setRatio(newRatio);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [minLeftWidth, minRightWidth]);

  return (
    <div ref={containerRef} className="flex h-full">
      <div style={{ width: `${ratio * 100}%` }} className="min-w-0 overflow-hidden">
        {left}
      </div>
      {/* Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="group flex w-1.5 cursor-col-resize items-center justify-center bg-[#0a0a0f] hover:bg-blue-500/30"
      >
        <div className="h-8 w-0.5 rounded-full bg-gray-600 group-hover:bg-blue-400" />
      </div>
      <div style={{ width: `${(1 - ratio) * 100}%` }} className="min-w-0 overflow-hidden">
        {right}
      </div>
    </div>
  );
}
