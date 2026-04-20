import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Алдымен тіркеліп кіріңіз" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const message = body?.message;

    if (!message || !String(message).trim()) {
      return NextResponse.json(
        { error: "Хабарлама бос" },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "OPENAI_API_KEY табылмады" },
        { status: 500 }
      );
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Сен нейрондық желілерді оқыту платформасындағы қазақ тіліндегі көмекші ассистентсің. Жауапты қысқа, түсінікті, нақты бер.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: 0.7,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            data?.error?.message ||
            "OpenAI серверінен жауап алу кезінде қате шықты",
        },
        { status: response.status }
      );
    }

    const reply =
      data?.choices?.[0]?.message?.content ||
      "Жауап алу мүмкін болмады.";

    return NextResponse.json({ reply });
  } catch (error) {
    return NextResponse.json(
      { error: "Сервер қатесі" },
      { status: 500 }
    );
  }
}