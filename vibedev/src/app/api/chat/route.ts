import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: NextRequest) {
  try {
    const { message, history, mode, activeFileContext } = await req.json();

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Use a powerful, fast model
      messages: [
        { role: "system", content: `You are VibeDev AI. Context: ${activeFileContext?.name || "none"}` },
        ...history.map((h: any) => ({ role: h.role, content: h.content })),
        { role: "user", content: message }
      ],
      temperature: 0.5,
    });

    return NextResponse.json({ response: completion.choices[0].message.content });
  } catch (error) {
    return NextResponse.json({ error: "Groq API error" }, { status: 500 });
  }
}