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
  minimap: { enabled: false },
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
  // ⚡ ENABLE DIAGNOSTICS & COGNITIVE LINING RULES
  monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
    target: monaco.languages.typescript.ScriptTarget.ES2020,
    allowNonTsExtensions: true,
    moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
    module: monaco.languages.typescript.ModuleKind.CommonJS,
    noEmit: true,
    jsx: monaco.languages.typescript.JsxEmit.React,
    jsxFactory: "React.createElement",
    reactNamespace: "React",
    allowJs: true,
    typeRoots: ["node_modules/@types"]
  });

  // Strict structural linter evaluation setup parameters
  monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false, // 🚀 Surfacing instant wavy underlines for bugs!
  });

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