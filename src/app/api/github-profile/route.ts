import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const username = searchParams.get("username");

  if (!username) {
    return NextResponse.json(
      { error: "Missing username parameter" },
      { status: 400 },
    );
  }

  try {
    const headers: Record<string, string> = { "User-Agent": "RiceMe" };
    if (process.env.GITHUB_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.GITHUB_TOKEN}`;
    }

    const res = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}`,
      { headers },
    );

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json(
          { error: "User not found on GitHub" },
          { status: 404 },
        );
      }
      if (res.status === 403) {
        return NextResponse.json(
          { error: "Rate limited by GitHub. Try again later." },
          { status: 429 },
        );
      }
      return NextResponse.json(
        { error: `GitHub API error (${res.status})` },
        { status: res.status },
      );
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch GitHub profile" },
      { status: 500 },
    );
  }
}
