"use client";

import { useState } from "react";

interface MacWindowProps {
  title?: string;
  titleColor?: string;
  children: React.ReactNode;
  className?: string;
  onMaximize?: () => void;
}

export function MacWindow({ title, titleColor, children, className, onMaximize }: MacWindowProps) {
  const [folded, setFolded] = useState(false);

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-gray-700/50 bg-[#1e1e1e] shadow-2xl ${className ?? ""}`}>
      {/* Title Bar */}
      <div className="flex h-9 items-center justify-between border-b border-gray-700/50 bg-[#2d2d2d] px-3">
        <div className="flex items-center gap-2">
          {/* Traffic Lights */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-[#ff5f57] shadow-inner" />
            <div className="h-3 w-3 rounded-full bg-[#febc2e] shadow-inner" />
            <div className="h-3 w-3 rounded-full bg-[#28c840] shadow-inner" />
          </div>
          {title && (
            <span className={`ml-2 text-[12px] font-medium ${titleColor ?? "text-gray-400"}`}>
              {title}
            </span>
          )}
        </div>
        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          {onMaximize && (
            <button
              onClick={onMaximize}
              className="rounded p-1 text-gray-500 hover:bg-[#3d3d3d] hover:text-gray-300"
              title="Maximize"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="2" width="10" height="10" rx="1" />
              </svg>
            </button>
          )}
          <button
            onClick={() => setFolded(!folded)}
            className="rounded p-1 text-gray-500 hover:bg-[#3d3d3d] hover:text-gray-300"
            title={folded ? "Expand" : "Collapse"}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
              {folded ? (
                <polyline points="4,5 7,8 10,5" />
              ) : (
                <polyline points="4,8 7,5 10,8" />
              )}
            </svg>
          </button>
        </div>
      </div>
      {/* Content */}
      {!folded && (
        <div className="flex flex-1 flex-col overflow-hidden">
          {children}
        </div>
      )}
    </div>
  );
}
