import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Авторизация керек" }, { status: 401 });
    }

    const body = await req.json();
    const { lastMenu, lastTopic, percent } = body;

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "Қолданушы табылмады" }, { status: 404 });
    }

    const progress = await prisma.progress.upsert({
      where: { userId: user.id },
      update: {
        lastMenu,
        lastTopic,
        percent,
      },
      create: {
        userId: user.id,
        lastMenu,
        lastTopic,
        percent,
      },
    });

    return NextResponse.json(progress);
  } catch {
    return NextResponse.json({ error: "Сервер қатесі" }, { status: 500 });
  }
}