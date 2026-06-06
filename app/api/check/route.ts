import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const env = {
    AUTH_SECRET: !!process.env.AUTH_SECRET,
    AUTH_GOOGLE_ID: !!process.env.AUTH_GOOGLE_ID,
    AUTH_GOOGLE_SECRET: !!process.env.AUTH_GOOGLE_SECRET,
    AUTH_URL: process.env.AUTH_URL,
    DATABASE_URL: !!process.env.DATABASE_URL,
    DIRECT_URL: !!process.env.DIRECT_URL,
  };

  try {
    await prisma.user.findMany({ take: 1 });

    return NextResponse.json({
      ok: true,
      env,
      database: "connected",
    });
  } catch (error) {
    return NextResponse.json({
      ok: false,
      env,
      database: "error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}