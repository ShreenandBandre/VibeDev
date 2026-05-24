// src/app/api/ai/autocomplete/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { textBeforeCursor, textAfterCursor, filename } = await req.json();

    if (!textBeforeCursor) {
      return NextResponse.json({ completion: "" });
    }

    // 🚀 CODELLAMA SPECIFIC FILL-IN-THE-MIDDLE (FIM) PROMPT STRUCTURE
    // CodeLlama expects: <PRE> code_before <SUF> code_after <MID>
    const prompt = `<PRE> ${textBeforeCursor} <SUF>${textAfterCursor} <MID>`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 800); // Bumped to 800ms for 7B weight scaling

    try {
      const ollamaResponse = await fetch("http://localhost:11434/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          model: "codellama:7b-code", // 🚀 MODEL UPDATE
          prompt: prompt,
          options: {
            num_predict: 24,       
            num_ctx: 2048,         
            temperature: 0.1,      
            top_p: 0.9,
            // 🚀 CODELLAMA HARD STOP TOKENS
            stop: ["<PRE>", "<SUF>", "<MID>", "\n", "```", "<EOT>"] 
          },
          stream: false
        }),
      });

      clearTimeout(timeoutId);

      if (!ollamaResponse.ok) {
        throw new Error("Ollama service communication breakdown.");
      }

      const data = await ollamaResponse.json();
      let rawCompletion = data.response || "";

      // Scrub carriage returns so Monaco indentation blocks match up cleanly
      rawCompletion = rawCompletion.replace(/\r/g, "");

      return NextResponse.json({ completion: rawCompletion });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === "AbortError") {
        console.warn("⚠️ CodeLlama inference stalled past timeout limits.");
        return NextResponse.json({ completion: "" });
      }
      throw fetchError;
    }
  } catch (error) {
    console.error("AI_AUTOCOMPLETE_EXCEPTION:", error);
    return NextResponse.json({ completion: "" }, { status: 500 });
  }
}