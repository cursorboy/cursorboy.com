import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const data = await req.json()

    // Log the form submission
    console.log("Contact form submission:", data)

    // Simple implementation that doesn't require any API keys
    return NextResponse.json({
      message: "Thank you for your message! I'll get back to you soon.",
    })
  } catch (error) {
    console.error("Error processing contact form:", error)
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 })
  }
}

