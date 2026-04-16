"use client";

interface MacWindowProps {
  title?: string;
  titleColor?: string;
  children: React.ReactNode;
  className?: string;
}

export function MacWindow({ title, titleColor, children, className }: MacWindowProps) {
  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-gray-700/50 bg-[#1e1e1e] shadow-2xl ${className ?? ""}`}>
      {/* Title Bar */}
      <div className="flex h-9 items-center gap-2 border-b border-gray-700/50 bg-[#2d2d2d] px-3">
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
      {/* Content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}
