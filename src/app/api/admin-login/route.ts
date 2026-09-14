import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { password } = await request.json();

  if (password === process.env.REVIEW_PASSWORD) {
  return NextResponse.json({
    success: true,
    role: "review",
  });
}

if (password === process.env.ADMIN_PASSWORD) {
  return NextResponse.json({
    success: true,
    role: "admin",
  });
}

}