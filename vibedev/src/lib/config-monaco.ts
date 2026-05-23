// src/lib/config-monaco.ts
import { EditorProps } from "@monaco-editor/react";

export const getEditorLanguageByExtension = (fileName: string): string => {
  const extension = fileName.split('.').pop()?.toLowerCase();
  switch (extension) {
    case "js": case "jsx": return "javascript";
    case "ts": case "tsx": return "typescript";
    case "json": return "json";
    case "css": return "css";
    case "html": return "html";
    case "md": return "markdown";
    case "py": return "python";
    case "sql": return "sql";
    default: return "plaintext";
  }
};

export const defaultMonacoOptions: EditorProps["options"] = {
  fontSize: 13,
  fontFamily: "var(--font-mono), ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  fontWeight: "500",
  lineHeight: 20,
  
  // 🛰️ FEATURE 1: PREMIUM HIGH-CONTRAST LENS MINIMAP
  minimap: { 
    enabled: true, 
    side: "right",
    renderCharacters: false, // 🚀 Blocks fuzzy text rendering; drops in clean geometric blocks instead
    maxColumn: 80,
    showSlider: "mouseover"
  },
  
  // Inline ghost text placeholder support configuration logic
  inlineSuggest: {
    enabled: true,
    showToolbar: "always",
    mode: "prefix"
  },

  scrollBeyondLastLine: false,
  automaticLayout: true,
  wordWrap: "on",
  padding: { top: 12, bottom: 12 },
  glyphMargin: false,
  lineDecorationsWidth: 8,
  lineNumbersMinChars: 3,
  lineNumbers: "on",
  folding: true,
  tabSize: 2,
  insertSpaces: true,
  cursorBlinking: "smooth",
  cursorSmoothCaretAnimation: "on",
  smoothScrolling: true,
  renderLineHighlight: "all",
  matchBrackets: "always",
  autoClosingBrackets: "always",
  autoClosingQuotes: "always",
  acceptSuggestionOnEnter: "on",
  snippetSuggestions: "inline",
  scrollbar: {
    vertical: "visible",
    horizontal: "visible",
    verticalScrollbarSize: 8,
    horizontalScrollbarSize: 8,
    useShadows: false
  },
  hideCursorInOverviewRuler: true,
  overviewRulerBorder: false,
  contextmenu: true
};

export const handleEditorWillMount = (monaco: any) => {
  // ⚡ COMPILER OPTIMIZATION CHANNELS
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    noEmit: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    allowJs: true,
  });

  // 🛰️ FEATURE 2: CUSTOM TAILORED INTELLISENSE SUGGESTION MATRIX
  // Registers a global provider targeting Javascript/TypeScript files across your workspace
  const createCompletionProvider = (languageId: string) => ({
    provideCompletionItems: (model: any, position: any) => {
      const suggestions = [
        {
          label: 'vibe-useFetch',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'const { data, loading, error } = useFetch(`${1:url}`);',
            '$0'
          ].join('\n'),
          documentation: 'VibeDev reactive async data fetching pipeline segment hook.',
          range: null as any
        },
        {
          label: 'vibe-component',
          kind: monaco.languages.CompletionItemKind.Snippet,
          insertText: [
            'export default function ${1:Component}() {',
            '  return (',
            '    <div className="p-4 bg-zinc-900 text-white rounded-xl border border-zinc-800">',
            '      <h1>${1:Component} Active Element</h1>',
            '    </div>',
            '  );',
            '}'
          ].join('\n'),
          documentation: 'Premium architectural frontend template layout element container.',
          range: null as any
        },
        {
          label: 'vibe-serverSync',
          kind: monaco.languages.CompletionItemKind.Function,
          insertText: 'await syncWithCloudAtlas(playgroundId);',
          documentation: 'Triggers atomic database commit transactions down to persistent store tables.',
          range: null as any
        }
      ];
      return { suggestions };
    }
  });

  monaco.languages.registerCompletionItemProvider('javascript', createCompletionProvider('javascript'));
  monaco.languages.registerCompletionItemProvider('typescript', createCompletionProvider('typescript'));

  // 🌌 1. CUSTOM PITCH BLACK THEME
  monaco.editor.defineTheme("vibedev-midnight", {
    base: "vs-dark",
    inherit: true,
    rules: [
      { token: "comment", foreground: "4b5563", fontStyle: "italic" },
      { token: "keyword", foreground: "3b82f6", fontStyle: "bold" },
      { token: "identifier", foreground: "f4f4f5" },
      { token: "string", foreground: "10b981" },
      { token: "number", foreground: "a855f7" },
      { token: "type", foreground: "ec4899" },
    ],
    colors: {
      "editor.background": "#000000",
      "editor.foreground": "#f4f4f5",
      "editor.lineHighlightBackground": "#09090b",
      "editorCursor.foreground": "#3b82f6",
      "editorLineNumber.foreground": "#27272a",
      "editorLineNumber.activeForeground": "#71717a",
      "editorWidget.background": "#09090b",
      "editorWidget.border": "#18181b",
      "editorSuggestWidget.background": "#09090b", // Auto-complete popover windows match pitch black
      "editorSuggestWidget.border": "#1c1c1f",
      "editorSuggestWidget.selectedBackground": "#18181b",
    },
  });

  // ☀️ 2. CUSTOM CLEAN LIGHT THEME
  monaco.editor.defineTheme("vibedev-clean-light", {
    base: "vs",
    inherit: true,
    rules: [
      { token: "comment", foreground: "9ca3af", fontStyle: "italic" },
      { token: "keyword", foreground: "2563eb", fontStyle: "bold" },
      { token: "identifier", foreground: "1f2937" },
      { token: "string", foreground: "059669" },
      { token: "number", foreground: "7c3aed" },
      { token: "type", foreground: "db2777" },
    ],
    colors: {
      "editor.background": "#fafafa",
      "editor.foreground": "#1f2937",
      "editor.lineHighlightBackground": "#f4f4f5",
      "editorCursor.foreground": "#2563eb",
      "editorLineNumber.foreground": "#d4d4d8",
      "editorLineNumber.activeForeground": "#71717a",
      "editorWidget.background": "#ffffff",
      "editorWidget.border": "#e4e4e7",
    },
  });
};