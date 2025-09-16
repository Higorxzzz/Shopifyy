import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const domain = searchParams.get("domain")

  if (!domain) {
    return NextResponse.json({ error: "Domain is required" }, { status: 400 })
  }

  try {
    const response = await fetch(`https://${domain}`, {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; StoreChecker/1.0)",
      },
      // Set timeout to prevent hanging
      signal: AbortSignal.timeout(10000),
    })

    return NextResponse.json({
      status: response.status,
      online: response.status >= 200 && response.status < 300,
    })
  } catch (error) {
    console.log("[v0] Store status check error:", error)
    return NextResponse.json({
      status: 0,
      online: false,
      error: "Network error or timeout",
    })
  }
}
