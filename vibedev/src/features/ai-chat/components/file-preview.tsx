"use client";

import React from "react";
import { FileCode, FileText } from "lucide-react";

interface EnhancedFilePreviewProps {
  fileName: string;
  language: string;
  size?: string;
}

export const EnhancedFilePreview: React.FC<EnhancedFilePreviewProps> = ({ fileName, language, size = "1.2 KB" }) => {
  return (
    <div className="flex items-center gap-3 p-2 rounded-md border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
      <div className="text-primary">
        {language === "javascript" || language === "typescript" ? (
          <FileCode className="w-4 h-4" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-zinc-200 truncate">{fileName}</p>
        <p className="text-[10px] text-zinc-500 uppercase">{language} • {size}</p>
      </div>
    </div>
  );
};