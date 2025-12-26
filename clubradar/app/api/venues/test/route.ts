import { NextResponse } from "next/server";

// Simple test route to verify routing works
export async function GET() {
  return NextResponse.json({ message: "Test route works!", status: "ok" });
}

