import { NextResponse } from "next/server";

import { authOptions } from '@/lib/auth'
export async function GET() {
  return NextResponse.json({ message: "Hello, world!" });
}