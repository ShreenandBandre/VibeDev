"use client"

import React from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Progress } from "@/components/ui/progress"
import { Settings, SlidersHorizontal, ExternalLink, Sparkles, Loader2, Zap } from "lucide-react"
import { cn } from "@/lib/utils"

interface AISettingsDropdownProps {
  isAISuggestionsEnabled: boolean
  onToggleAISuggestions: (enabled: boolean) => void
  isCodeCompletionAllFilesEnabled: boolean
  onToggleCodeCompletionAllFiles: (enabled: boolean) => void
  isCodeCompletionTSXEnabled: boolean
  onToggleCodeCompletionTSX: (enabled: boolean) => void
  isNextEditSuggestionsEnabled: boolean
  onToggleNextEditSuggestions: (enabled: boolean) => void
  onTriggerAISuggestion: (type: string, mode: "overlay" | "inline") => void
  suggestionLoading: boolean
  activeFile: any 
}

export const AISettingsDropdown: React.FC<AISettingsDropdownProps> = ({
  isAISuggestionsEnabled,
  onToggleAISuggestions,
  isCodeCompletionAllFilesEnabled,
  onToggleCodeCompletionAllFiles,
  isCodeCompletionTSXEnabled,
  onToggleCodeCompletionTSX,
  isNextEditSuggestionsEnabled,
  onToggleNextEditSuggestions,
  onTriggerAISuggestion,
  suggestionLoading,
  activeFile,
}) => {
  // Local Mock usage diagnostics metrics to look exactly like high-end Copilot indices
  const codeCompletionsUsage = 12
  const chatMessagesUsage = 40
  const allowanceResetDate = "Next Month"

  return (
    <TooltipProvider>
      <DropdownMenu>
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                variant="outline"
                className="relative h-8 w-8 bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800"
              >
                <Sparkles 
                  className={cn("w-3.5 h-3.5 transition-colors", 
                    isAISuggestionsEnabled ? "text-purple-500 animate-pulse" : "text-zinc-400"
                  )} 
                />
                {!isAISuggestionsEnabled && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-4 h-0.5 bg-red-500/80 rotate-45 rounded-full" />
                  </div>
                )}
              </Button>
            </DropdownMenuTrigger>
          </TooltipTrigger>
          <TooltipContent className="font-mono text-xs">
            {isAISuggestionsEnabled ? "Disable AI Actions" : "Enable AI Actions"}
          </TooltipContent>
        </Tooltip>

        <DropdownMenuContent align="end" className="w-72 p-2 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 text-zinc-900 dark:text-zinc-100 shadow-2xl rounded-xl">
          {/* Copilot Usage Metrics Segment Section */}
          <DropdownMenuLabel className="flex items-center justify-between text-[10px] uppercase tracking-wider font-mono font-black text-zinc-400 dark:text-zinc-500 py-1.5 px-2">
            Local Inference Metrics
            <SlidersHorizontal className="h-3 w-3 opacity-60" />
          </DropdownMenuLabel>
          
          <div className="px-2 py-1 space-y-2.5">
            <div>
              <div className="text-xs font-mono font-medium flex items-center justify-between mb-1 text-zinc-500 dark:text-zinc-400">
                Ghost completions
                <span className="font-bold text-zinc-700 dark:text-zinc-300">{codeCompletionsUsage}%</span>
              </div>
              <Progress value={codeCompletionsUsage} className="h-1 bg-zinc-100 dark:bg-zinc-900" />
            </div>

            <div>
              <div className="text-xs font-mono font-medium flex items-center justify-between mb-1 text-zinc-500 dark:text-zinc-400">
                Contextual chat logs
                <span className="font-bold text-zinc-700 dark:text-zinc-300">{chatMessagesUsage}%</span>
              </div>
              <Progress value={chatMessagesUsage} className="h-1 bg-zinc-100 dark:bg-zinc-900" />
            </div>
            <p className="text-[10px] font-mono italic text-zinc-400/70 dark:text-zinc-600 mt-1">Local weights auto-calibrated dynamically.</p>
          </div>

          <DropdownMenuSeparator className="my-2 bg-zinc-100 dark:bg-zinc-900" />

          {/* Engine Parameters Toggles Checkbox Matrix */}
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider font-mono font-black text-zinc-400 dark:text-zinc-500 py-1 px-2">
            Feature Toggles
          </DropdownMenuLabel>
          <DropdownMenuCheckboxItem
            checked={isCodeCompletionAllFilesEnabled}
            onCheckedChange={onToggleCodeCompletionAllFiles}
            className="text-xs font-mono py-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-900 rounded-lg"
          >
            Predictive Autocomplete
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={isCodeCompletionTSXEnabled}
            onCheckedChange={onToggleCodeCompletionTSX}
            className="text-xs font-mono py-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-900 rounded-lg"
          >
            Strict Language Mappings
          </DropdownMenuCheckboxItem>
          <DropdownMenuCheckboxItem
            checked={isNextEditSuggestionsEnabled}
            onCheckedChange={onToggleNextEditSuggestions}
            className="text-xs font-mono py-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-900 rounded-lg"
          >
            Next-line Staging Token
          </DropdownMenuCheckboxItem>

          <DropdownMenuSeparator className="my-2 bg-zinc-100 dark:bg-zinc-900" />

          {/* Manual Completion Command Triggers */}
          <DropdownMenuLabel className="text-[10px] uppercase tracking-wider font-mono font-black text-zinc-400 dark:text-zinc-500 py-1 px-2">
            Manual Actions Matrix
          </DropdownMenuLabel>
          <DropdownMenuItem
            onClick={() => onTriggerAISuggestion("completion", "overlay")}
            disabled={!activeFile || suggestionLoading || !isAISuggestionsEnabled}
            className="flex items-center justify-between text-xs font-mono py-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-900 rounded-lg disabled:opacity-40"
          >
            Trigger Ghost text
            {suggestionLoading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-primary ml-2" />
            ) : (
              <span className="text-[10px] bg-zinc-100 dark:bg-zinc-900 px-1 py-0.5 rounded text-zinc-400 font-bold border border-zinc-200 dark:border-zinc-800">Ctrl+Space</span>
            )}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTriggerAISuggestion("function", "overlay")}
            disabled={!activeFile || suggestionLoading || !isAISuggestionsEnabled}
            className="text-xs font-mono py-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-900 rounded-lg disabled:opacity-40"
          >
            Generate Function Block
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => onTriggerAISuggestion("variable", "overlay")}
            disabled={!activeFile || suggestionLoading || !isAISuggestionsEnabled}
            className="text-xs font-mono py-1.5 cursor-pointer text-zinc-700 dark:text-zinc-300 focus:bg-zinc-100 dark:focus:bg-zinc-900 rounded-lg disabled:opacity-40"
          >
            Map Global Constants
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TooltipProvider>
  )
}