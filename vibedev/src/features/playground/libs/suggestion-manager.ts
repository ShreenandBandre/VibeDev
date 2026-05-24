import type { Monaco } from "@monaco-editor/react";
import type { editor as MonacoEditor, IDisposable } from "monaco-editor";

interface SuggestionCallbacks {
  onAccept: (editor: MonacoEditor.IStandaloneCodeEditor, monaco: Monaco) => void;
  onReject: (editor: MonacoEditor.IStandaloneCodeEditor) => void;
  onTrigger: (type: string, editor: MonacoEditor.IStandaloneCodeEditor) => void;
}

interface ActiveSuggestion {
  text: string;
  position: { line: number; column: number };
  id: string;
}

export class SuggestionManager {
  private editor: MonacoEditor.IStandaloneCodeEditor;
  private monaco: Monaco;
  private callbacks: SuggestionCallbacks;
  private activeSuggestion: ActiveSuggestion | null = null;
  private inlineProvider: IDisposable | null = null;
  private isAccepting = false;

  constructor(editor: MonacoEditor.IStandaloneCodeEditor, monaco: Monaco, callbacks: SuggestionCallbacks) {
    this.editor = editor;
    this.monaco = monaco;
    this.callbacks = callbacks;
  }

  showSuggestion(text: string, position: { line: number; column: number }): void {
    this.clearSuggestion();

    this.activeSuggestion = {
      text: text.replace(/\r/g, ""), 
      position,
      id: this.generateId(),
    };

    this.registerInlineProvider();

    setTimeout(() => {
      if (this.editor && this.activeSuggestion) {
        this.editor.trigger("ai-core-trigger", "editor.action.inlineSuggest.trigger", null);
      }
    }, 30);
  }

  clearSuggestion(): void {
    if (this.inlineProvider) {
      this.inlineProvider.dispose();
      this.inlineProvider = null;
    }
    this.activeSuggestion = null;
    if (this.editor) {
      this.editor.trigger("ai-core-hide", "editor.action.inlineSuggest.hide", null);
    }
  }

  acceptSuggestion(): boolean {
    if (!this.activeSuggestion || this.isAccepting) return false;
    this.isAccepting = true;

    try {
      const suggestion = this.activeSuggestion;
      const currentPosition = this.editor.getPosition();
      if (!currentPosition) return false;

      const range = new this.monaco.Range(
        suggestion.position.line,
        suggestion.position.column,
        currentPosition.lineNumber,
        currentPosition.column
      );

      const success = this.editor.executeEdits("vibe-ai-engine-accept", [
        {
          range,
          text: suggestion.text,
          forceMoveMarkers: true,
        },
      ]);

      if (!success) return false;

      const lines = suggestion.text.split("\n");
      const newLine = lines.length === 1 ? suggestion.position.line : suggestion.position.line + lines.length - 1;
      const newColumn = lines.length === 1 ? suggestion.position.column + suggestion.text.length : lines[lines.length - 1].length + 1;

      this.editor.setPosition({ lineNumber: newLine, column: newColumn });
      this.clearSuggestion();
      this.callbacks.onAccept(this.editor, this.monaco);
      return true;

    } catch (err) {
      console.error("Suggestion compilation error runtime:", err);
      return false;
    } finally {
      this.isAccepting = false;
    }
  }

  rejectSuggestion(): void {
    if (this.activeSuggestion) {
      this.clearSuggestion();
      this.callbacks.onReject(this.editor);
    }
  }

  private registerInlineProvider(): void {
    if (!this.activeSuggestion) return;

    const language = this.getEditorLanguage();
    this.inlineProvider = this.monaco.languages.registerInlineCompletionsProvider(language, {
      provideInlineCompletions: async (model: any, position: any) => {
        if (!this.activeSuggestion || this.isAccepting) return { items: [] };

        const isMatch =
          position.lineNumber === this.activeSuggestion.position.line &&
          position.column >= this.activeSuggestion.position.column &&
          position.column <= this.activeSuggestion.position.column + 10;

        if (!isMatch) return { items: [] };

        return {
          items: [
            {
              insertText: this.activeSuggestion.text,
              range: new this.monaco.Range(position.lineNumber, position.column, position.lineNumber, position.column),
              kind: this.monaco.languages.CompletionItemKind.Snippet,
              label: "AI Code Suggestion Token",
              detail: "CodeLlama predictive compilation",
              documentation: "Press Tab to accept into workspace disk layer.",
              sortText: "0000"
            },
          ],
        };
      },
      freeInlineCompletions: () => {},
    });
  }

  private getEditorLanguage(): string {
    const model = this.editor.getModel();
    return model ? model.getLanguageId() : "typescript";
  }

  private generateId(): string {
    return `node-prompt-token-${Math.random().toString(36).substring(2, 11)}`;
  }
}