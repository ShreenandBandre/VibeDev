import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize Groq client (using OpenAI SDK compatible with Groq)
const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { textBeforeCursor, textAfterCursor } = await req.json();

    if (!textBeforeCursor) {
      return NextResponse.json({ completion: "" });
    }

    // FIM (Fill-In-the-Middle) prompt for Llama 3 models
    const prompt = `<|fim_prefix|>${textBeforeCursor}<|fim_suffix|>${textAfterCursor}<|fim_middle|>`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Or "llama-3.1-8b-instant" for even faster speeds
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 64, // Keep it short for fast autocomplete
      stop: ["<|file_separator|>", "<|file_separator|>", "\n", "```"]
    });

    const rawCompletion = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ 
      completion: rawCompletion.replace(/<\|file_separator\|>/g, "").trim() 
    });
  } catch (error) {
    console.error("GROQ_AUTOCOMPLETE_ERROR:", error);
    return NextResponse.json({ completion: "" }, { status: 500 });
  }
}